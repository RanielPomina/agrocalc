import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

export async function shareViaWhatsApp(text: string): Promise<boolean> {
  const encoded = encodeURIComponent(text);
  const whatsappUrl = Platform.select({
    default: `whatsapp://send?text=${encoded}`,
  });

  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    }
  } catch {
    /* fallback abaixo */
  }

  try {
    await Linking.openURL(`sms:?body=${encoded}`);
    return true;
  } catch (error) {
    Alert.alert(
      'Compartilhamento indisponível',
      'Não foi possível abrir o WhatsApp nem o SMS neste aparelho.',
    );
    return false;
  }
}
