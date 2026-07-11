import { useEffect, useMemo, useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';

import { useSession } from '../../appcore/session/SessionContext';
import type { SessionRole } from '../../appcore/session/sessionStorage';
import { useAppTheme } from '../../appcore/theme/ThemeContext';
import { buildJoinLink, generateGroupCode, parseJoinLink } from '../../core/utils/groupCode';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import type { AppPalette } from '../../core/theme/palette';
import { Card } from '../../ui/Card';
import { NeonInput } from '../../ui/NeonInput';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';

export function OnboardingScreen() {
  const { signIn } = useSession();
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<SessionRole>('admin');
  const [groupCode, setGroupCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    Linking.getInitialURL().then((initial) => {
      const parsed = parseJoinLink(initial);
      if (alive && parsed) {
        setGroupCode(parsed);
        setRole('worker');
      }
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      const parsed = parseJoinLink(url);
      if (parsed) {
        setGroupCode(parsed);
        setRole('worker');
      }
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  function handleGenerateCode() {
    setGroupCode(generateGroupCode());
  }

  async function handleShareLink() {
    if (!groupCode.trim()) {
      Alert.alert('Sem código', 'Gere um código de grupo antes de compartilhar o convite.');
      return;
    }
    const link = buildJoinLink(groupCode.trim().toUpperCase());
    await Share.share({ message: `Convite AgroSafra 🌾\nCódigo do grupo: ${groupCode}\nAbra o link: ${link}` });
  }

  async function handleStart() {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Informe como você quer ser identificado.');
      return;
    }
    setSaving(true);
    const finalCode = groupCode.trim().toUpperCase() || `${role === 'admin' ? 'FZ' : 'GR'}-${generateGroupCode(4)}`;
    await signIn({ displayName: name.trim(), role, groupCode: finalCode, createdAt: new Date().toISOString() });
    setSaving(false);
  }

  return (
    <Screen>
      <ScreenHeader kicker="Bem-vindo" title="AgroSafra" subtitle="Trabalha 100% offline e sincroniza quando encontra internet ou Wi-Fi da sede." accent={palette.neonBlue} />

      <Card title="Seu perfil" accent={palette.neonBlue}>
        <NeonInput label="Nome" value={name} onChangeText={setName} placeholder="Ex.: João" autoCapitalize="words" />

        <Text style={styles.groupLabel}>Você é...</Text>
        <View style={styles.roleRow}>
          <RoleTile palette={palette} label="Patrão / Admin" description="Publica avisos, cadastra receitas, gerencia grupo." selected={role === 'admin'} onPress={() => setRole('admin')} />
          <RoleTile palette={palette} label="Funcionário" description="Recebe avisos, registra AgroLog e usa ferramentas locais." selected={role === 'worker'} onPress={() => setRole('worker')} />
        </View>

        <NeonInput
          label="Código do grupo"
          value={groupCode}
          onChangeText={(t) => setGroupCode(t.toUpperCase())}
          placeholder={role === 'admin' ? 'Ex.: FAZENDA123 (ou gere um)' : 'Cole o código enviado pelo patrão'}
          autoCapitalize="characters"
          helper={role === 'admin' ? 'Gere um código, salve o app e depois compartilhe o link com sua equipe.' : 'Use o código enviado no convite do patrão (ou abra o link direto do WhatsApp).'}
        />

        {role === 'admin' ? (
          <View style={styles.adminActions}>
            <View style={{ flex: 1 }}><PrimaryButton label="Gerar código" onPress={handleGenerateCode} icon="dice-multiple-outline" variant="secondary" /></View>
            <View style={{ flex: 1 }}><PrimaryButton label="Compartilhar convite" onPress={handleShareLink} icon="share-variant-outline" variant="ghost" /></View>
          </View>
        ) : null}

        <PrimaryButton label={saving ? 'Entrando...' : 'Começar a usar'} onPress={handleStart} icon="arrow-right-bold" loading={saving} />
      </Card>

      <Text style={styles.footNote}>Nada é enviado agora: seu perfil fica salvo somente neste aparelho. Quando você ligar o Supabase, o código do grupo passa a ser reconhecido pelos outros dispositivos.</Text>
    </Screen>
  );
}

function RoleTile({ palette, label, description, selected, onPress }: { palette: AppPalette; label: string; description: string; selected: boolean; onPress: () => void }) {
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        flex: 1,
        padding: spacing.md,
        borderColor: selected ? palette.neonBlue : palette.border,
        backgroundColor: selected ? 'rgba(33,212,253,0.08)' : palette.surface,
      }}
      onTouchEnd={onPress}
    >
      <Text style={{ fontSize: typography.button, fontWeight: '900', marginBottom: spacing.xs, color: selected ? palette.neonBlue : palette.textPrimary }}>{label}</Text>
      <Text style={{ color: palette.textSecondary, fontSize: typography.caption, fontWeight: '600', lineHeight: 16 }}>{description}</Text>
    </View>
  );
}

const createStyles = (palette: AppPalette) =>
  StyleSheet.create({
    groupLabel: { color: palette.textSecondary, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.8, marginBottom: spacing.sm, textTransform: 'uppercase' },
    roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    adminActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    footNote: { color: palette.textMuted, fontSize: typography.caption, fontWeight: '600', lineHeight: 18, marginTop: spacing.md, textAlign: 'center' },
  });
