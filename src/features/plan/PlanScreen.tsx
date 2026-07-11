import { StyleSheet, Text, View } from 'react-native';

import { usePlan } from '../../appcore/plan/PlanContext';
import { plans, type PlanCode } from '../../modules/monetization/plans';
import { palette } from '../../core/theme/palette';
import { spacing } from '../../core/theme/layout';
import { typography } from '../../core/theme/typography';
import { Card } from '../../ui/Card';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';

const planCatalog: { code: PlanCode; description: string; accent: string; highlights: string[] }[] = [
  {
    code: 'solo',
    description: 'Grátis, monetizado por anúncios. Uso individual.',
    accent: palette.textSecondary,
    highlights: ['Ferramentas locais completas', 'SOS + Clima', 'Anúncios exibidos'],
  },
  {
    code: 'operational',
    description: 'Para patrão gerenciar 1 grupo de até 10 pessoas.',
    accent: palette.neonBlue,
    highlights: ['Sem anúncios para o admin', 'Avisos e receitas', 'Relatórios (PDF/WhatsApp)'],
  },
  {
    code: 'talk-pro',
    description: 'Tudo do Operacional + chat, áudio inteligente e AgroSync Local.',
    accent: palette.neonPurple,
    highlights: ['Áudio AAC/Opus (48h)', 'Mensagens prioritárias', 'AgroSync Local (Wi-Fi da sede)'],
  },
];

export function PlanScreen() {
  const { plan, planCode, setPlan } = usePlan();

  return (
    <Screen>
      <ScreenHeader
        kicker="Assinaturas"
        title="Seu plano"
        subtitle={`Ativo: ${plan.title}`}
        accent={palette.fieldGold}
      />

      <Card title="Simulação local" accent={palette.textMuted}>
        <Text style={styles.warning}>
          Google Play Billing entra em uma próxima versão. Por enquanto, você troca o plano aqui
          para testar os limites e o desbloqueio de recursos no aparelho.
        </Text>
      </Card>

      {planCatalog.map((item) => {
        const p = plans[item.code];
        const isActive = planCode === item.code;
        return (
          <Card
            key={item.code}
            title={p.title}
            subtitle={item.description}
            accent={item.accent}
          >
            <View style={styles.limits}>
              <LimitRow label="Anúncios" value={p.adsEnabled ? 'Sim' : 'Não'} />
              <LimitRow label="Grupos máx." value={String(p.maxGroups)} />
              <LimitRow label="Membros por grupo" value={String(p.maxMembersPerGroup)} />
              <LimitRow label="Talk Pro (chat/áudio)" value={p.talkProEnabled ? 'Sim' : 'Não'} />
            </View>

            {item.highlights.map((h, idx) => (
              <Text key={idx} style={styles.highlight}>
                • {h}
              </Text>
            ))}

            <View style={{ height: spacing.md }} />

            <PrimaryButton
              label={isActive ? 'Plano atual' : `Ativar ${p.title}`}
              onPress={() => setPlan(item.code)}
              icon={isActive ? 'check-circle-outline' : 'star-outline'}
              variant={isActive ? 'ghost' : 'primary'}
              disabled={isActive}
            />
          </Card>
        );
      })}
    </Screen>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.limitRow}>
      <Text style={styles.limitLabel}>{label}</Text>
      <Text style={styles.limitValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  warning: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
  limits: {
    backgroundColor: palette.surfaceRaised,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  limitLabel: {
    color: palette.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  limitValue: {
    color: palette.textPrimary,
    fontSize: typography.body,
    fontWeight: '900',
  },
  highlight: {
    color: palette.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
});
