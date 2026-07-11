import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../../../core/theme/palette';
import { radius, spacing } from '../../../core/theme/layout';
import { typography } from '../../../core/theme/typography';
import type { AgroTalkNotice } from '../../../modules/agrotalk/models';

type Props = {
  notice: AgroTalkNotice;
};

export function AgroTalkNoticeCard({ notice }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="bullhorn-variant-outline" size={20} color={palette.black} />
          <Text style={styles.badgeText}>Mural AgroTalk</Text>
        </View>
        <Text style={styles.time}>Agora</Text>
      </View>

      <Text style={styles.title}>{notice.title}</Text>
      <Text style={styles.body}>{notice.body}</Text>
      <Text style={styles.author}>Enviado por {notice.authorName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.fieldGold,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: palette.fieldGold,
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
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    color: palette.black,
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
    color: palette.black,
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