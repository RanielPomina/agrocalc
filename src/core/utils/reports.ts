import type { AgroLogEntry } from '../../modules/agrolog/models';
import type { StockBalance, StockMovement } from '../../modules/agroestoque/models';
import { formatDateTimeBR, formatNumberBR } from './format';

export function buildAgroLogReport(entries: AgroLogEntry[], header = 'AgroLog'): string {
  if (entries.length === 0) {
    return `${header}\n(vazio)`;
  }
  const lines = entries.slice(0, 50).map((entry) => {
    const finished = entry.finishedAt ? ` → ${formatDateTimeBR(entry.finishedAt)}` : ' (em curso)';
    const note = entry.notes ? `\n    Obs: ${entry.notes}` : '';
    return `• ${entry.activity} @ ${entry.fieldName}\n  ${formatDateTimeBR(entry.startedAt)}${finished}${note}`;
  });
  return [`📋 ${header}`, `Total: ${entries.length}`, '', ...lines].join('\n');
}

export function buildStockReport(
  movements: StockMovement[],
  balances: StockBalance[],
  header = 'AgroEstoque',
): string {
  const balanceLines =
    balances.length === 0
      ? ['(sem saldo)']
      : balances.map(
          (balance) => `• ${balance.itemName}: ${formatNumberBR(balance.quantity)} ${balance.unit}`,
        );
  const movLines = movements.slice(0, 20).map((mov) => {
    const sign = mov.type === 'outbound' ? '-' : mov.type === 'inbound' ? '+' : '±';
    const note = mov.note ? ` — ${mov.note}` : '';
    return `${sign} ${formatNumberBR(mov.quantity)} ${mov.unit} · ${mov.itemName} (${formatDateTimeBR(mov.createdAt)})${note}`;
  });
  return [
    `📦 ${header}`,
    '',
    'SALDO ATUAL',
    ...balanceLines,
    '',
    `MOVIMENTOS (últimos ${movLines.length})`,
    ...movLines,
  ].join('\n');
}
