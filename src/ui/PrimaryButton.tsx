import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../appcore/theme/ThemeContext';
import { radius, spacing, touchTarget } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
}: Props) {
  const { palette } = useAppTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? palette.neonBlue
      : variant === 'danger'
      ? palette.danger
      : variant === 'secondary'
      ? palette.surfaceRaised
      : 'transparent';

  const borderColor =
    variant === 'ghost' ? palette.neonBlue : variant === 'secondary' ? palette.border : backgroundColor;

  const textColor =
    variant === 'primary'
      ? palette.background
      : variant === 'danger'
      ? palette.textPrimary
      : variant === 'ghost'
      ? palette.neonBlue
      : palette.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, borderColor },
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {icon ? <MaterialCommunityIcons name={icon} size={22} color={textColor} /> : null}
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: touchTarget.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.button,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
