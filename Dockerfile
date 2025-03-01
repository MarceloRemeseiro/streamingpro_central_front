FROM node:20-alpine AS base

# Instalar dependencias necesarias
FROM base AS deps
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar archivos de Prisma y generar el cliente
COPY prisma ./prisma
RUN npx prisma generate

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
COPY .env.production .env.production

# Verificar TypeScript y ESLint antes de construir
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run ts && \
    npm run lint || exit 1

# Construir la aplicación
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalar Prisma CLI globalmente y wget para health checks
RUN npm install -g prisma@6.4.0 && \
    apk add --no-cache wget

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Crear y asignar permisos al directorio .npm
RUN mkdir -p /home/nextjs/.npm && chown -R nextjs:nodejs /home/nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Asignar permisos al directorio prisma y crear la base de datos con permisos
RUN mkdir -p /app/prisma \
    && touch /app/prisma/dev.db \
    && chown -R nextjs:nodejs /app/prisma \
    && chmod 777 /app/prisma \
    && chmod 666 /app/prisma/dev.db

COPY --from=builder /app/pre-build.sh ./pre-build.sh
COPY --from=builder /app/.env.production ./.env.production
RUN chmod +x /app/pre-build.sh

# Configurar permisos para el directorio standalone
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar archivos necesarios
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3002

ENV PORT 3002
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 