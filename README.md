
# Venture XP

Este é um projeto inicial NextJS chamado Venture XP, construído no Firebase Studio.

## Pré-requisitos: Criando seu Projeto no Supabase

Antes de rodar a aplicação, você precisa ter um projeto no [Supabase](https://supabase.com/) para servir como seu banco de dados e backend.

1.  **Acesse o Supabase:** Vá para [app.supabase.com](https://app.supabase.com) e faça login.
2.  **Crie um Novo Projeto:**
    *   No painel, clique no botão verde **"New project"**.
    *   Escolha uma organização (ou crie uma nova).
    *   Preencha os detalhes do projeto:
        *   **Project name:** Recomendamos usar `Venture XP`.
        *   **Database Password:** Crie uma senha segura e guarde-a.
        *   **Region:** Escolha a região mais próxima de você.
        *   **Pricing Plan:** Selecione o plano `Free`.
    *   Clique em **"Create new project"**.

Com o projeto criado, você pode seguir para os "Primeiros Passos".

## Primeiros Passos

Para rodar o projeto localmente, siga estes passos:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   *   **Encontre suas chaves no Supabase:**
        1.  No painel do seu projeto Supabase, clique no ícone de engrenagem no menu esquerdo para ir para **Project Settings**.
        2.  Na nova tela, clique em **API** no menu de configurações.
        3.  Você verá uma seção chamada **Project URL**. O valor aqui é a sua `NEXT_PUBLIC_SUPABASE_URL`.
        4.  Logo abaixo, na seção **Project API keys**, copie o valor do campo `anon` `public`. Esta é a sua `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

   *   **Abra o arquivo `.env`** que está na raiz do seu projeto.
   *   **Copie e cole** esses valores nos locais indicados dentro do arquivo:
     ```env
     # Cole aqui as variáveis de ambiente do seu projeto Supabase
     # Você pode encontrá-las em "Project Settings" > "API" no seu painel Supabase
     NEXT_PUBLIC_SUPABASE_URL="COLE_A_URL_DO_PROJETO_AQUI"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="COLE_A_CHAVE_ANON_PUBLIC_AQUI"

     # Chave da API do Google Gemini (para funcionalidades de IA)
     # Crie em https://aistudio.google.com/app/apikey
     GEMINI_API_KEY="COLE_SUA_CHAVE_GEMINI_AQUI"
     ```

3. **Configure o Banco de Dados com o Schema:**
   * Vá para o seu [Painel Supabase](https://app.supabase.com/).
   * No menu esquerdo, clique no ícone de banco de dados para abrir o **"SQL Editor"**.
   * Abra o arquivo `supabase/schema.sql` do seu projeto local, copie todo o seu conteúdo.
   * Cole o conteúdo no editor SQL do Supabase e clique em **"RUN"**.

4. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o resultado.

---

## Deploy com Coolify

Para fazer o deploy desta aplicação no [Coolify](https://coolify.io/), siga estes passos:

### 1. Preparação

- **Envie seu código para o GitHub:** Certifique-se de que seu projeto está em um repositório no GitHub.
- **Tenha uma instância do Coolify rodando.**
- **Tenha um projeto Supabase criado e configurado** (siga os passos 2, 3 e 5 da seção "Primeiros Passos").

### 2. Configuração no Coolify

1.  **Crie um Novo Recurso (New Resource):**
    *   No seu painel do Coolify, vá para o projeto desejado e clique em "New Resource".
    *   Selecione "Application".

2.  **Selecione a Fonte (Source):**
    *   Escolha "GitHub", selecione o repositório e a branch correta.

3.  **Configurações de Build:**
    *   **Build Pack:** Selecione **"Nixpacks"**. Deixe os outros campos de build (`Install Command`, etc.) em branco para usar os padrões.

4.  **Configurações de Rede (Networking):**
    *   **Port:** Configure o valor para **`3000`**.
    *   Configure um domínio personalizado na aba "FQDN(s)".

5.  **Variáveis de Ambiente (Environment Variables):**
    *   Vá para a aba "Environment Variables".
    *   Adicione as seguintes variáveis, uma por uma, com os valores do seu projeto Supabase e Gemini.
    *   **É CRUCIAL que você marque a opção "Is Build Variable?"** para cada uma delas.
        *   `NEXT_PUBLIC_SUPABASE_URL`: A URL do seu projeto Supabase.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: A chave `anon` do seu projeto Supabase.
        *   `GEMINI_API_KEY`: Sua chave da API do Google Gemini.

### 3. Configuração de URLs (CORS) no Supabase

Para evitar o erro `TypeError: Failed to fetch` após o deploy, autorize o domínio da sua aplicação no Supabase.

1.  **Vá para o painel do seu projeto no Supabase.**
2.  No menu da esquerda, vá para **Authentication**.
3.  Na nova tela, no menu lateral de "Authentication", clique em **URL Configuration**.
4.  No campo **Site URL**, insira a URL principal da sua aplicação (Ex: `https://seusite.coolify.app`).
5.  Na lista de **Redirect URLs**, adicione a mesma URL com `/**` no final para permitir redirecionamentos de qualquer rota (Ex: `https://seusite.coolify.app/**`).
6.  Clique em **Save**.

### 4. Salvar e Fazer o Deploy

- Clique em **"Save"** nas configurações do Coolify.
- Vá para a aba **"Deployments"** e clique em **"Redeploy"** para iniciar o processo.

Sua aplicação estará online e conectada corretamente ao seu novo banco de dados Supabase!
