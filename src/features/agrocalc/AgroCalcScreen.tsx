import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { calculateAgroInputs } from '../../modules/agrocalc/calculator';
import type { AgroCalcRecord, AgroCalcResult } from '../../modules/agrocalc/models';
import { appendRecord, readCollection, removeRecord } from '../../core/storage/localStore';
import { createId } from '../../core/utils/id';
import { formatCurrencyBRL, formatDateTimeBR, formatNumberBR, parseLocaleNumber } from '../../core/utils/format';
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
  crop: string;
  area: string;
  seed: string;
  cost: string;
  yield: string;
};

const emptyForm: FormState = { crop: '', area: '', seed: '', cost: '', yield: '' };

export function AgroCalcScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [history, setHistory] = useState<AgroCalcRecord[]>([]);
  const [lastResult, setLastResult] = useState<AgroCalcResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    readCollection<AgroCalcRecord>('agrocalcHistory').then(setHistory);
  }, []);

  const preview = useMemo(() => {
    const record: AgroCalcRecord = {
      id: 'preview',
      crop: form.crop || 'Cultura',
      areaHectares: parseLocaleNumber(form.area),
      seedKgPerHectare: parseLocaleNumber(form.seed),
      inputCostPerHectare: parseLocaleNumber(form.cost),
      expectedYieldBagsPerHectare: parseLocaleNumber(form.yield),
      createdAt: new Date().toISOString(),
    };
    return calculateAgroInputs(record);
  }, [form]);

  async function handleSave() {
    if (!form.crop.trim()) {
      Alert.alert('Cultura obrigatória', 'Informe o nome da cultura antes de salvar.');
      return;
    }
    const area = parseLocaleNumber(form.area);
    if (area <= 0) {
      Alert.alert('Área inválida', 'A área em hectares precisa ser maior que zero.');
      return;
    }

    setSaving(true);
    const record: AgroCalcRecord = {
      id: createId('calc'),
      crop: form.crop.trim(),
      areaHectares: area,
      seedKgPerHectare: parseLocaleNumber(form.seed),
      inputCostPerHectare: parseLocaleNumber(form.cost),
      expectedYieldBagsPerHectare: parseLocaleNumber(form.yield),
      createdAt: new Date().toISOString(),
    };
    await appendRecord('agrocalcHistory', record);
    const list = await readCollection<AgroCalcRecord>('agrocalcHistory');
    setHistory(list);
    setLastResult(calculateAgroInputs(record));
    setForm(emptyForm);
    setSaving(false);
  }

  async function handleRemove(id: string) {
    await removeRecord('agrocalcHistory', id);
    setHistory(await readCollection<AgroCalcRecord>('agrocalcHistory'));
  }

  return (
    <Screen>
      <ScreenHeader
        kicker="Ferramenta local"
        title="AgroCalc"
        subtitle="Insumos, sementes e rendimento por hectare"
        accent={palette.neonBlue}
      />

      <Card title="Nova conta" accent={palette.neonBlue}>
        <NeonInput label="Cultura" value={form.crop} onChangeText={(t) => setForm((s) => ({ ...s, crop: t }))} placeholder="Ex.: Soja" autoCapitalize="words" />
        <NeonInput label="Área (hectares)" value={form.area} onChangeText={(t) => setForm((s) => ({ ...s, area: t }))} placeholder="0,00" keyboardType="decimal-pad" />
        <NeonInput label="Semente por hectare (kg)" value={form.seed} onChangeText={(t) => setForm((s) => ({ ...s, seed: t }))} placeholder="0" keyboardType="decimal-pad" />
        <NeonInput label="Custo de insumos por hectare (R$)" value={form.cost} onChangeText={(t) => setForm((s) => ({ ...s, cost: t }))} placeholder="0,00" keyboardType="decimal-pad" />
        <NeonInput label="Rendimento esperado (sacas/ha)" value={form.yield} onChangeText={(t) => setForm((s) => ({ ...s, yield: t }))} placeholder="0" keyboardType="decimal-pad" />

        <View style={styles.previewRow}>
          <PreviewMetric palette={palette} label="Semente total" value={`${formatNumberBR(preview.totalSeedKg)} kg`} />
          <PreviewMetric palette={palette} label="Custo total" value={formatCurrencyBRL(preview.totalInputCost)} />
          <PreviewMetric palette={palette} label="Colheita" value={`${formatNumberBR(preview.expectedYieldBags, 0)} sc`} />
        </View>

        <PrimaryButton label={saving ? 'Salvando...' : 'Salvar cálculo'} onPress={handleSave} icon="content-save-outline" loading={saving} />
      </Card>

      {lastResult ? (
        <Card title="Último salvo" accent={palette.success}>
          <Text style={styles.resultLine}>Semente total: {formatNumberBR(lastResult.totalSeedKg)} kg</Text>
          <Text style={styles.resultLine}>Custo total: {formatCurrencyBRL(lastResult.totalInputCost)}</Text>
          <Text style={styles.resultLine}>Rendimento esperado: {formatNumberBR(lastResult.expectedYieldBags, 0)} sacas</Text>
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>Histórico local ({history.length})</Text>

      {history.length === 0 ? (
        <EmptyState icon="calculator-variant-outline" title="Sem cálculos ainda" description="Salve seu primeiro cálculo para manter o histórico offline no celular." />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => {
            const result = calculateAgroInputs(item);
            return (
              <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>{item.crop}</Text>
                  <Text style={styles.historyDate}>{formatDateTimeBR(item.createdAt)}</Text>
                </View>
                <Text style={styles.historyBody}>
                  {formatNumberBR(item.areaHectares)} ha · Custo {formatCurrencyBRL(result.totalInputCost)} · {formatNumberBR(result.expectedYieldBags, 0)} sc
                </Text>
                <PrimaryButton label="Remover" variant="ghost" onPress={() => Alert.alert('Remover cálculo', `Excluir "${item.crop}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => handleRemove(item.id) }])} icon="trash-can-outline" />
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

function PreviewMetric({ palette, label, value }: { palette: AppPalette; label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: palette.textMuted, fontSize: typography.caption, fontWeight: '700', marginBottom: spacing.xs, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ color: palette.textPrimary, fontSize: typography.body, fontWeight: '900' }}>{value}</Text>
    </View>
  );
}

const createStyles = (palette: AppPalette) =>
  StyleSheet.create({
    previewRow: { backgroundColor: palette.surfaceRaised, borderRadius: 12, flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', marginBottom: spacing.md, padding: spacing.md },
    resultLine: { color: palette.textPrimary, fontSize: typography.body, fontWeight: '700', marginBottom: spacing.xs },
    sectionTitle: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900', marginBottom: spacing.md, marginTop: spacing.md },
    historyItem: { backgroundColor: palette.surface, borderColor: palette.border, borderRadius: 12, borderWidth: 1, padding: spacing.lg },
    historyHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    historyTitle: { color: palette.textPrimary, fontSize: typography.sectionTitle, fontWeight: '900' },
    historyDate: { color: palette.textMuted, fontSize: typography.caption, fontWeight: '700' },
    historyBody: { color: palette.textSecondary, fontSize: typography.body, fontWeight: '600', marginBottom: spacing.sm },
  });
