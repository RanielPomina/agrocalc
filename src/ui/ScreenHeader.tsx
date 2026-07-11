import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../appcore/theme/ThemeContext';
import { spacing } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  accent?: string;
};

export function ScreenHeader({ kicker, title, subtitle, accent }: Props) {
  const { palette } = useAppTheme();
  const kickerColor = accent ?? palette.neonBlue;
  return (
    <View style={styles.wrap}>
      {kicker ? <Text style={[styles.kicker, { color: kickerColor }]}>{kicker}</Text> : null}
      <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text>
      ) : null}
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
    fontSize: typography.screenTitle,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
