import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import type { ChatMessage } from '../../../modules/agrotalk/models';
import { readCollection, writeCollection } from '../../../core/storage/localStore';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export const AUDIO_RECORDING_PRESET: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 24000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.IOSAudioQuality.LOW,
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 24000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 24000,
  },
};

let currentRecording: Audio.Recording | null = null;
let currentSound: Audio.Sound | null = null;
let audioModeReady = false;

async function ensureAudioMode(recording: boolean) {
  if (audioModeReady) return;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: recording,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  audioModeReady = true;
}

export async function startRecording(): Promise<void> {
  if (currentRecording) return;
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permissão de microfone negada.');
  }
  await ensureAudioMode(true);
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(AUDIO_RECORDING_PRESET);
  await recording.startAsync();
  currentRecording = recording;
}

export async function stopRecording(): Promise<{ uri: string; durationMs: number } | null> {
  const recording = currentRecording;
  if (!recording) return null;
  currentRecording = null;
  try {
    await recording.stopAndUnloadAsync();
    const status = await recording.getStatusAsync();
    const uri = recording.getURI();
    if (!uri) return null;
    return {
      uri,
      durationMs: status.durationMillis ?? 0,
    };
  } catch {
    return null;
  }
}

export function isRecording(): boolean {
  return currentRecording !== null;
}

export async function playAudio(uri: string): Promise<void> {
  await stopPlayback();
  await ensureAudioMode(false);
  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
  currentSound = sound;
  sound.setOnPlaybackStatusUpdate((status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      void stopPlayback();
    }
  });
}

export async function stopPlayback(): Promise<void> {
  const sound = currentSound;
  currentSound = null;
  if (!sound) return;
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch {
    /* silencioso */
  }
}

function computeExpiresAt(now = new Date()): string {
  return new Date(now.getTime() + FORTY_EIGHT_HOURS_MS).toISOString();
}

export function annotateAudioExpiration(now = new Date()): string {
  return computeExpiresAt(now);
}

/** Remove arquivos e mensagens de áudio expirados (não marcados como "Salvos"). */
export async function purgeExpiredChatAudio(now = new Date()): Promise<number> {
  const messages = await readCollection<ChatMessage>('chatMessages');
  let removed = 0;
  const next: ChatMessage[] = [];
  for (const message of messages) {
    if (!message.audioUri || message.audioSaved || !message.audioExpiresAt) {
      next.push(message);
      continue;
    }
    const expired = new Date(message.audioExpiresAt).getTime() <= now.getTime();
    if (!expired) {
      next.push(message);
      continue;
    }
    try {
      if (message.audioUri.startsWith('file://')) {
        await FileSystem.deleteAsync(message.audioUri, { idempotent: true });
      }
    } catch {
      /* silencioso: mesmo se falhar, seguimos removendo o registro */
    }
    next.push({
      ...message,
      audioUri: undefined,
      audioExpiresAt: undefined,
      body: message.body ?? '(Áudio expirado após 48h — refaça o download quando disponível)',
    });
    removed += 1;
  }
  if (removed > 0) {
    await writeCollection('chatMessages', next);
  }
  return removed;
}
