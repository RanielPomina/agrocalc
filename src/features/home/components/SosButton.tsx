import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '../../../core/theme/palette';
import { radius, spacing, touchTarget } from '../../../core/theme/layout';
import { typography } from '../../../core/theme/typography';

async function shareEmergencyLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    Alert.alert('Localizacao bloqueada', 'Permita o acesso a localizacao para enviar o SOS.');
    return;
  }

  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = position.coords;
  const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const message = `SOS AgroSafra: preciso de ajuda. Minha localizacao: ${mapsUrl}`;
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

  const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);

  if (canOpenWhatsApp) {
    await Linking.openURL(whatsappUrl);
    return;
  }

  await Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
}

export function SosButton() {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Botao SOS. Compartilhar localizacao de emergencia"
        onPress={shareEmergencyLocation}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="alarm-light-outline" size={28} color={palette.textPrimary} />
        <Text style={styles.title}>SOS Campo</Text>
        <Text style={styles.subtitle}>Enviar latitude e longitude</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
  },
  button: {
    alignItems: 'center',
    backgroundColor: palette.danger,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: touchTarget.large,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  title: {
    color: palette.textPrimary,
    flexShrink: 0,
    fontSize: typography.button,
    fontWeight: '900',
  },
  subtitle: {
    color: '#FFE2E7',
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '700',
    textAlign: 'right',
  },
});