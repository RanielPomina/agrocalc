export const palette = {
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
} as const;

export const gradients = {
  cyberField: [palette.neonBlue, palette.neonPurple, palette.fieldGold],
};