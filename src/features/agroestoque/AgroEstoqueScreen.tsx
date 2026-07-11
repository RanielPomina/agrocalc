import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

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
  type: StockMovementType;
  note: string;
};

const emptyForm: FormState = { itemName: '', quantity: '', unit: 'kg', type: 'inbound', note: '' };

const unitOptions: StockMovement['unit'][] = ['kg', 'l', 'bag', 'unit'];

export function AgroEstoqueScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const typeOptions = useMemo(
    () => [
      { value: 'inbound' as StockMovementType, label: 'Entrada', accent: palette.success },
      { value: 'outbound' as StockMovementType, label: 'Saída', accent: palette.danger },
      { value: 'adjustment' as StockMovementType, label: 'Ajuste', accent: palette.fieldGold },
    ],
    [palette],
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    readCollection<StockMovement>('stockLedger').then(setMovements);
  }, []);

  const balances = useMemo(() => calculateStockBalance(movements), [movements]);

  async function handleSave() {
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
      type: form.type,
      note: form.note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    await appendRecord('stockLedger', record);
    setMovements(await readCollection<StockMovement>('stockLedger'));
    setForm({ ...emptyForm, unit: form.unit, type: form.type });
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

  return (
    <Screen>
      <ScreenHeader kicker="Ferramenta local" title="AgroEstoque" subtitle="Balanço de galpão offline por entradas e saídas" accent={palette.fieldGold} />

      <PrimaryButton label="Compartilhar balanço no WhatsApp" onPress={handleShare} icon="whatsapp" variant="secondary" />

      <Card title="Novo movimento" accent={palette.fieldGold}>
        <NeonInput label="Item" value={form.itemName} onChangeText={(t) => setForm((s) => ({ ...s, itemName: t }))} placeholder="Ex.: Ureia" autoCapitalize="words" />
        <NeonInput label="Quantidade" value={form.quantity} onChangeText={(t) => setForm((s) => ({ ...s, quantity: t }))} placeholder="0,00" keyboardType="decimal-pad" />

        <Text style={styles.groupLabel}>Unidade</Text>
        <View style={styles.chipRow}>
          {unitOptions.map((unit) => (
            <Chip key={unit} palette={palette} label={unit.toUpperCase()} selected={form.unit === unit} onPress={() => setForm((s) => ({ ...s, unit }))} />
          ))}
        </View>

        <Text style={styles.groupLabel}>Tipo</Text>
        <View style={styles.chipRow}>
          {typeOptions.map((option) => (
            <Chip key={option.value} palette={palette} label={option.label} accent={option.accent} selected={form.type === option.value} onPress={() => setForm((s) => ({ ...s, type: option.value }))} />
          ))}
        </View>

        <NeonInput label="Observação (opcional)" value={form.note} onChangeText={(t) => setForm((s) => ({ ...s, note: t }))} placeholder="Ex.: Nota fiscal 1234" />

        <PrimaryButton label="Registrar movimento" onPress={handleSave} icon="plus" />
      </Card>

      <Text style={styles.sectionTitle}>Saldo atual</Text>
      {balances.length === 0 ? (
        <EmptyState icon="warehouse" title="Galpão vazio" description="Registre uma entrada para começar o balanço offline." />
      ) : (
        <View style={styles.balanceGrid}>
          {balances.map((balance) => (
            <View key={`${balance.itemName}:${balance.unit}`} style={styles.balanceCard}>
              <Text style={styles.balanceItem}>{balance.itemName}</Text>
              <Text style={[styles.balanceQty, balance.quantity < 0 && { color: palette.danger }]}>
                {formatNumberBR(balance.quantity)} {balance.unit}
              </Text>
            </View>
          ))}
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
            const meta = typeOptions.find((opt) => opt.value === item.type);
            const sign = item.type === 'outbound' ? '-' : item.type === 'inbound' ? '+' : '±';
            return (
              <View style={styles.movementCard}>
                <View style={styles.movementHeader}>
                  <Text style={styles.movementTitle}>{item.itemName}</Text>
                  <Text style={[styles.movementBadge, { color: meta?.accent }]}>{meta?.label ?? item.type}</Text>
                </View>
                <Text style={styles.movementBody}>{sign} {formatNumberBR(item.quantity)} {item.unit} · {formatDateTimeBR(item.createdAt)}</Text>
                {item.note ? <Text style={styles.movementNote}>{item.note}</Text> : null}
                <PrimaryButton label="Remover" variant="ghost" icon="trash-can-outline" onPress={() => Alert.alert('Remover movimento', `Excluir "${item.itemName}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => handleRemove(item.id) }])} />
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

function Chip({ palette, label, selected, onPress, accent }: { palette: AppPalette; label: string; selected: boolean; onPress: () => void; accent?: string }) {
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
    groupLabel: { color: palette.textSecondary, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.8, marginBottom: spacing.xs, marginTop: spacing.sm, textTransform: 'uppercase' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    sectionTitle: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900', marginBottom: spacing.md, marginTop: spacing.md },
    balanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    balanceCard: { backgroundColor: palette.surfaceRaised, borderColor: palette.border, borderRadius: 12, borderWidth: 1, flexBasis: '48%', padding: spacing.md },
    balanceItem: { color: palette.textSecondary, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.5, marginBottom: spacing.xs, textTransform: 'uppercase' },
    balanceQty: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900' },
    movementCard: { backgroundColor: palette.surface, borderColor: palette.border, borderRadius: 12, borderWidth: 1, padding: spacing.lg },
    movementHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    movementTitle: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900' },
    movementBadge: { fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
    movementBody: { color: palette.textSecondary, fontSize: typography.body, fontWeight: '700', marginBottom: spacing.xs },
    movementNote: { color: palette.textMuted, fontSize: typography.caption, fontStyle: 'italic', fontWeight: '600', marginBottom: spacing.sm },
  });
