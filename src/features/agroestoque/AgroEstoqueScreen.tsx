import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { calculateStockBalance } from '../../modules/agroestoque/stockLedger';
import type { StockMovement, StockMovementType } from '../../modules/agroestoque/models';
import { appendRecord, readCollection, removeRecord } from '../../core/storage/localStore';
import { createId } from '../../core/utils/id';
import { formatDateTimeBR, formatNumberBR, parseLocaleNumber } from '../../core/utils/format';
import { buildStockReport } from '../../core/utils/reports';
import { shareViaWhatsApp } from '../../core/utils/whatsapp';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import type { AppPalette } from '../../core/theme/palette';
import { useAppTheme } from '../../appcore/theme/ThemeContext';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { NeonInput } from '../../ui/NeonInput';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';

type FormState = {
  itemName: string;
  quantity: string;
  unit: StockMovement['unit'];
  note: string;
};

const emptyForm: FormState = { itemName: '', quantity: '', unit: 'kg', note: '' };

const unitOptions: StockMovement['unit'][] = ['kg', 'l', 'bag', 'unit'];

export function AgroEstoqueScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const scrollRef = useRef<ScrollView | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    readCollection<StockMovement>('stockLedger').then(setMovements);
  }, []);

  const balances = useMemo(() => calculateStockBalance(movements), [movements]);

  async function saveMovement(type: StockMovementType) {
    if (!form.itemName.trim()) {
      Alert.alert('Item obrigatório', 'Informe o nome do item.');
      return;
    }
    const quantity = parseLocaleNumber(form.quantity);
    if (quantity <= 0) {
      Alert.alert('Quantidade inválida', 'A quantidade precisa ser maior que zero.');
      return;
    }
    const record: StockMovement = {
      id: createId('mov'),
      itemName: form.itemName.trim(),
      quantity,
      unit: form.unit,
      type,
      note: form.note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    await appendRecord('stockLedger', record);
    setMovements(await readCollection<StockMovement>('stockLedger'));
    setForm({ ...emptyForm, itemName: form.itemName, unit: form.unit });
  }

  async function handleRemove(id: string) {
    await removeRecord('stockLedger', id);
    setMovements(await readCollection<StockMovement>('stockLedger'));
  }

  async function handleShare() {
    if (movements.length === 0 && balances.length === 0) {
      Alert.alert('Sem dados', 'Registre pelo menos um movimento antes de compartilhar.');
      return;
    }
    await shareViaWhatsApp(buildStockReport(movements, balances));
  }

  function selectItemFromBalance(itemName: string, unit: StockMovement['unit']) {
    setForm((s) => ({ ...s, itemName, unit, quantity: '' }));
    // Sobe o scroll para o form ficar visível no topo
    try {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch {
      /* silencioso */
    }
  }

  const formHasSelectedItem = form.itemName.trim().length > 0;

  return (
    <Screen scroll={false}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          kicker="Ferramenta local"
          title="AgroEstoque"
          subtitle="Toque em um item para dar entrada ou saída rápida"
          accent={palette.fieldGold}
        />

        <PrimaryButton
          label="Compartilhar balanço no WhatsApp"
          onPress={handleShare}
          icon="whatsapp"
          variant="secondary"
        />

        <Card
          title={formHasSelectedItem ? `Movimentar: ${form.itemName.toUpperCase()}` : 'Novo movimento'}
          accent={palette.fieldGold}
        >
          <NeonInput
            label="Item"
            value={form.itemName}
            onChangeText={(t) => setForm((s) => ({ ...s, itemName: t }))}
            placeholder="Ex.: Ureia"
            autoCapitalize="words"
          />
          <NeonInput
            label="Quantidade"
            value={form.quantity}
            onChangeText={(t) => setForm((s) => ({ ...s, quantity: t }))}
            placeholder="0,00"
            keyboardType="decimal-pad"
          />

          <Text style={styles.groupLabel}>Unidade</Text>
          <View style={styles.chipRow}>
            {unitOptions.map((unit) => (
              <Chip
                key={unit}
                palette={palette}
                label={unit.toUpperCase()}
                selected={form.unit === unit}
                onPress={() => setForm((s) => ({ ...s, unit }))}
              />
            ))}
          </View>

          <NeonInput
            label="Observação (opcional)"
            value={form.note}
            onChangeText={(t) => setForm((s) => ({ ...s, note: t }))}
            placeholder="Ex.: Nota fiscal 1234"
          />

          <View style={styles.actionsRow}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="+ Entrada"
                onPress={() => saveMovement('inbound')}
                icon="arrow-down-bold"
                variant="primary"
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="- Saída"
                onPress={() => saveMovement('outbound')}
                icon="arrow-up-bold"
                variant="danger"
              />
            </View>
          </View>

          <View style={{ height: spacing.sm }} />

          <PrimaryButton
            label="± Ajuste"
            onPress={() => saveMovement('adjustment')}
            icon="cog-outline"
            variant="ghost"
          />

          {formHasSelectedItem ? (
            <>
              <View style={{ height: spacing.sm }} />
              <PrimaryButton
                label="Limpar seleção"
                onPress={() => setForm(emptyForm)}
                icon="close"
                variant="ghost"
                fullWidth
              />
            </>
          ) : null}
        </Card>

        <Text style={styles.sectionTitle}>Saldo atual (toque para movimentar)</Text>
        {balances.length === 0 ? (
          <EmptyState
            icon="warehouse"
            title="Galpão vazio"
            description="Registre uma entrada acima para começar o balanço offline."
          />
        ) : (
          <View style={styles.balanceGrid}>
            {balances.map((balance) => {
              const isSelected =
                form.itemName.trim().toLowerCase() === balance.itemName.toLowerCase() &&
                form.unit === balance.unit;
              return (
                <Pressable
                  key={`${balance.itemName}:${balance.unit}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${balance.itemName}, ${balance.quantity} ${balance.unit}. Toque para movimentar`}
                  onPress={() => selectItemFromBalance(balance.itemName, balance.unit)}
                  style={({ pressed }) => [
                    styles.balanceCard,
                    isSelected && { borderColor: palette.fieldGold, borderWidth: 2 },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.balanceHeader}>
                    <Text style={styles.balanceItem}>{balance.itemName}</Text>
                    <MaterialCommunityIcons name="pencil-outline" size={14} color={palette.textMuted} />
                  </View>
                  <Text style={[styles.balanceQty, balance.quantity < 0 && { color: palette.danger }]}>
                    {formatNumberBR(balance.quantity)} {balance.unit}
                  </Text>
                  <Text style={styles.balanceHint}>Toque para +entrada / -saída</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Movimentos ({movements.length})</Text>
        {movements.length === 0 ? null : (
          <FlatList
            data={movements}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            renderItem={({ item }) => {
              const label = item.type === 'inbound' ? 'Entrada' : item.type === 'outbound' ? 'Saída' : 'Ajuste';
              const color =
                item.type === 'inbound' ? palette.success : item.type === 'outbound' ? palette.danger : palette.fieldGold;
              const sign = item.type === 'outbound' ? '-' : item.type === 'inbound' ? '+' : '±';
              return (
                <Pressable
                  onPress={() => selectItemFromBalance(item.itemName, item.unit)}
                  style={({ pressed }) => [styles.movementCard, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.movementHeader}>
                    <Text style={styles.movementTitle}>{item.itemName}</Text>
                    <Text style={[styles.movementBadge, { color }]}>{label}</Text>
                  </View>
                  <Text style={styles.movementBody}>
                    {sign} {formatNumberBR(item.quantity)} {item.unit} · {formatDateTimeBR(item.createdAt)}
                  </Text>
                  {item.note ? <Text style={styles.movementNote}>{item.note}</Text> : null}
                  <PrimaryButton
                    label="Remover"
                    variant="ghost"
                    icon="trash-can-outline"
                    onPress={() =>
                      Alert.alert('Remover movimento', `Excluir "${item.itemName}"?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Remover', style: 'destructive', onPress: () => handleRemove(item.id) },
                      ])
                    }
                  />
                </Pressable>
              );
            }}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function Chip({
  palette,
  label,
  selected,
  onPress,
  accent,
}: {
  palette: AppPalette;
  label: string;
  selected: boolean;
  onPress: () => void;
  accent?: string;
}) {
  const color = accent ?? palette.neonBlue;
  return (
    <Text
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderColor: selected ? color : palette.border,
        color: selected ? color : palette.textSecondary,
        backgroundColor: selected ? 'rgba(33,212,253,0.08)' : palette.surface,
        borderRadius: 999,
        borderWidth: 1,
        fontSize: typography.caption,
        fontWeight: '900',
        letterSpacing: 0.5,
        overflow: 'hidden',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Text>
  );
}

const createStyles = (palette: AppPalette) =>
  StyleSheet.create({
    groupLabel: {
      color: palette.textSecondary,
      fontSize: typography.caption,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
      textTransform: 'uppercase',
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    sectionTitle: {
      color: palette.textPrimary,
      fontSize: typography.sectionTitle,
      fontWeight: '900',
      marginBottom: spacing.md,
      marginTop: spacing.md,
    },
    balanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    balanceCard: {
      backgroundColor: palette.surfaceRaised,
      borderColor: palette.border,
      borderRadius: 12,
      borderWidth: 1,
      flexBasis: '48%',
      padding: spacing.md,
    },
    balanceHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    balanceItem: {
      color: palette.textSecondary,
      flex: 1,
      fontSize: typography.caption,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    balanceQty: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900' },
    balanceHint: {
      color: palette.textMuted,
      fontSize: 10,
      fontStyle: 'italic',
      marginTop: spacing.xs,
    },
    movementCard: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: 12,
      borderWidth: 1,
      padding: spacing.lg,
    },
    movementHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    movementTitle: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900' },
    movementBadge: { fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
    movementBody: { color: palette.textSecondary, fontSize: typography.body, fontWeight: '700', marginBottom: spacing.xs },
    movementNote: {
      color: palette.textMuted,
      fontSize: typography.caption,
      fontStyle: 'italic',
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
  });
