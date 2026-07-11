import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { useAppTheme } from '../appcore/theme/ThemeContext';
import { radius, spacing } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ title, subtitle, accent, children, style }: Props) {
  const { palette } = useAppTheme();
  const titleColor = accent ?? palette.neonBlue;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
        style,
      ]}
    >
      {title || subtitle ? (
        <View style={styles.header}>
          {title ? <Text style={[styles.title, { color: titleColor }]}>{title}</Text> : null}
          {subtitle ? (
            <Text style={[styles.subtitle, { color: palette.textPrimary }]}>{subtitle}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
});
