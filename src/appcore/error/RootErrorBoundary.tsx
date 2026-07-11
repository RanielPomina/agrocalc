import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null; info: ErrorInfo | null };

/**
 * ErrorBoundary de nível raiz. Se qualquer provider ou tela crashar durante
 * o render, mostra a stack trace na própria tela em vez de o Android matar o app.
 * Facilita diagnóstico em builds de preview sem depender de adb logcat.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
     
    console.error('[RootErrorBoundary]', error, info?.componentStack);
    this.setState({ error, info });
  }

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>AgroSafra travou 😢</Text>
          <Text style={styles.subtitle}>Manda essa tela para o dev que ele resolve.</Text>

          <Text style={styles.section}>Erro</Text>
          <Text style={styles.message}>{this.state.error.name}: {this.state.error.message}</Text>

          {this.state.error.stack ? (
            <>
              <Text style={styles.section}>Stack</Text>
              <Text style={styles.stack}>{this.state.error.stack}</Text>
            </>
          ) : null}

          {this.state.info?.componentStack ? (
            <>
              <Text style={styles.section}>Componente</Text>
              <Text style={styles.stack}>{this.state.info.componentStack}</Text>
            </>
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#05080D',
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    color: '#FF4664',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A9B8C9',
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    color: '#21D4FD',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  message: {
    color: '#F4F7FB',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  stack: {
    color: '#A9B8C9',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
});
