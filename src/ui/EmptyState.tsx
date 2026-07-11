import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../appcore/theme/ThemeContext';
import { radius, spacing } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type Props = {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: Props) {
  const { palette } = useAppTheme();
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={44} color={palette.neonPurple} />
      <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textSecondary }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
});
