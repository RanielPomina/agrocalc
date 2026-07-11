import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import type { AgroTalkNotice } from '../../modules/agrotalk/models';
import { appendRecord, readCollection, removeRecord } from '../../core/storage/localStore';
import { enqueueOutboxItem } from '../../core/sync/outbox';
import { createId } from '../../core/utils/id';
import { formatRelativeTime } from '../../core/utils/format';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import type { AppPalette } from '../../core/theme/palette';
import { useAppTheme } from '../../appcore/theme/ThemeContext';
import { useSession } from '../../appcore/session/SessionContext';
import { usePlan } from '../../appcore/plan/PlanContext';
import type { ScreenProps } from '../../appcore/navigation/types';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { NeonInput } from '../../ui/NeonInput';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { purgeExpiredChatAudio } from './audio/audioService';

type FormState = { title: string; body: string };
const emptyForm: FormState = { title: '', body: '' };

type Props = ScreenProps<'AgroTalk'>;

export function AgroTalkScreen({ navigation }: Props) {
  const { session } = useSession();
  const { plan } = usePlan();
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const isAdmin = session?.role === 'admin';
  const [form, setForm] = useState<FormState>(emptyForm);
  const [notices, setNotices] = useState<AgroTalkNotice[]>([]);

  useEffect(() => {
    void purgeExpiredChatAudio();
    readCollection<AgroTalkNotice>('notices').then(setNotices);
  }, []);

  async function handlePublish() {
    if (!isAdmin) return;
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert('Preencha título e mensagem', 'Título e corpo do aviso são obrigatórios.');
      return;
    }
    const notice: AgroTalkNotice = {
      id: createId('notice'),
      groupId: session?.groupCode ?? 'solo-demo',
      title: form.title.trim(),
      body: form.body.trim(),
      authorName: session?.displayName ?? 'Admin',
      createdAt: new Date().toISOString(),
    };
    await appendRecord('notices', notice);
    await enqueueOutboxItem({
      id: createId('out'),
      groupId: notice.groupId,
      type: 'notice',
      priority: 'notice',
      payload: notice as unknown as Record<string, unknown>,
      createdAt: notice.createdAt,
      attempts: 0,
    });
    setNotices(await readCollection<AgroTalkNotice>('notices'));
    setForm(emptyForm);
    Alert.alert('Aviso publicado', 'Fica local e vai para a fila de sincronização (Cloud/AgroSync Local).');
  }

  async function handleRemove(id: string) {
    await removeRecord('notices', id);
    setNotices(await readCollection<AgroTalkNotice>('notices'));
  }

  return (
    <Screen>
      <ScreenHeader kicker="Mural AgroTalk" title="AgroTalk" subtitle={isAdmin ? 'Publique avisos para toda a equipe' : 'Avisos e prioridades do patrão'} accent={palette.fieldGold} />

      <PrimaryButton label={plan.talkProEnabled ? 'Abrir Chat da equipe' : 'Chat + Áudio (Talk Pro)'} onPress={() => navigation.navigate('AgroTalkChat')} icon="chat-processing-outline" variant="secondary" />

      {isAdmin ? (
        <Card title="Novo aviso do patrão" accent={palette.fieldGold}>
          <NeonInput label="Título" value={form.title} onChangeText={(t) => setForm((s) => ({ ...s, title: t }))} placeholder="Ex.: Pulverização liberada" autoCapitalize="sentences" />
          <NeonInput label="Mensagem" value={form.body} onChangeText={(t) => setForm((s) => ({ ...s, body: t }))} placeholder="Ex.: Talhão 3 após as 16h. Conferir EPI antes de iniciar." multiline style={{ minHeight: 120, textAlignVertical: 'top' }} />
          <PrimaryButton label="Publicar aviso prioritário" onPress={handlePublish} icon="bullhorn-variant-outline" />
        </Card>
      ) : (
        <Card title="Somente leitura" accent={palette.textSecondary}>
          <Text style={styles.body}>Apenas o patrão publica avisos no mural. Você recebe os avisos aqui e no card fixo da Home.</Text>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Avisos publicados ({notices.length})</Text>
      {notices.length === 0 ? (
        <EmptyState icon="bullhorn-variant-outline" title="Sem avisos ainda" description={isAdmin ? 'Publique o primeiro aviso para toda a equipe.' : 'Quando o patrão publicar um aviso, ele aparece aqui.'} />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <View style={styles.notice}>
              <View style={styles.noticeHeader}>
                <Text style={styles.noticeTitle}>{item.title}</Text>
                <Text style={styles.noticeTime}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.noticeBody}>{item.body}</Text>
              <Text style={styles.noticeAuthor}>Enviado por {item.authorName}</Text>
              {isAdmin ? (
                <PrimaryButton label="Remover" variant="ghost" icon="trash-can-outline" onPress={() => Alert.alert('Remover aviso', `Excluir "${item.title}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => handleRemove(item.id) }])} />
              ) : null}
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const createStyles = (palette: AppPalette) =>
  StyleSheet.create({
    body: { color: palette.textSecondary, fontSize: typography.body, fontWeight: '600', lineHeight: 22 },
    sectionTitle: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900', marginBottom: spacing.md, marginTop: spacing.md },
    notice: { backgroundColor: palette.fieldGold, borderRadius: 12, padding: spacing.lg },
    noticeHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    noticeTitle: { color: palette.black, flex: 1, fontSize: typography.sectionTitle, fontWeight: '900' },
    noticeTime: { color: '#3C2500', fontSize: typography.caption, fontWeight: '800' },
    noticeBody: { color: '#201700', fontSize: typography.body, fontWeight: '700', lineHeight: 22, marginBottom: spacing.sm },
    noticeAuthor: { color: '#4B3300', fontSize: typography.caption, fontWeight: '700', marginBottom: spacing.sm },
  });
