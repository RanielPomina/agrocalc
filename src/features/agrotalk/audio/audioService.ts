import type { ChatMessage } from '../../../modules/agrotalk/models';
import { readCollection, writeCollection } from '../../../core/storage/localStore';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

/**
 * Lazy loader do expo-av. Evita crash no bundle-load caso a lib esteja
 * indisponível (ex.: web) ou depreciada em SDK futuro.
 */
async function loadAv(): Promise<any> {
  try {
    // require em runtime para não quebrar bundle-time se módulo faltar
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-av');
    return mod;
  } catch (error) {
    throw new Error('Módulo de áudio indisponível neste dispositivo.');
  }
}

async function loadFs(): Promise<any> {
  // expo-file-system 19 (SDK 57) mudou a API. Tentamos primeiro o módulo legacy,
  // depois o novo, ambos oferecem deleteAsync/deleteAsync-like.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-file-system/legacy');
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('expo-file-system');
    } catch {
      return null;
    }
  }
}

let currentRecording: any = null;
let currentSound: any = null;
let audioModeReady = false;

async function ensureAudioMode(recording: boolean) {
  if (audioModeReady) return;
  const { Audio, InterruptionModeAndroid, InterruptionModeIOS } = await loadAv();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: recording,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: InterruptionModeIOS?.DoNotMix ?? 1,
    interruptionModeAndroid: InterruptionModeAndroid?.DoNotMix ?? 1,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  audioModeReady = true;
}

function buildRecordingPreset(Audio: any) {
  return {
    isMeteringEnabled: false,
    android: {
      extension: '.m4a',
      outputFormat: Audio.AndroidOutputFormat?.MPEG_4 ?? 2,
      audioEncoder: Audio.AndroidAudioEncoder?.AAC ?? 3,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 24000,
    },
    ios: {
      extension: '.m4a',
      audioQuality: Audio.IOSAudioQuality?.LOW ?? 0x20,
      outputFormat: Audio.IOSOutputFormat?.MPEG4AAC ?? 'aac ',
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
}

export async function startRecording(): Promise<void> {
  if (currentRecording) return;
  const { Audio } = await loadAv();
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permissão de microfone negada.');
  }
  await ensureAudioMode(true);
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(buildRecordingPreset(Audio));
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
  const { Audio } = await loadAv();
  await ensureAudioMode(false);
  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
  currentSound = sound;
  sound.setOnPlaybackStatusUpdate((status: any) => {
    if (!status?.isLoaded) return;
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
  const fs = await loadFs();
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
      if (fs && message.audioUri.startsWith('file://')) {
        if (typeof fs.deleteAsync === 'function') {
          await fs.deleteAsync(message.audioUri, { idempotent: true });
        } else if (fs.File) {
          try {
            new fs.File(message.audioUri).delete();
          } catch {
            /* silencioso */
          }
        }
      }
    } catch {
      /* silencioso */
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
