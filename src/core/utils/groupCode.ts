const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateGroupCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function buildJoinLink(groupCode: string): string {
  return `agrosafra://join?code=${encodeURIComponent(groupCode)}`;
}

export function parseJoinLink(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/agrosafra:\/\/join\?code=([A-Z0-9]{4,16})/i);
  return match ? match[1].toUpperCase() : null;
}
