import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, Vibration, View } from 'react-native';

import type { ChatMessage } from '../../modules/agrotalk/models';
import { useSession } from '../../appcore/session/SessionContext';
import { usePlan } from '../../appcore/plan/PlanContext';
import { appendRecord, readCollection, updateRecord } from '../../core/storage/localStore';
import { enqueueOutboxItem } from '../../core/sync/outbox';
import { createId } from '../../core/utils/id';
import { formatRelativeTime } from '../../core/utils/format';
import { palette } from '../../core/theme/palette';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { NeonInput } from '../../ui/NeonInput';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';
import {
  annotateAudioExpiration,
  isRecording,
  playAudio,
  purgeExpiredChatAudio,
  startRecording,
  stopPlayback,
  stopRecording,
} from './audio/audioService';

const PRIORITY_VIBRATION_PATTERN = [0, 200, 100, 200, 100, 400];

export function ChatScreen() {
  const { session } = useSession();
  const { plan } = usePlan();
  const talkProEnabled = plan.talkProEnabled;
  const isAdmin = session?.role === 'admin';
  const groupId = session?.groupCode ?? 'solo-demo';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const lastPriorityId = useRef<string | null>(null);

  const reload = useCallback(async () => {
    const list = await readCollection<ChatMessage>('chatMessages');
    setMessages(list);
    const incomingPriority = list.find(
      (msg) => msg.priority && msg.authorName !== session?.displayName,
    );
    if (incomingPriority && incomingPriority.id !== lastPriorityId.current) {
      lastPriorityId.current = incomingPriority.id;
      try {
        Vibration.vibrate(PRIORITY_VIBRATION_PATTERN);
      } catch {
        /* silencioso: alguns emuladores não suportam */
      }
    }
  }, [session?.displayName]);

  useEffect(() => {
    void purgeExpiredChatAudio().finally(reload);
    return () => {
      void stopPlayback();
    };
  }, [reload]);

  const enqueueMessage = useCallback(
    async (message: ChatMessage) => {
      await appendRecord('chatMessages', message);
      await enqueueOutboxItem({
        id: createId('out'),
        groupId: message.groupId,
        type: 'chat-message',
        priority: message.priority ? 'priority' : 'normal',
        payload: message as unknown as Record<string, unknown>,
        createdAt: message.createdAt,
        attempts: 0,
      });
      await reload();
    },
    [reload],
  );

  const handleSendText = useCallback(async () => {
    if (!text.trim()) {
      Alert.alert('Mensagem vazia', 'Escreva algo antes de enviar.');
      return;
    }
    if (priority && !isAdmin) {
      Alert.alert('Sem permissão', 'Apenas o patrão pode enviar mensagens prioritárias.');
      return;
    }
    const message: ChatMessage = {
      id: createId('msg'),
      groupId,
      authorName: session?.displayName ?? 'Anônimo',
      authorRole: session?.role ?? 'worker',
      body: text.trim(),
      priority,
      createdAt: new Date().toISOString(),
    };
    setText('');
    setPriority(false);
    await enqueueMessage(message);
  }, [text, priority, isAdmin, groupId, session?.displayName, session?.role, enqueueMessage]);

  const handleToggleRecording = useCallback(async () => {
    if (!talkProEnabled) {
      Alert.alert('Talk Pro necessário', 'Assine o plano Talk Pro para enviar áudios inteligentes.');
      return;
    }
    if (recording || isRecording()) {
      setRecording(false);
      const result = await stopRecording();
      if (!result) {
        Alert.alert('Gravação falhou', 'Não conseguimos salvar o áudio.');
        return;
      }
      if (priority && !isAdmin) {
        Alert.alert('Sem permissão', 'Apenas o patrão pode enviar áudios prioritários.');
        return;
      }
      const now = new Date();
      const message: ChatMessage = {
        id: createId('msg'),
        groupId,
        authorName: session?.displayName ?? 'Anônimo',
        authorRole: session?.role ?? 'worker',
        audioUri: result.uri,
        audioDurationMs: result.durationMs,
        audioCodec: 'aac',
        audioSaved: false,
        audioExpiresAt: annotateAudioExpiration(now),
        priority,
        createdAt: now.toISOString(),
      };
      setPriority(false);
      await enqueueMessage(message);
      return;
    }

    try {
      await startRecording();
      setRecording(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Não deu para gravar', msg);
    }
  }, [
    talkProEnabled,
    recording,
    priority,
    isAdmin,
    groupId,
    session?.displayName,
    session?.role,
    enqueueMessage,
  ]);

  const handlePlay = useCallback(async (message: ChatMessage) => {
    if (!message.audioUri) return;
    try {
      setPlayingId(message.id);
      await playAudio(message.audioUri);
    } catch {
      Alert.alert('Áudio indisponível', 'Não conseguimos reproduzir esse áudio agora.');
      setPlayingId(null);
    }
  }, []);

  const handleToggleSave = useCallback(
    async (message: ChatMessage) => {
      await updateRecord<ChatMessage>('chatMessages', message.id, {
        audioSaved: !message.audioSaved,
      });
      await reload();
    },
    [reload],
  );

  return (
    <Screen
      footer={
        <>
          <NeonInput
            label={recording ? 'Gravando áudio...' : 'Mensagem'}
            value={text}
            onChangeText={setText}
            placeholder={
              recording ? 'Toque no microfone para finalizar' : 'Escreva ou grave um áudio'
            }
            editable={!recording}
            multiline
          />

          {isAdmin ? (
            <View style={styles.priorityRow}>
              <Text style={styles.priorityLabel}>Marcar como PRIORITÁRIA</Text>
              <Switch
                value={priority}
                onValueChange={setPriority}
                thumbColor={priority ? palette.danger : palette.textSecondary}
                trackColor={{ true: '#7a1e2b', false: palette.border }}
              />
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={recording ? 'Parar e enviar áudio' : 'Gravar áudio'}
                onPress={handleToggleRecording}
                icon={recording ? 'stop-circle-outline' : 'microphone-outline'}
                variant={recording ? 'danger' : 'secondary'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Enviar texto"
                onPress={handleSendText}
                icon="send-outline"
                disabled={recording}
              />
            </View>
          </View>
        </>
      }
    >
      <ScreenHeader
        kicker="Chat da equipe"
        title="AgroTalk Chat"
        subtitle={
          talkProEnabled
            ? isAdmin
              ? 'Envie textos e áudios (marque prioridade quando urgente)'
              : 'Receba avisos do patrão em tempo real'
            : 'Chat de texto disponível. Áudio requer Talk Pro.'
        }
        accent={palette.neonPurple}
      />

      {!talkProEnabled ? (
        <Card title="Talk Pro" accent={palette.fieldGold}>
          <Text style={styles.helper}>
            Para gravar e enviar áudios com compressão AAC/Opus + expiração automática em 48h,
            assine o plano Talk Pro.
          </Text>
        </Card>
      ) : null}

      {messages.length === 0 ? (
        <EmptyState
          icon="chat-outline"
          title="Sem mensagens ainda"
          description={isAdmin ? 'Envie a primeira mensagem para a equipe.' : 'Aguarde mensagens do patrão.'}
        />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isPlaying={playingId === item.id}
              onPlay={handlePlay}
              onToggleSave={handleToggleSave}
            />
          )}
        />
      )}
    </Screen>
  );
}

function MessageBubble({
  message,
  isPlaying,
  onPlay,
  onToggleSave,
}: {
  message: ChatMessage;
  isPlaying: boolean;
  onPlay: (message: ChatMessage) => void;
  onToggleSave: (message: ChatMessage) => void;
}) {
  const audioExpired = message.audioExpiresAt && new Date(message.audioExpiresAt).getTime() <= Date.now();
  const backgroundColor = message.priority
    ? palette.danger
    : message.authorRole === 'admin'
    ? palette.fieldGold
    : palette.surface;
  const textColor = message.priority || message.authorRole === 'admin' ? palette.black : palette.textPrimary;

  return (
    <View style={[styles.bubble, { backgroundColor }]}>
      <View style={styles.bubbleHeader}>
        <Text style={[styles.bubbleAuthor, { color: textColor }]}>
          {message.authorRole === 'admin' ? '👑 ' : ''}
          {message.authorName}
        </Text>
        {message.priority ? (
          <Text style={styles.priorityBadge}>⚠ PRIORITÁRIA</Text>
        ) : (
          <Text style={[styles.bubbleTime, { color: textColor }]}>
            {formatRelativeTime(message.createdAt)}
          </Text>
        )}
      </View>

      {message.body ? (
        <Text style={[styles.bubbleBody, { color: textColor }]}>{message.body}</Text>
      ) : null}

      {message.audioUri && !audioExpired ? (
        <View style={styles.audioRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Reproduzindo' : 'Reproduzir áudio'}
            onPress={() => onPlay(message)}
            style={styles.audioButton}
          >
            <MaterialCommunityIcons
              name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
              size={32}
              color={textColor}
            />
            <Text style={[styles.audioMeta, { color: textColor }]}>
              Áudio ({Math.round((message.audioDurationMs ?? 0) / 1000)}s · AAC)
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={message.audioSaved ? 'Marcado como salvo' : 'Marcar como salvo'}
            onPress={() => onToggleSave(message)}
          >
            <MaterialCommunityIcons
              name={message.audioSaved ? 'bookmark-check' : 'bookmark-outline'}
              size={24}
              color={textColor}
            />
          </Pressable>
        </View>
      ) : null}

      {audioExpired ? (
        <Text style={[styles.audioExpired, { color: textColor }]}>
          🕒 Áudio expirado (48h). Baixar novamente quando disponível.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  helper: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
  priorityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  priorityLabel: {
    color: palette.danger,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bubble: {
    borderRadius: 12,
    padding: spacing.md,
  },
  bubbleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  bubbleAuthor: {
    fontSize: typography.caption,
    fontWeight: '900',
  },
  bubbleTime: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  bubbleBody: {
    fontSize: typography.body,
    fontWeight: '700',
    lineHeight: 22,
  },
  priorityBadge: {
    color: palette.textPrimary,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  audioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  audioButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  audioMeta: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  audioExpired: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
});
