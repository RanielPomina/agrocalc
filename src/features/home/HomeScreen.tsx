import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '../../appcore/session/SessionContext';
import { usePlan } from '../../appcore/plan/PlanContext';
import { useAppTheme } from '../../appcore/theme/ThemeContext';
import { clearStoredCrashLog, readStoredCrashLog } from '../../appcore/error/globalErrorLogger';
import type { RootStackParamList, ScreenProps } from '../../appcore/navigation/types';
import { useAutoSyncOnOnline } from '../../core/network/connectivity';
import { readCollection } from '../../core/storage/localStore';
import { createSyncCoordinator } from '../../core/sync/createSyncCoordinator';
import { radius, spacing, touchTarget } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import type { AgroTalkNotice } from '../../modules/agrotalk/models';
import { currentNotice } from '../../modules/agrotalk/agroTalkRepository';
import { AgroTalkNoticeCard } from './components/AgroTalkNoticeCard';
import { FeatureTile } from './components/FeatureTile';
import { SosButton } from './components/SosButton';
import { featureActions } from './homeData';
import type { FeatureAction } from './types';

type Props = ScreenProps<'Home'>;

const routeByFeature: Record<string, keyof RootStackParamList> = {
  agrocalc: 'AgroCalc',
  agroestoque: 'AgroEstoque',
  agromanual: 'AgroManual',
  agrolog: 'AgroLog',
  clima: 'Clima',
};

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useSession();
  const { plan } = usePlan();
  const { palette, mode, toggle } = useAppTheme();
  const [notice, setNotice] = useState<AgroTalkNotice>(currentNotice);
  const [syncing, setSyncing] = useState(false);

  useAutoSyncOnOnline();

  useEffect(() => {
    void readStoredCrashLog().then((log) => {
      if (!log) return;
      Alert.alert(
        'Sessão anterior travou',
        `${log.message}\n\nQuando: ${new Date(log.when).toLocaleString('pt-BR')}\n\nO app registrou este erro para diagnostico.`,
        [{ text: 'OK, apagar', onPress: () => clearStoredCrashLog() }],
      );
    });
  }, []);

  const loadNotice = useCallback(async () => {
    const stored = await readCollection<AgroTalkNotice>('notices');
    if (stored.length > 0) {
      setNotice(stored[0]);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadNotice);
    loadNotice();
    return unsubscribe;
  }, [navigation, loadNotice]);

  const coordinator = useMemo(() => createSyncCoordinator(), []);

  const handleFeaturePress = useCallback(
    (action: FeatureAction) => {
      const route = routeByFeature[action.id];
      if (!route) {
        Alert.alert(action.title, 'Módulo em preparação.');
        return;
      }
      navigation.navigate(route);
    },
    [navigation],
  );

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await coordinator.syncNow();
      if (!result) {
        Alert.alert(
          'Sem canal disponível',
          'Não achamos internet nem sede local agora. Suas mensagens continuam na fila até o próximo contato.',
        );
        return;
      }
      Alert.alert(
        'Sincronizado',
        `Canal: ${result.channel}\nEnviados: ${result.sent}\nRecebidos: ${result.received}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Falha ao sincronizar', message);
    } finally {
      setSyncing(false);
    }
  }, [coordinator]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sair da sessão', 'Isso apaga só o seu perfil deste aparelho. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  }, [signOut]);

  const planAccent =
    plan.code === 'talk-pro'
      ? palette.neonPurple
      : plan.code === 'operational'
      ? palette.neonBlue
      : palette.textMuted;

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          onPress={toggle}
          style={({ pressed }) => [
            styles.themeButton,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <MaterialCommunityIcons
            name={mode === 'dark' ? 'weather-sunny' : 'weather-night'}
            size={22}
            color={mode === 'dark' ? palette.fieldGold : palette.neonPurple}
          />
          <Text style={[styles.themeLabel, { color: palette.textPrimary }]}>
            {mode === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sincronizar na sede"
          onPress={handleSync}
          disabled={syncing}
          style={({ pressed }) => [
            styles.syncPill,
            { borderColor: palette.neonBlue },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.syncText, { color: palette.neonBlue }]}>
            {syncing ? '...' : 'Sede Sync'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: palette.neonBlue }]}>Offline-first agro OS</Text>
            <Text style={[styles.title, { color: palette.textPrimary }]}>AgroSafra</Text>
            {session ? (
              <Text style={[styles.userLine, { color: palette.textSecondary }]}>
                {session.role === 'admin' ? '👑 Patrão' : '🧑‍🌾 Funcionário'} · {session.displayName}
                {session.groupCode ? `  ·  ${session.groupCode}` : ''}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Plano ativo: ${plan.title}. Trocar plano.`}
          onPress={() => navigation.navigate('Plan')}
          style={[
            styles.planCard,
            { backgroundColor: palette.surfaceRaised, borderColor: planAccent },
          ]}
        >
          <View>
            <Text style={[styles.planKicker, { color: planAccent }]}>Plano</Text>
            <Text style={[styles.planTitle, { color: palette.textPrimary }]}>{plan.title}</Text>
          </View>
          <Text style={[styles.planLink, { color: planAccent }]}>
            {plan.adsEnabled ? 'Com anúncios · Trocar' : 'Trocar'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir mural AgroTalk"
          onPress={() => navigation.navigate('AgroTalk')}
        >
          <AgroTalkNoticeCard notice={notice} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sincronizar com sede local"
          onPress={handleSync}
          style={[
            styles.syncCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
          disabled={syncing}
        >
          <Text style={[styles.syncTitle, { color: palette.textPrimary }]}>AgroSync Local</Text>
          <Text style={[styles.syncBody, { color: palette.textSecondary }]}>
            No Wi-Fi da sede, toque para descarregar avisos, chat e AgroLog sem gastar dados
            móveis. Quando ficar online, a fila é enviada automaticamente.
          </Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Ferramentas locais</Text>
          <Text style={[styles.sectionMeta, { color: palette.textMuted }]}>
            {featureActions.length} módulos
          </Text>
        </View>

        <View style={styles.grid}>
          {featureActions.map((action) => (
            <FeatureTile key={action.id} action={action} onPress={handleFeaturePress} />
          ))}
        </View>

        <SosButton />

        {session ? (
          <Pressable onPress={handleSignOut} style={styles.signOut} accessibilityRole="button">
            <Text style={[styles.signOutText, { color: palette.textMuted }]}>Sair da sessão</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  themeButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: touchTarget.medium - 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  themeLabel: {
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  syncPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  syncText: {
    fontSize: typography.caption,
    fontWeight: '900',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  kicker: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.screenTitle,
    fontWeight: '900',
  },
  userLine: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  planCard: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  planKicker: {
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  planLink: {
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  syncCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  syncTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  syncBody: {
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sectionTitle,
    fontWeight: '900',
  },
  sectionMeta: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  signOut: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  signOutText: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
