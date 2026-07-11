import type { AgroTalkAudio, AgroTalkNotice } from './models';

const fortyEightHoursMs = 48 * 60 * 60 * 1000;

export function getAudioExpiration(downloadedAt: Date): string {
  return new Date(downloadedAt.getTime() + fortyEightHoursMs).toISOString();
}

export function shouldDeleteAudio(audio: AgroTalkAudio, now = new Date()): boolean {
  if (audio.saved || !audio.expiresAt) {
    return false;
  }

  return new Date(audio.expiresAt).getTime() <= now.getTime();
}

export const currentNotice: AgroTalkNotice = {
  id: 'notice-demo',
  groupId: 'solo-demo',
  title: 'Aviso do Patrao',
  body: 'Pulverizacao liberada no Talhao 3 apos as 16h. Conferir EPI antes de iniciar.',
  authorName: 'Admin AgroSafra',
  createdAt: new Date().toISOString(),
};