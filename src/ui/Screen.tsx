import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../appcore/theme/ThemeContext';
import { spacing } from '../core/theme/layout';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  footer?: ReactNode;
};

export function Screen({ children, scroll = true, padded = true, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        padded && styles.padded,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        padded && styles.padded,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: palette.background }]}
    >
      {content}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + spacing.md,
              backgroundColor: palette.background,
              borderTopColor: palette.border,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
