import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/appcore/navigation/RootNavigator';
import { PlanProvider } from './src/appcore/plan/PlanContext';
import { SessionProvider } from './src/appcore/session/SessionContext';
import { ThemeProvider, useAppTheme } from './src/appcore/theme/ThemeContext';

function ThemedStatusBar() {
  const { mode } = useAppTheme();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SessionProvider>
            <PlanProvider>
              <ThemedStatusBar />
              <RootNavigator />
            </PlanProvider>
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}