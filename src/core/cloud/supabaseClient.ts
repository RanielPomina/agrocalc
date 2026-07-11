const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let cachedClient: any = null;
let initFailed = false;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseUrl(): string | undefined {
  return supabaseUrl;
}

/**
 * Lazy loader do cliente Supabase.
 * O SDK precisa de polyfill `react-native-url-polyfill/auto` importado no App.tsx.
 * Se qualquer coisa quebrar, retornamos null em vez de crashar o app inteiro.
 */
export function getSupabaseClient(): any | null {
  if (!isSupabaseConfigured() || initFailed) {
    return null;
  }
  if (cachedClient) {
    return cachedClient;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js');
    cachedClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    return cachedClient;
  } catch (error) {
    initFailed = true;
     
    console.warn('[Supabase] Falha ao inicializar client:', error);
    return null;
  }
}

export const supabaseTables = {
  notices: 'agrosafra_notices',
  chatMessages: 'agrosafra_chat_messages',
  agroLog: 'agrosafra_agro_log',
} as const;
