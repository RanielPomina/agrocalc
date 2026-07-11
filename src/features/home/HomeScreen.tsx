import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '../../appcore/session/SessionContext';
import { usePlan } from '../../appcore/plan/PlanContext';
import type { RootStackParamList, ScreenProps } from '../../appcore/navigation/types';
import { useAutoSyncOnOnline } from '../../core/network/connectivity';
import { readCollection } from '../../core/storage/localStore';
import { createSyncCoordinator } from '../../core/sync/createSyncCoordinator';
import { palette } from '../../core/theme/palette';
import { radius, spacing } from '../../core/theme/layout';
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
  const [notice, setNotice] = useState<AgroTalkNotice>(currentNotice);
  const [syncing, setSyncing] = useState(false);

  useAutoSyncOnOnline();

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
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Offline-first agro OS</Text>
            <Text style={styles.title}>AgroSafra</Text>
            {session ? (
              <Text style={styles.userLine}>
                {session.role === 'admin' ? '👑 Patrão' : '🧑‍🌾 Funcionário'} · {session.displayName}
                {session.groupCode ? `  ·  ${session.groupCode}` : ''}
              </Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sincronizar na sede"
            onPress={handleSync}
            disabled={syncing}
            style={({ pressed }) => [styles.syncPill, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.syncText}>{syncing ? '...' : 'Sede Sync'}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Plano ativo: ${plan.title}. Trocar plano.`}
          onPress={() => navigation.navigate('Plan')}
          style={[styles.planCard, { borderColor: planAccent }]}
        >
          <View>
            <Text style={[styles.planKicker, { color: planAccent }]}>Plano</Text>
            <Text style={styles.planTitle}>{plan.title}</Text>
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
          style={styles.syncCard}
          disabled={syncing}
        >
          <Text style={styles.syncTitle}>AgroSync Local</Text>
          <Text style={styles.syncBody}>
            No Wi-Fi da sede, toque para descarregar avisos, chat e AgroLog sem gastar dados
            móveis. Quando ficar online, a fila é enviada automaticamente.
          </Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ferramentas locais</Text>
          <Text style={styles.sectionMeta}>{featureActions.length} módulos</Text>
        </View>

        <View style={styles.grid}>
          {featureActions.map((action) => (
            <FeatureTile key={action.id} action={action} onPress={handleFeaturePress} />
          ))}
        </View>

        <SosButton />

        {session ? (
          <Pressable onPress={handleSignOut} style={styles.signOut} accessibilityRole="button">
            <Text style={styles.signOutText}>Sair da sessão</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: palette.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  kicker: {
    color: palette.neonBlue,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.textPrimary,
    fontSize: typography.screenTitle,
    fontWeight: '900',
  },
  userLine: {
    color: palette.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  syncPill: {
    borderColor: palette.neonBlue,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  syncText: {
    color: palette.neonBlue,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  planCard: {
    alignItems: 'center',
    backgroundColor: palette.surfaceRaised,
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
    color: palette.textPrimary,
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
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  syncTitle: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  syncBody: {
    color: palette.textSecondary,
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
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
  },
  sectionMeta: {
    color: palette.textMuted,
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
    color: palette.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
