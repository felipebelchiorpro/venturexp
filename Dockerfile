# 1. Fase de Instalação de Dependências
FROM node:18-alpine AS deps
WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json package-lock.json ./

# Instala as dependências de produção
RUN npm ci

# 2. Fase de Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copia as dependências da fase anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia o restante do código da aplicação
COPY . .

# Expõe as variáveis de ambiente públicas para o processo de build do Next.js
# Certifique-se de que essas variáveis estão configuradas como "Build-time" no seu provedor de hospedagem (Coolify)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG GEMINI_API_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Executa o script de build
RUN npm run build

# 3. Fase Final - Produção
FROM node:18-alpine AS runner
WORKDIR /app

# Define o ambiente como produção
ENV NODE_ENV=production
ENV PORT=3000

# Remove o package-lock.json e instala apenas as dependências de produção
# para uma imagem final menor.
COPY package.json .
RUN npm install --omit=dev --ignore-scripts

# Copia os artefatos de build da fase de builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Expõe a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
