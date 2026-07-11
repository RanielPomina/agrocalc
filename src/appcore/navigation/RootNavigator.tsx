import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useSession } from '../session/SessionContext';
import { palette } from '../../core/theme/palette';

import { AgroCalcScreen } from '../../features/agrocalc/AgroCalcScreen';
import { AgroEstoqueScreen } from '../../features/agroestoque/AgroEstoqueScreen';
import { AgroLogScreen } from '../../features/agrolog/AgroLogScreen';
import { AgroManualScreen } from '../../features/agromanual/AgroManualScreen';
import { AgroTalkScreen } from '../../features/agrotalk/AgroTalkScreen';
import { ChatScreen } from '../../features/agrotalk/ChatScreen';
import { ClimaScreen } from '../../features/clima/ClimaScreen';
import { HomeScreen } from '../../features/home/HomeScreen';
import { OnboardingScreen } from '../../features/onboarding/OnboardingScreen';
import { PlanScreen } from '../../features/plan/PlanScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.background,
    card: palette.surface,
    primary: palette.neonBlue,
    text: palette.textPrimary,
    border: palette.border,
    notification: palette.alertOrange,
  },
};

export function RootNavigator() {
  const { session, hydrated } = useSession();

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.textPrimary,
          headerTitleStyle: { fontWeight: '900' },
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AgroTalk" component={AgroTalkScreen} options={{ title: 'AgroTalk' }} />
            <Stack.Screen
              name="AgroTalkChat"
              component={ChatScreen}
              options={{ title: 'Chat da equipe' }}
            />
            <Stack.Screen name="AgroCalc" component={AgroCalcScreen} options={{ title: 'AgroCalc' }} />
            <Stack.Screen
              name="AgroEstoque"
              component={AgroEstoqueScreen}
              options={{ title: 'AgroEstoque' }}
            />
            <Stack.Screen name="AgroLog" component={AgroLogScreen} options={{ title: 'AgroLog' }} />
            <Stack.Screen
              name="AgroManual"
              component={AgroManualScreen}
              options={{ title: 'AgroManual' }}
            />
            <Stack.Screen name="Clima" component={ClimaScreen} options={{ title: 'Clima' }} />
            <Stack.Screen name="Plan" component={PlanScreen} options={{ title: 'Planos' }} />
          </>
        ) : (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
