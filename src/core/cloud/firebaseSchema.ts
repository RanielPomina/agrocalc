export const firestoreCollections = {
  groups: 'groups',
  notices: 'notices',
  members: 'members',
  chatMessages: 'chatMessages',
} as const;

export type FirebaseGroupDocument = {
  ownerId: string;
  name: string;
  plan: 'operational' | 'talk-pro';
  memberLimit: number;
  createdAt: string;
};

export type FirebaseChatMessageDocument = {
  groupId: string;
  authorId: string;
  body?: string;
  audioUrl?: string;
  priority: boolean;
  createdAt: string;
  expiresAt: string;
};