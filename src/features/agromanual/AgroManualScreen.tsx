import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import type { TechnicalRecipe } from '../../modules/agromanual/models';
import { appendRecord, readCollection, removeRecord } from '../../core/storage/localStore';
import { createId } from '../../core/utils/id';
import { formatDateTimeBR } from '../../core/utils/format';
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
  title: string;
  crop: string;
  steps: string;
  safety: string;
};

const emptyForm: FormState = { title: '', crop: '', steps: '', safety: '' };

export function AgroManualScreen() {
  const { session } = useSession();
  const isAdmin = session?.role === 'admin';
  const [form, setForm] = useState<FormState>(emptyForm);
  const [recipes, setRecipes] = useState<TechnicalRecipe[]>([]);

  useEffect(() => {
    readCollection<TechnicalRecipe>('recipes').then(setRecipes);
  }, []);

  async function handleSave() {
    if (!form.title.trim() || !form.crop.trim()) {
      Alert.alert('Preencha título e cultura', 'Título e cultura são obrigatórios.');
      return;
    }
    const record: TechnicalRecipe = {
      id: createId('rec'),
      title: form.title.trim(),
      crop: form.crop.trim(),
      steps: splitLines(form.steps),
      safetyNotes: splitLines(form.safety),
      updatedAt: new Date().toISOString(),
    };
    await appendRecord('recipes', record);
    setRecipes(await readCollection<TechnicalRecipe>('recipes'));
    setForm(emptyForm);
  }

  async function handleRemove(id: string) {
    await removeRecord('recipes', id);
    setRecipes(await readCollection<TechnicalRecipe>('recipes'));
  }

  return (
    <Screen>
      <ScreenHeader
        kicker="Receitas técnicas"
        title="AgroManual"
        subtitle={isAdmin ? 'Cadastre e publique receitas para a equipe' : 'Receitas técnicas do patrão'}
        accent={palette.neonPurple}
      />

      {isAdmin ? (
        <Card title="Nova receita" accent={palette.neonPurple}>
          <NeonInput
            label="Título"
            value={form.title}
            onChangeText={(text) => setForm((s) => ({ ...s, title: text }))}
            placeholder="Ex.: Manejo de brusone"
            autoCapitalize="sentences"
          />
          <NeonInput
            label="Cultura"
            value={form.crop}
            onChangeText={(text) => setForm((s) => ({ ...s, crop: text }))}
            placeholder="Ex.: Arroz"
            autoCapitalize="words"
          />
          <NeonInput
            label="Passos (uma linha por passo)"
            value={form.steps}
            onChangeText={(text) => setForm((s) => ({ ...s, steps: text }))}
            placeholder={'1. Preparar solo\n2. Aplicar dose recomendada'}
            multiline
            style={{ minHeight: 120, textAlignVertical: 'top' }}
          />
          <NeonInput
            label="Segurança (uma linha por item)"
            value={form.safety}
            onChangeText={(text) => setForm((s) => ({ ...s, safety: text }))}
            placeholder={'Usar EPI completo\nRespeitar carência de 21 dias'}
            multiline
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
          <PrimaryButton label="Publicar receita" onPress={handleSave} icon="book-plus-outline" />
        </Card>
      ) : (
        <Card title="Somente leitura" accent={palette.textSecondary}>
          <Text style={styles.body}>
            Apenas o patrão (admin) pode publicar receitas técnicas. Peça acesso para incluir uma
            nova receita.
          </Text>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Receitas disponíveis ({recipes.length})</Text>
      {recipes.length === 0 ? (
        <EmptyState
          icon="book-open-page-variant-outline"
          title="Sem receitas ainda"
          description={
            isAdmin
              ? 'Cadastre a primeira receita técnica para a equipe.'
              : 'O patrão ainda não publicou receitas. Volte em breve.'
          }
        />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <View style={styles.recipe}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeMeta}>
                {item.crop} · atualizada em {formatDateTimeBR(item.updatedAt)}
              </Text>
              {item.steps.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Passos</Text>
                  {item.steps.map((step, idx) => (
                    <Text key={`s-${idx}`} style={styles.listItem}>• {step}</Text>
                  ))}
                </View>
              ) : null}
              {item.safetyNotes.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: palette.alertOrange }]}>Segurança</Text>
                  {item.safetyNotes.map((note, idx) => (
                    <Text key={`n-${idx}`} style={styles.listItem}>⚠ {note}</Text>
                  ))}
                </View>
              ) : null}
              {isAdmin ? (
                <PrimaryButton
                  label="Remover"
                  variant="ghost"
                  icon="trash-can-outline"
                  onPress={() =>
                    Alert.alert('Remover receita', `Excluir "${item.title}"?`, [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Remover', style: 'destructive', onPress: () => handleRemove(item.id) },
                    ])
                  }
                />
              ) : null}
            </View>
          )}
        />
      )}
    </Screen>
  );
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const styles = StyleSheet.create({
  body: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  recipe: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.lg,
  },
  recipeTitle: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  recipeMeta: {
    color: palette.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: palette.neonBlue,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  listItem: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
});
