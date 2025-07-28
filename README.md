
# Venture XP

Este é um projeto inicial NextJS chamado Venture XP, construído no Firebase Studio.

## Primeiros Passos

Para rodar o projeto localmente, siga estes passos:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   - Crie um arquivo chamado `.env` na raiz do projeto (se não existir).
   - Copie o conteúdo do exemplo abaixo para o seu arquivo `.env`.
   - Substitua os valores pelos dados do seu projeto Supabase e da sua chave da API do Gemini.
   ```
   # Cole aqui as variáveis de ambiente do seu projeto Supabase
   # Você pode encontrá-las em "Project Settings" > "API" no seu painel Supabase

   NEXT_PUBLIC_SUPABASE_URL="https://your-project-url.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

   # Chave da API do Google Gemini (para funcionalidades de IA)
   # Crie em https://aistudio.google.com/app/apikey
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o resultado.

Você pode começar a editar a página principal em `src/app/page.tsx`. A página é atualizada automaticamente conforme você edita o arquivo.
