import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: ReturnType<typeof createClient<Database>>;

if (!supabaseUrl || !supabaseAnonKey) {
  // Em um ambiente de build (como Vercel, Netlify, Coolify), essas variáveis podem não estar disponíveis.
  // Não lançamos um erro para permitir que o build seja concluído.
  // A verificação real será feita no navegador.
  console.warn("Supabase URL or Anon Key is not defined in environment variables. This is expected during build, but will fail at runtime if not configured in the hosting environment.");
  
  // Criamos uma instância "dummy" para evitar que o aplicativo quebre na importação.
  // As chamadas para ele falharão em tempo de execução se as chaves não forem fornecidas, o que é o comportamento esperado.
  supabaseInstance = createClient<Database>('http://localhost', 'dummy-key');
} else {
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseInstance;
