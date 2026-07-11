import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../core/theme/palette';
import { radius, spacing } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type Props = {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: Props) {
  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons name={icon} size={44} color={palette.neonPurple} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
});
