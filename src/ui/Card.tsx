import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { palette } from '../core/theme/palette';
import { radius, spacing } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type Props = {
  title?: string;
  subtitle?: string;
  accent?: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ title, subtitle, accent = palette.neonBlue, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title || subtitle ? (
        <View style={styles.header}>
          {title ? <Text style={[styles.title, { color: accent }]}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
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
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
});
