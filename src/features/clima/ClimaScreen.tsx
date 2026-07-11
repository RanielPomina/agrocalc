import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import type { SimpleWeatherForecast } from '../../modules/climate/models';
import { readDoc, writeDoc } from '../../core/storage/localStore';
import { formatDateTimeBR } from '../../core/utils/format';
import { palette } from '../../core/theme/palette';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    precipitation_probability?: number;
  };
  hourly?: {
    precipitation_probability?: number[];
  };
};

async function fetchForecast(latitude: number, longitude: number): Promise<SimpleWeatherForecast> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,wind_speed_10m,precipitation_probability` +
    `&hourly=precipitation_probability&forecast_days=1&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao buscar previsão (HTTP ${response.status})`);
  }
  const data = (await response.json()) as OpenMeteoResponse;
  const rainNow = data.current?.precipitation_probability;
  const rainHourly = data.hourly?.precipitation_probability;
  const rainChance =
    typeof rainNow === 'number'
      ? rainNow
      : Array.isArray(rainHourly) && rainHourly.length > 0
      ? Math.round(rainHourly.slice(0, 6).reduce((sum, val) => sum + val, 0) / Math.min(6, rainHourly.length))
      : 0;

  return {
    locationName: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
    temperatureCelsius: data.current?.temperature_2m ?? 0,
    rainChancePercent: Math.round(rainChance),
    windSpeedKmh: Math.round((data.current?.wind_speed_10m ?? 0) * 10) / 10,
    updatedAt: new Date().toISOString(),
  };
}

export function ClimaScreen() {
  const [forecast, setForecast] = useState<SimpleWeatherForecast | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    readDoc<SimpleWeatherForecast>('climateCache').then(setForecast);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Localização bloqueada', 'Permita o acesso à localização para buscar o clima.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = await fetchForecast(position.coords.latitude, position.coords.longitude);
      setForecast(next);
      await writeDoc('climateCache', next);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Não deu para atualizar', `${message}. Usando última leitura salva.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const rainAlert = forecast && forecast.rainChancePercent >= 60;

  return (
    <Screen>
      <ScreenHeader
        kicker="Previsão simples"
        title="Clima"
        subtitle="Leitura rápida via GPS do celular"
        accent={palette.alertOrange}
      />

      {forecast ? (
        <Card
          title={rainAlert ? '⚠ Alto risco de chuva' : 'Condição atual'}
          accent={rainAlert ? palette.alertOrange : palette.neonBlue}
        >
          <View style={styles.grid}>
            <Metric label="Temperatura" value={`${Math.round(forecast.temperatureCelsius)}°C`} />
            <Metric label="Chance de chuva" value={`${forecast.rainChancePercent}%`} />
            <Metric label="Vento" value={`${forecast.windSpeedKmh} km/h`} />
          </View>
          <Text style={styles.meta}>Local: {forecast.locationName}</Text>
          <Text style={styles.meta}>Atualizado: {formatDateTimeBR(forecast.updatedAt)}</Text>
        </Card>
      ) : (
        <EmptyState
          icon="weather-partly-cloudy"
          title="Sem leitura ainda"
          description="Toque em atualizar para buscar a previsão usando o GPS do celular."
        />
      )}

      <PrimaryButton
        label={loading ? 'Buscando...' : 'Atualizar previsão'}
        icon="refresh"
        onPress={refresh}
        loading={loading}
      />

      <Text style={styles.footNote}>
        Dados de Open-Meteo (gratuito, sem chave). Última leitura fica salva no aparelho para
        consulta offline.
      </Text>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metric: {
    backgroundColor: palette.surfaceRaised,
    borderRadius: 12,
    flex: 1,
    padding: spacing.md,
  },
  metricLabel: {
    color: palette.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: palette.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
  },
  meta: {
    color: palette.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  footNote: {
    color: palette.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
