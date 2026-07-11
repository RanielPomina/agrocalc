export type ThemeMode = 'dark' | 'light';

export type AppPalette = {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  neonBlue: string;
  neonPurple: string;
  fieldGold: string;
  alertOrange: string;
  success: string;
  danger: string;
  black: string;
};

export const darkPalette: AppPalette = {
  background: '#05080D',
  surface: '#0D1520',
  surfaceRaised: '#142031',
  border: '#24344A',
  textPrimary: '#F4F7FB',
  textSecondary: '#A9B8C9',
  textMuted: '#6F8197',
  neonBlue: '#21D4FD',
  neonPurple: '#8F5BFF',
  fieldGold: '#F4B942',
  alertOrange: '#FF8A3D',
  success: '#41D37E',
  danger: '#FF4664',
  black: '#000000',
};

export const lightPalette: AppPalette = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceRaised: '#EEF2F8',
  border: '#D3DCE8',
  textPrimary: '#0B1220',
  textSecondary: '#3E4A5C',
  textMuted: '#6B7787',
  neonBlue: '#0072B2',
  neonPurple: '#6A3AE0',
  fieldGold: '#C88515',
  alertOrange: '#D3661A',
  success: '#178A4B',
  danger: '#C51E38',
  black: '#000000',
};

export const palettes: Record<ThemeMode, AppPalette> = {
  dark: darkPalette,
  light: lightPalette,
};

/**
 * Alias estático (backwards-compat): usa a palette DARK.
 * Componentes novos devem usar `useAppTheme()` para reagir ao tema.
 */
export const palette = darkPalette;

export const gradients = {
  cyberField: [darkPalette.neonBlue, darkPalette.neonPurple, darkPalette.fieldGold],
};