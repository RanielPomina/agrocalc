import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '../../../core/theme/palette';
import { radius, spacing, touchTarget } from '../../../core/theme/layout';
import { typography } from '../../../core/theme/typography';
import type { FeatureAction } from '../types';

type Props = {
  action: FeatureAction;
  onPress: (action: FeatureAction) => void;
};

export function FeatureTile({ action, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${action.title}. ${action.subtitle}`}
      onPress={() => onPress(action)}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={[styles.iconShell, { borderColor: action.accent }]}>
        <MaterialCommunityIcons name={action.icon} size={30} color={action.accent} />
      </View>
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.subtitle}>{action.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: palette.surfaceRaised,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '48%',
    minHeight: 156,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  iconShell: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    height: touchTarget.medium,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: touchTarget.medium,
  },
  title: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 18,
  },
});