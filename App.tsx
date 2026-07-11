import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/appcore/navigation/RootNavigator';
import { PlanProvider } from './src/appcore/plan/PlanContext';
import { SessionProvider } from './src/appcore/session/SessionContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <PlanProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </PlanProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}