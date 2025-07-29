import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso pode acontecer durante o build no servidor se as variáveis não estiverem disponíveis.
  // Lançar um erro aqui pode parar o build.
  console.warn("Supabase URL or Anon Key is not defined. This is expected during build, but will fail at runtime if not configured.");
}

// Criamos o cliente de qualquer maneira. Se as chaves forem nulas, as chamadas falharão em tempo de execução.
export const supabase = createClient<Database>(
  supabaseUrl || "", 
  supabaseAnonKey || ""
);
