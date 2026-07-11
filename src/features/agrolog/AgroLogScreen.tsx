import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import type { AgroLogEntry } from '../../modules/agrolog/models';
import { appendRecord, readCollection, removeRecord, updateRecord } from '../../core/storage/localStore';
import { createId } from '../../core/utils/id';
import { formatDateTimeBR } from '../../core/utils/format';
import { buildAgroLogReport } from '../../core/utils/reports';
import { shareViaWhatsApp } from '../../core/utils/whatsapp';
import { palette } from '../../core/theme/palette';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import { useSession } from '../../appcore/session/SessionContext';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { NeonInput } from '../../ui/NeonInput';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';

type FormState = {
  fieldName: string;
  activity: string;
  notes: string;
};

const emptyForm: FormState = { fieldName: '', activity: '', notes: '' };

export function AgroLogScreen() {
  const { session } = useSession();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [entries, setEntries] = useState<AgroLogEntry[]>([]);

  useEffect(() => {
    readCollection<AgroLogEntry>('agroLog').then(setEntries);
  }, []);

  async function handleStart() {
    if (!form.fieldName.trim() || !form.activity.trim()) {
      Alert.alert('Preencha talhão e atividade', 'Informe o talhão e a atividade em execução.');
      return;
    }
    const record: AgroLogEntry = {
      id: createId('log'),
      workerId: session?.displayName ?? 'anonimo',
      fieldName: form.fieldName.trim(),
      activity: form.activity.trim(),
      notes: form.notes.trim() || undefined,
      startedAt: new Date().toISOString(),
    };
    await appendRecord('agroLog', record);
    setEntries(await readCollection<AgroLogEntry>('agroLog'));
    setForm(emptyForm);
  }

  async function handleFinish(id: string) {
    await updateRecord<AgroLogEntry>('agroLog', id, { finishedAt: new Date().toISOString() });
    setEntries(await readCollection<AgroLogEntry>('agroLog'));
  }

  async function handleRemove(id: string) {
    await removeRecord('agroLog', id);
    setEntries(await readCollection<AgroLogEntry>('agroLog'));
  }

  async function handleShare() {
    if (entries.length === 0) {
      Alert.alert('Sem registros', 'Registre pelo menos uma atividade antes de compartilhar.');
      return;
    }
    const header = `AgroLog · ${session?.displayName ?? 'Trabalhador'}`;
    await shareViaWhatsApp(buildAgroLogReport(entries, header));
  }

  return (
    <Screen>
      <ScreenHeader
        kicker="Diário de bordo"
        title="AgroLog"
        subtitle="Registre horas e atividades por talhão"
        accent={palette.success}
      />

      <PrimaryButton
        label="Compartilhar relatório no WhatsApp"
        onPress={handleShare}
        icon="whatsapp"
        variant="secondary"
      />

      <Card title="Nova atividade" accent={palette.success}>
        <NeonInput
          label="Talhão"
          value={form.fieldName}
          onChangeText={(text) => setForm((s) => ({ ...s, fieldName: text }))}
          placeholder="Ex.: Talhão 3"
          autoCapitalize="words"
        />
        <NeonInput
          label="Atividade"
          value={form.activity}
          onChangeText={(text) => setForm((s) => ({ ...s, activity: text }))}
          placeholder="Ex.: Pulverização"
          autoCapitalize="sentences"
        />
        <NeonInput
          label="Observações (opcional)"
          value={form.notes}
          onChangeText={(text) => setForm((s) => ({ ...s, notes: text }))}
          placeholder="Ex.: EPI conferido, vento leve"
          multiline
        />
        <PrimaryButton label="Iniciar atividade" onPress={handleStart} icon="play-circle-outline" />
      </Card>

      <Text style={styles.sectionTitle}>Registros ({entries.length})</Text>

      {entries.length === 0 ? (
        <EmptyState
          icon="clipboard-text-clock-outline"
          title="Sem atividades ainda"
          description="Registre a primeira atividade para começar seu diário offline."
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => {
            const inProgress = !item.finishedAt;
            return (
              <View style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{item.activity}</Text>
                  <Text style={[styles.status, { color: inProgress ? palette.fieldGold : palette.success }]}>
                    {inProgress ? 'Em curso' : 'Concluída'}
                  </Text>
                </View>
                <Text style={styles.entryMeta}>
                  {item.fieldName} · {formatDateTimeBR(item.startedAt)}
                  {item.finishedAt ? ` → ${formatDateTimeBR(item.finishedAt)}` : ''}
                </Text>
                {item.notes ? <Text style={styles.entryNote}>{item.notes}</Text> : null}
                <View style={styles.entryActions}>
                  {inProgress ? (
                    <PrimaryButton
                      label="Finalizar"
                      onPress={() => handleFinish(item.id)}
                      icon="check-circle-outline"
                      variant="secondary"
                    />
                  ) : null}
                  <PrimaryButton
                    label="Remover"
                    variant="ghost"
                    icon="trash-can-outline"
                    onPress={() =>
                      Alert.alert('Remover atividade', `Excluir "${item.activity}"?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Remover', style: 'destructive', onPress: () => handleRemove(item.id) },
                      ])
                    }
                  />
                </View>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  entry: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.lg,
  },
  entryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  entryTitle: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
  },
  status: {
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  entryMeta: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  entryNote: {
    color: palette.textMuted,
    fontSize: typography.caption,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  entryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
