import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  AgroTalk: undefined;
  AgroTalkChat: undefined;
  AgroCalc: undefined;
  AgroEstoque: undefined;
  AgroLog: undefined;
  AgroManual: undefined;
  AgroTarefas: undefined;
  Clima: undefined;
  Plan: undefined;
};

export type ScreenProps<Route extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Route
>;
