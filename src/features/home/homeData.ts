import { palette } from '../../core/theme/palette';
import type { FeatureAction } from './types';

export const featureActions: FeatureAction[] = [
  {
    id: 'agrocalc',
    title: 'AgroCalc',
    subtitle: 'Insumos, sementes e rendimento',
    icon: 'calculator-variant-outline',
    accent: palette.neonBlue,
  },
  {
    id: 'agroestoque',
    title: 'AgroEstoque',
    subtitle: 'Balanço de galpão offline',
    icon: 'warehouse',
    accent: palette.fieldGold,
  },
  {
    id: 'agromanual',
    title: 'AgroManual',
    subtitle: 'Receitas técnicas do patrão',
    icon: 'book-open-page-variant-outline',
    accent: palette.neonPurple,
  },
  {
    id: 'agrolog',
    title: 'AgroLog',
    subtitle: 'Horas, tarefas e talhões',
    icon: 'clipboard-text-clock-outline',
    accent: palette.success,
  },
  {
    id: 'clima',
    title: 'Clima',
    subtitle: 'Previsão simples do tempo',
    icon: 'weather-partly-cloudy',
    accent: palette.alertOrange,
  },
];