
# Venture XP

Este é um projeto inicial NextJS chamado Venture XP, construído no Firebase Studio.

## Pré-requisitos: Criando seu Projeto no Supabase

Antes de rodar a aplicação, você precisa ter um projeto no [Supabase](https://supabase.com/) para servir como seu banco de dados e backend.

1.  **Acesse o Supabase:** Vá para [app.supabase.com](https://app.supabase.com) e faça login.
2.  **Crie um Novo Projeto:**
    *   Na página principal, clique no botão verde **"New project"**.
    *   Escolha uma organização (ou crie uma nova, se for sua primeira vez).
    *   Preencha os detalhes do projeto:
        *   **Project name:** Recomendamos usar `Venture XP` para consistência.
        *   **Database Password:** Crie uma senha segura e guarde-a em um local seguro.
        *   **Region:** Escolha a região de servidor mais próxima de você ou de seus usuários.
        *   **Pricing Plan:** Selecione o plano `Free` (Grátis).
    *   Clique em **"Create new project"** e aguarde alguns minutos para a configuração ser concluída.

Com o projeto criado, você pode seguir para os "Primeiros Passos".

## Primeiros Passos

Para rodar o projeto localmente, siga estes passos:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   *   Crie um arquivo chamado `.env` na raiz do projeto (se não existir).
   *   Copie o conteúdo do exemplo abaixo para o seu arquivo `.env`.
   *   Substitua os valores pelos dados do seu projeto Supabase e da sua chave da API do Gemini.
   ```
   # Cole aqui as variáveis de ambiente do seu projeto Supabase
   # Você pode encontrá-las em "Project Settings" > "API" no seu painel Supabase

   NEXT_PUBLIC_SUPABASE_URL="https://your-project-url.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

   # Chave da API do Google Gemini (para funcionalidades de IA)
   # Crie em https://aistudio.google.com/app/apikey
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Gere os Tipos do Banco de Dados Supabase (Opcional, mas Recomendado):**
   Para obter autocompletar e segurança de tipos ao interagir com seu banco de dados, rode o comando abaixo na sua máquina local (requer [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)):
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
   ```
   Isso irá popular o arquivo `src/types/database.types.ts` com o esquema do seu banco de dados.

4. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o resultado.

Você pode começar a editar a página principal em `src/app/page.tsx`. A página é atualizada automaticamente conforme você edita o arquivo.

---

## Conexão com o Supabase

O projeto está configurado para se conectar a um banco de dados Supabase. A conexão é gerenciada pelo cliente Supabase inicializado em `src/lib/supabaseClient.ts`, que usa as variáveis de ambiente do seu arquivo `.env`.

---

## Deploy com Coolify

Para fazer o deploy desta aplicação no [Coolify](https://coolify.io/), siga estes passos:

### 1. Preparação

- **Envie seu código para o GitHub:** Certifique-se de que seu projeto está em um repositório no GitHub, incluindo o `Dockerfile` e o `.dockerignore` que foram adicionados.
- **Tenha uma instância do Coolify rodando:** Você pode usar a versão em nuvem ou auto-hospedada.

### 2. Configuração no Coolify

1.  **Crie um Novo Recurso (New Resource):**
    *   No seu painel do Coolify, vá para o projeto desejado e clique em "New Resource".
    *   Selecione "Application" como o tipo de recurso.

2.  **Selecione a Fonte (Source):**
    *   Escolha "GitHub" como a fonte.
    *   Selecione o repositório onde seu projeto está hospedado e a branch que deseja usar (ex: `main` ou `master`).

3.  **Configurações de Build:**
    *   **Build Pack:** O Coolify detectará automaticamente o `Dockerfile`. Selecione **"Dockerfile"** como o "Build Pack".
    *   **Install Command:** Deixe em branco, pois o `Dockerfile` cuida disso.
    *   **Build Command:** Deixe em branco.
    *   **Start Command:** Deixe em branco.

4.  **Configurações de Rede (Networking):**
    *   **Port:** O `Dockerfile` expõe a porta `3000`. O Coolify deve detectar isso. Configure o valor para **`3000`**.
    *   Você pode configurar um domínio personalizado na aba "FQDN(s)".

5.  **Variáveis de Ambiente (Environment Variables):**
    *   Esta é a parte mais importante para conectar ao Supabase e Gemini.
    *   Vá para a aba "Environment Variables".
    *   Clique em "Add a new variable".
    *   Adicione as seguintes variáveis, uma por uma, com os seus valores secretos. **Marque-as como "Build-time"** para que fiquem disponíveis durante o processo de build do Next.js.
        *   `NEXT_PUBLIC_SUPABASE_URL`: A URL do seu projeto Supabase.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: A chave `anon` do seu projeto Supabase.
        *   `GEMINI_API_KEY`: Sua chave da API do Google Gemini.
    *   Adicione também `PORT` com o valor `3000`.

### 4. Salvar e Fazer o Deploy

- Clique em **"Save"** para salvar suas configurações.
- Clique em **"Deploy"** para iniciar o processo de build e deploy.

O Coolify irá buscar seu código do GitHub, construir a imagem Docker usando o `Dockerfile`, injetar as variáveis de ambiente e iniciar sua aplicação. Você poderá acompanhar os logs de deploy diretamente na interface do Coolify.

Após a conclusão, sua aplicação "Venture XP" estará online e acessível através do domínio que você configurou!
