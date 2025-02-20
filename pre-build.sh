#!/bin/sh
# pre-build.sh

echo "🔍 Verificando tipos..."
npm run ts || exit 1

echo "🔍 Verificando linting..."
npm run lint || exit 1

echo "🔍 Verificando Prisma..."
npx prisma generate || exit 1

echo "✅ Todas las verificaciones pasaron"