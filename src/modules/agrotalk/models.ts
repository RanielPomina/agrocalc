export type AgroTalkRole = 'admin' | 'worker';

export type AgroTalkNotice = {
  id: string;
  groupId: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export type AgroTalkAudio = {
  id: string;
  remoteUrl: string;
  localPath?: string;
  codec: 'opus' | 'aac';
  bitrateKbps: number;
  saved: boolean;
  downloadedAt?: string;
  expiresAt?: string;
};

export type AgroTalkMember = {
  id: string;
  displayName: string;
  role: AgroTalkRole;
  canSendPriorityMessage: boolean;
};

export type ChatMessage = {
  id: string;
  groupId: string;
  authorName: string;
  authorRole: AgroTalkRole;
  body?: string;
  audioUri?: string;
  audioDurationMs?: number;
  audioCodec?: 'aac' | 'opus';
  audioSaved?: boolean;
  audioExpiresAt?: string;
  priority: boolean;
  createdAt: string;
};