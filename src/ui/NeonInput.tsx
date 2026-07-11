import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { useAppTheme } from '../appcore/theme/ThemeContext';
import { radius, spacing, touchTarget } from '../core/theme/layout';
import { typography } from '../core/theme/typography';

type Props = TextInputProps & {
  label: string;
  helper?: string;
  errorText?: string;
};

export function NeonInput({ label, helper, errorText, style, ...inputProps }: Props) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = errorText ? palette.danger : focused ? palette.neonBlue : palette.border;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
      <TextInput
        {...inputProps}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        placeholderTextColor={palette.textMuted}
        style={[
          styles.input,
          { borderColor, backgroundColor: palette.surface, color: palette.textPrimary },
          style,
        ]}
      />
      {errorText ? (
        <Text style={[styles.errorText, { color: palette.danger }]}>{errorText}</Text>
      ) : helper ? (
        <Text style={[styles.helper, { color: palette.textMuted }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: typography.button,
    fontWeight: '700',
    minHeight: touchTarget.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  helper: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
