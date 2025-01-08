# StreamingPro

Panel de control para gestionar streams con Datarhei Restreamer.

## Requisitos

- Docker
- Docker Compose
- Ubuntu Server 24.04 (recomendado)

## Instalación en Producción

### 1. Preparar el Sistema

```bash
# Actualizar el sistema
sudo apt update
sudo apt upgrade -y

# Instalar dependencias necesarias
sudo apt install -y docker.io docker-compose
```

### 2. Configurar Docker

```bash
# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Añadir usuario actual al grupo docker (opcional)
sudo usermod -aG docker $USER
```

### 3. Clonar y Configurar el Proyecto

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd streamingpro

# Copiar archivo de variables de entorno
cp .env.production .env

# Editar las variables de entorno
nano .env
```

### 4. Configuración del Entorno

Editar el archivo `.env` con la configuración correcta:

```env
# URL del servidor Restreamer
NEXT_PUBLIC_RESTREAMER_BASE_URL=tu-ip-o-dominio

# Configuración de la aplicación
NODE_ENV=production
PORT=3002
HOSTNAME=0.0.0.0
```

### 5. Desplegar la Aplicación

```bash
# Construir y ejecutar los contenedores
docker compose up -d

# Verificar que está funcionando
docker compose ps
```

La aplicación estará disponible en:
- http://tu-ip:3002

### 6. Comandos Útiles

```bash
# Ver logs de la aplicación
docker compose logs -f

# Reiniciar la aplicación
docker compose restart

# Detener la aplicación
docker compose down

# Actualizar la aplicación
git pull
docker compose up -d --build
```

### 7. Monitoreo

El contenedor incluye un healthcheck que verifica el estado de la aplicación cada 30 segundos.
Puedes ver el estado con:

```bash
docker compose ps
```

### Recursos del Contenedor

- CPU: Límite de 1 core, mínimo garantizado de 0.25 cores
- Memoria: Límite de 1GB, mínimo garantizado de 256MB
- Logs: Rotación automática, máximo 3 archivos de 10MB cada uno

## Solución de Problemas

Si la aplicación no responde:

1. Verificar logs:
```bash
docker compose logs -f
```

2. Verificar estado del contenedor:
```bash
docker compose ps
```

3. Reiniciar si es necesario:
```bash
docker compose restart
```

4. Verificar que el puerto 3002 está accesible:
```bash
curl http://localhost:3002
```
