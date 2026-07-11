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
    subtitle: 'Balanco de galpao offline',
    icon: 'warehouse',
    accent: palette.fieldGold,
  },
  {
    id: 'agromanual',
    title: 'AgroManual',
    subtitle: 'Receitas tecnicas do patrao',
    icon: 'book-open-page-variant-outline',
    accent: palette.neonPurple,
  },
  {
    id: 'agrolog',
    title: 'AgroLog',
    subtitle: 'Horas, tarefas e talhoes',
    icon: 'clipboard-text-clock-outline',
    accent: palette.success,
  },
  {
    id: 'clima',
    title: 'Clima',
    subtitle: 'Previsao simples do tempo',
    icon: 'weather-partly-cloudy',
    accent: palette.alertOrange,
  },
];