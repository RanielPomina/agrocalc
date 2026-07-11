import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import type { TaskItem, TaskPriority } from '../../modules/agrotarefas/models';
import { appendRecord, readCollection, removeRecord, updateRecord } from '../../core/storage/localStore';
import { createId } from '../../core/utils/id';
import { formatDateTimeBR, formatRelativeTime } from '../../core/utils/format';
import { radius, spacing, touchTarget } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import type { AppPalette } from '../../core/theme/palette';
import { useAppTheme } from '../../appcore/theme/ThemeContext';
import { useSession } from '../../appcore/session/SessionContext';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { NeonInput } from '../../ui/NeonInput';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';

type FormState = { title: string; fieldName: string; notes: string; priority: TaskPriority };
const emptyForm: FormState = { title: '', fieldName: '', notes: '', priority: 'normal' };

type Tab = 'add' | 'list';

export function AgroTarefasScreen() {
  const { session } = useSession();
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const isAdmin = session?.role === 'admin';
  const [tab, setTab] = useState<Tab>('list');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const reload = async () => {
    const list = await readCollection<TaskItem>('tasks');
    list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.done && a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setTasks(list);
  };

  useEffect(() => {
    void reload();
  }, []);

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  async function handleAdd() {
    if (!form.title.trim()) {
      Alert.alert('Título obrigatório', 'Escreva o que precisa ser feito.');
      return;
    }
    const record: TaskItem = {
      id: createId('task'),
      title: form.title.trim(),
      fieldName: form.fieldName.trim() || undefined,
      notes: form.notes.trim() || undefined,
      priority: form.priority,
      done: false,
      createdAt: new Date().toISOString(),
    };
    await appendRecord('tasks', record);
    setForm(emptyForm);
    await reload();
    setTab('list');
  }

  async function handleToggle(item: TaskItem) {
    await updateRecord<TaskItem>('tasks', item.id, {
      done: !item.done,
      completedAt: !item.done ? new Date().toISOString() : undefined,
    });
    await reload();
  }

  async function handleRemove(id: string) {
    await removeRecord('tasks', id);
    await reload();
  }

  async function handleClearDone() {
    if (done.length === 0) return;
    Alert.alert('Limpar concluídas', `Remover ${done.length} tarefa(s) concluída(s)?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          for (const t of done) {
            await removeRecord('tasks', t.id);
          }
          await reload();
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScreenHeader
        kicker="Objetivos e checklist"
        title="AgroTarefas"
        subtitle={isAdmin ? 'Crie tarefas para o dia e marque quando concluir' : 'Sua checklist do dia'}
        accent={palette.neonPurple}
      />

      <View style={styles.tabsRow}>
        <TabButton
          palette={palette}
          icon="plus-circle-outline"
          label="Adicionar"
          active={tab === 'add'}
          onPress={() => setTab('add')}
        />
        <TabButton
          palette={palette}
          icon="format-list-checks"
          label={`Lista${pending.length > 0 ? ` (${pending.length})` : ''}`}
          active={tab === 'list'}
          onPress={() => setTab('list')}
        />
      </View>

      {tab === 'add' ? (
        <Card title="Nova tarefa" accent={palette.neonPurple}>
          <NeonInput
            label="O que fazer"
            value={form.title}
            onChangeText={(t) => setForm((s) => ({ ...s, title: t }))}
            placeholder="Ex.: Passar veneno no talhão 3"
            autoCapitalize="sentences"
          />
          <NeonInput
            label="Local / talhão (opcional)"
            value={form.fieldName}
            onChangeText={(t) => setForm((s) => ({ ...s, fieldName: t }))}
            placeholder="Ex.: Talhão 3"
            autoCapitalize="words"
          />
          <NeonInput
            label="Observações (opcional)"
            value={form.notes}
            onChangeText={(t) => setForm((s) => ({ ...s, notes: t }))}
            placeholder="Ex.: Levar EPI completo"
            multiline
          />

          <View style={styles.priorityRow}>
            <Text style={[styles.priorityLabel, { color: palette.danger }]}>Prioridade alta ⚠</Text>
            <Switch
              value={form.priority === 'high'}
              onValueChange={(v) => setForm((s) => ({ ...s, priority: v ? 'high' : 'normal' }))}
              thumbColor={form.priority === 'high' ? palette.danger : palette.textSecondary}
              trackColor={{ true: '#7a1e2b', false: palette.border }}
            />
          </View>

          <PrimaryButton label="Adicionar tarefa" onPress={handleAdd} icon="plus-circle-outline" />
        </Card>
      ) : (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Pendentes ({pending.length})</Text>
            {done.length > 0 ? (
              <Pressable onPress={handleClearDone}>
                <Text style={[styles.clearLink, { color: palette.textMuted }]}>
                  Limpar {done.length} feita(s)
                </Text>
              </Pressable>
            ) : null}
          </View>

          {pending.length === 0 ? (
            <EmptyState
              icon="check-circle-outline"
              title="Nenhuma pendente"
              description={
                tasks.length === 0
                  ? 'Toque na aba "Adicionar" para criar sua primeira tarefa.'
                  : 'Tudo em dia! Adicione uma nova tarefa quando precisar.'
              }
            />
          ) : (
            <FlatList
              data={pending}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
              renderItem={({ item }) => (
                <TaskCard palette={palette} task={item} onToggle={handleToggle} onRemove={handleRemove} />
              )}
            />
          )}

          {done.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Concluídas ({done.length})</Text>
              <FlatList
                data={done}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                renderItem={({ item }) => (
                  <TaskCard palette={palette} task={item} onToggle={handleToggle} onRemove={handleRemove} />
                )}
              />
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function TabButton({
  palette,
  icon,
  label,
  active,
  onPress,
}: {
  palette: AppPalette;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          backgroundColor: active ? palette.neonPurple : palette.surface,
          borderColor: active ? palette.neonPurple : palette.border,
          borderRadius: radius.md,
          borderWidth: 1,
          flex: 1,
          flexDirection: 'row',
          gap: spacing.sm,
          justifyContent: 'center',
          minHeight: touchTarget.medium,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={20} color={active ? palette.background : palette.textPrimary} />
      <Text
        style={{
          color: active ? palette.background : palette.textPrimary,
          fontSize: typography.button,
          fontWeight: '900',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TaskCard({
  palette,
  task,
  onToggle,
  onRemove,
}: {
  palette: AppPalette;
  task: TaskItem;
  onToggle: (task: TaskItem) => void;
  onRemove: (id: string) => void;
}) {
  const isHigh = task.priority === 'high' && !task.done;
  return (
    <View
      style={{
        backgroundColor: task.done ? palette.surfaceRaised : palette.surface,
        borderColor: isHigh ? palette.danger : palette.border,
        borderRadius: 12,
        borderWidth: 1,
        padding: spacing.md,
        opacity: task.done ? 0.6 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
          accessibilityLabel={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
          onPress={() => onToggle(task)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: task.done ? palette.success : isHigh ? palette.danger : palette.neonBlue,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: task.done ? palette.success : 'transparent',
            marginTop: 2,
          }}
        >
          {task.done ? (
            <MaterialCommunityIcons name="check" size={22} color={palette.background} />
          ) : null}
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: palette.textPrimary,
              fontSize: typography.body,
              fontWeight: '800',
              textDecorationLine: task.done ? 'line-through' : 'none',
            }}
          >
            {isHigh ? '⚠ ' : ''}
            {task.title}
          </Text>
          {task.fieldName ? (
            <Text style={{ color: palette.textSecondary, fontSize: typography.caption, fontWeight: '700', marginTop: 2 }}>
              📍 {task.fieldName}
            </Text>
          ) : null}
          {task.notes ? (
            <Text style={{ color: palette.textMuted, fontSize: typography.caption, fontStyle: 'italic', marginTop: 4 }}>
              {task.notes}
            </Text>
          ) : null}
          <Text style={{ color: palette.textMuted, fontSize: typography.caption, marginTop: 6 }}>
            Criada {formatRelativeTime(task.createdAt)}
            {task.done && task.completedAt ? ` · Concluída em ${formatDateTimeBR(task.completedAt)}` : ''}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remover tarefa"
          onPress={() => onRemove(task.id)}
          style={{ padding: spacing.xs }}
        >
          <MaterialCommunityIcons name="close" size={20} color={palette.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (palette: AppPalette) =>
  StyleSheet.create({
    tabsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    priorityRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    priorityLabel: { fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.5 },
    sectionHeaderRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: palette.textPrimary,
      fontSize: typography.sectionTitle,
      fontWeight: '900',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    clearLink: { fontSize: typography.caption, fontWeight: '800', textTransform: 'uppercase' },
  });
