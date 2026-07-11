export function createId(prefix = ''): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}_${time}${random}` : `${time}${random}`;
}
