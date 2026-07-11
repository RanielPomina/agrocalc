import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../../appcore/theme/ThemeContext';
import { radius, spacing } from '../../../core/theme/layout';
import { typography } from '../../../core/theme/typography';
import type { AgroTalkNotice } from '../../../modules/agrotalk/models';

type Props = {
  notice: AgroTalkNotice;
};

export function AgroTalkNoticeCard({ notice }: Props) {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.fieldGold, shadowColor: palette.fieldGold }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.12)' }]}>
          <MaterialCommunityIcons name="bullhorn-variant-outline" size={20} color={palette.black} />
          <Text style={[styles.badgeText, { color: palette.black }]}>Mural AgroTalk</Text>
        </View>
        <Text style={styles.time}>Agora</Text>
      </View>

      <Text style={[styles.title, { color: palette.black }]}>{notice.title}</Text>
      <Text style={styles.body}>{notice.body}</Text>
      <Text style={styles.author}>Enviado por {notice.authorName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  badge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  time: {
    color: '#3C2500',
    fontSize: typography.caption,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  body: {
    color: '#201700',
    fontSize: typography.body,
    fontWeight: '700',
    lineHeight: 22,
  },
  author: {
    color: '#4B3300',
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.md,
  },
});
