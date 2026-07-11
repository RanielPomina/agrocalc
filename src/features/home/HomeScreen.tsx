import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '../../core/theme/palette';
import { radius, spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import { currentNotice } from '../../modules/agrotalk/agroTalkRepository';
import { AgroTalkNoticeCard } from './components/AgroTalkNoticeCard';
import { FeatureTile } from './components/FeatureTile';
import { SosButton } from './components/SosButton';
import { featureActions } from './homeData';
import type { FeatureAction } from './types';

function handleFeaturePress(action: FeatureAction) {
  Alert.alert(action.title, 'Modulo preparado para funcionamento offline-first no MVP.');
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Offline-first agro OS</Text>
            <Text style={styles.title}>AgroSafra</Text>
          </View>
          <View style={styles.syncPill}>
            <Text style={styles.syncText}>Sede Sync</Text>
          </View>
        </View>

        <AgroTalkNoticeCard notice={currentNotice} />

        <View style={styles.syncCard}>
          <Text style={styles.syncTitle}>AgroSync Local</Text>
          <Text style={styles.syncBody}>Quando estiver no Wi-Fi do galpao, toque para descarregar avisos, chat e AgroLog sem usar dados moveis.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ferramentas locais</Text>
          <Text style={styles.sectionMeta}>{featureActions.length} modulos</Text>
        </View>

        <View style={styles.grid}>
          {featureActions.map((action) => (
            <FeatureTile key={action.id} action={action} onPress={handleFeaturePress} />
          ))}
        </View>

        <SosButton />
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
});