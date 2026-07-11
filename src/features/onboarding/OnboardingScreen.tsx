import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useSession } from '../../appcore/session/SessionContext';
import type { SessionRole } from '../../appcore/session/sessionStorage';
import { palette } from '../../core/theme/palette';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import { Card } from '../../ui/Card';
import { NeonInput } from '../../ui/NeonInput';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';

export function OnboardingScreen() {
  const { signIn } = useSession();
  const [name, setName] = useState('');
  const [role, setRole] = useState<SessionRole>('admin');
  const [groupCode, setGroupCode] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Informe como você quer ser identificado.');
      return;
    }
    setSaving(true);
    await signIn({
      displayName: name.trim(),
      role,
      groupCode: groupCode.trim() || `grupo-${role}`,
      createdAt: new Date().toISOString(),
    });
    setSaving(false);
  }

  return (
    <Screen>
      <ScreenHeader
        kicker="Bem-vindo"
        title="AgroSafra"
        subtitle="Trabalha 100% offline e sincroniza quando encontra internet ou Wi-Fi da sede."
        accent={palette.neonBlue}
      />

      <Card title="Seu perfil" accent={palette.neonBlue}>
        <NeonInput
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: João"
          autoCapitalize="words"
        />

        <Text style={styles.groupLabel}>Você é...</Text>
        <View style={styles.roleRow}>
          <RoleTile
            label="Patrão / Admin"
            description="Publica avisos, cadastra receitas, gerencia grupo."
            selected={role === 'admin'}
            onPress={() => setRole('admin')}
          />
          <RoleTile
            label="Funcionário"
            description="Recebe avisos, registra AgroLog e usa ferramentas locais."
            selected={role === 'worker'}
            onPress={() => setRole('worker')}
          />
        </View>

        <NeonInput
          label="Código do grupo (opcional)"
          value={groupCode}
          onChangeText={setGroupCode}
          placeholder="Ex.: FAZENDA-123"
          autoCapitalize="characters"
          helper="Se você é funcionário, use o código enviado pelo patrão. Pode preencher depois."
        />

        <PrimaryButton
          label={saving ? 'Entrando...' : 'Começar a usar'}
          onPress={handleStart}
          icon="arrow-right-bold"
          loading={saving}
        />
      </Card>

      <Text style={styles.footNote}>
        Nada é enviado agora: seu perfil fica salvo somente neste aparelho até você conectar um
        backend (Firebase ou Supabase) em uma próxima versão.
      </Text>
    </Screen>
  );
}

function RoleTile({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <View
      style={[
        styles.roleTile,
        {
          borderColor: selected ? palette.neonBlue : palette.border,
          backgroundColor: selected ? 'rgba(33,212,253,0.08)' : palette.surface,
        },
      ]}
      onTouchEnd={onPress}
    >
      <Text
        style={[
          styles.roleLabel,
          { color: selected ? palette.neonBlue : palette.textPrimary },
        ]}
      >
        {label}
      </Text>
      <Text style={styles.roleDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    color: palette.textSecondary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleTile: {
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  roleLabel: {
    fontSize: typography.button,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  roleDescription: {
    color: palette.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 16,
  },
  footNote: {
    color: palette.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
