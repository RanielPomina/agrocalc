import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * BUILD DE DIAGNÓSTICO
 * Objetivo: descobrir se o app abre com o mínimo absoluto de dependências.
 * Se este build abrir → o crash vinha de alguma lib (Supabase, expo-av, navigation etc.)
 * Se este build não abrir → problema no Android/Hermes/config.
 *
 * Backup do App.tsx original está em App.full.tsx.bak
 */

const CHECKPOINTS = [
  'React montou',
  'StatusBar carregou',
  'View renderizou',
  'useState funcional',
  'useEffect executou',
];

export default function App() {
  const [checkpoints, setCheckpoints] = useState<string[]>(['React montou', 'StatusBar carregou', 'View renderizou']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCheckpoints((prev) => [...prev, 'useState funcional', 'useEffect executou']);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#05080D" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🌾 AgroSafra</Text>
        <Text style={styles.subtitle}>Build de Diagnóstico</Text>
        <Text style={styles.info}>
          Se você está vendo esta tela, o app abriu ✅
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Info do dispositivo</Text>
          <Text style={styles.line}>Plataforma: {Platform.OS}</Text>
          <Text style={styles.line}>Versão OS: {Platform.Version}</Text>
          {Platform.OS === 'android' ? (
            <Text style={styles.line}>API level: {Platform.constants.Release ?? '?'}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Checkpoints</Text>
          {CHECKPOINTS.map((cp) => (
            <Text key={cp} style={styles.check}>
              {checkpoints.includes(cp) ? '✅' : '⬜'} {cp}
            </Text>
          ))}
        </View>

        {error ? (
          <View style={[styles.card, { borderColor: '#FF4664' }]}>
            <Text style={[styles.cardTitle, { color: '#FF4664' }]}>Erro capturado</Text>
            <Text style={styles.line}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={() => Alert.alert('Toque funcionou!', 'React Native está 100% operacional neste aparelho.')}
        >
          <Text style={styles.buttonLabel}>Testar Alert</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Este é um build de teste para achar o culpado do crash.{'\n'}
          Se você chegou até aqui, o problema era uma das libs (Supabase, expo-av, navigation...) e vou reativar uma por uma.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05080D' },
  content: { padding: 24, paddingTop: 60 },
  title: { color: '#21D4FD', fontSize: 34, fontWeight: '900' },
  subtitle: { color: '#A9B8C9', fontSize: 14, fontWeight: '700', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 2 },
  info: { color: '#41D37E', fontSize: 18, fontWeight: '800', marginBottom: 24, lineHeight: 26 },
  card: {
    backgroundColor: '#0D1520',
    borderColor: '#24344A',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: { color: '#21D4FD', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  line: { color: '#F4F7FB', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  check: { color: '#F4F7FB', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  button: {
    backgroundColor: '#21D4FD',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
  },
  buttonLabel: { color: '#05080D', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  footer: { color: '#6F8197', fontSize: 12, marginTop: 32, textAlign: 'center', lineHeight: 18 },
});
