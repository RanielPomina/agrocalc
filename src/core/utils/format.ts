export function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumberBR(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function parseLocaleNumber(input: string): number {
  if (!input) return 0;
  const normalized = input
    .toString()
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function formatDateTimeBR(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  try {
    const then = new Date(iso).getTime();
    const diffSec = Math.round((now.getTime() - then) / 1000);
    if (diffSec < 60) return 'agora';
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `há ${diffH} h`;
    const diffD = Math.round(diffH / 24);
    if (diffD < 7) return `há ${diffD} d`;
    return formatDateTimeBR(iso);
  } catch {
    return iso;
  }
}
