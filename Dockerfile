# Dockerfile para uma aplicação Next.js

# Estágio 1: Instalação das dependências
FROM node:20-alpine AS deps
WORKDIR /app

# Instala dependências do SO necessárias para o Next.js
RUN apk add --no-cache libc6-compat openssl

# Copia package.json e lockfiles
COPY package.json package-lock.json* ./

# Instala as dependências de produção
RUN npm install

# Estágio 2: Build da aplicação
FROM node:20-alpine AS builder
WORKDIR /app

# Copia as dependências instaladas do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia o restante do código da aplicação
COPY . .

# Define as variáveis de ambiente que serão usadas durante o build
# O Coolify irá injetar os valores aqui.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG GEMINI_API_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV GEMINI_API_KEY=${GEMINI_API_KEY}


# Executa o script de build do Next.js
RUN npm run build

# Estágio 3: Produção (Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia o usuário e grupo 'nextjs'
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Cria um diretório para o cache do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia os arquivos de build do estágio 'builder'
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Muda para o usuário não-root 'nextjs'
USER nextjs

EXPOSE 3000

ENV PORT=3000

# Inicia o servidor Next.js
CMD ["node", "server.js"]
