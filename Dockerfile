# ================================
# DOCKERFILE PARA NESTJS API
# ================================
# Este archivo usa "multi-stage builds" para optimizar el tamaño
# de la imagen final y mejorar la seguridad.

# ================================
# ETAPA 1: BUILD (Construcción)
# ================================
# Usamos esta etapa para instalar dependencias y compilar TypeScript
FROM node:20-alpine AS builder

# Establece el directorio de trabajo dentro del contenedor
# Todos los comandos siguientes se ejecutarán desde /app
WORKDIR /app

# Copiamos primero solo los archivos de dependencias
# Esto aprovecha el cache de Docker: si package.json no cambia,
# no reinstala las dependencias (ahorra tiempo en rebuilds)
COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo devDependencies)
# porque necesitamos TypeScript y NestJS CLI para compilar
RUN npm ci

# Ahora copiamos todo el código fuente
COPY . .

# Compilamos TypeScript a JavaScript
# Esto genera la carpeta /app/dist con el código listo para producción
RUN npm run build

# ================================
# ETAPA 2: PRODUCTION (Producción)
# ================================
# Imagen final limpia, solo con lo necesario para ejecutar
FROM node:20-alpine AS production

# Etiquetas de metadata (opcional pero recomendado)
LABEL maintainer="Finanzapp Team"
LABEL description="API Backend de Finanzapp - NestJS"

# Establecemos el entorno como producción
ENV NODE_ENV=production

# Directorio de trabajo
WORKDIR /app

# Copiamos solo package*.json para instalar dependencias de producción
COPY package*.json ./

# Instalamos SOLO dependencias de producción (sin devDependencies)
# --omit=dev excluye typescript, jest, eslint, etc.
# Esto reduce significativamente el tamaño de la imagen
RUN npm ci --omit=dev

# Copiamos el código compilado desde la etapa de build
# Solo necesitamos la carpeta dist/ (JavaScript compilado)
COPY --from=builder /app/dist ./dist

# El puerto que expone la aplicación
# Esto es documentación; el puerto real se configura con PORT env var
EXPOSE 3000

# Usuario no-root para mayor seguridad
# (evita ejecutar la app como root dentro del contenedor)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs && \
    chown -R nestjs:nodejs /app
USER nestjs

# Comando para iniciar la aplicación
# Ejecuta: node dist/main.js
CMD ["node", "dist/main"]
