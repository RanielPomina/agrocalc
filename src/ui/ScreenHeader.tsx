import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../core/theme/palette';
import { spacing } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  accent?: string;
};

export function ScreenHeader({ kicker, title, subtitle, accent = palette.neonBlue }: Props) {
  return (
    <View style={styles.wrap}>
      {kicker ? <Text style={[styles.kicker, { color: accent }]}>{kicker}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
    color: palette.textPrimary,
    fontSize: typography.screenTitle,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
