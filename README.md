# StreamingPro

Aplicación web para gestionar streams de video usando Restreamer.

## Requisitos

- Docker
- Docker Compose

## Despliegue

1. Clonar el repositorio:
```bash
git clone https://github.com/yourusername/streamingpro.git
cd streamingpro
```

2. Crear el archivo de variables de entorno:
```bash
cp .env.example .env
```

3. Editar el archivo `.env` con tus configuraciones:
```env
# Restreamer API Configuration
NEXT_PUBLIC_RESTREAMER_API_URL=https://tu.dominio.com
NEXT_PUBLIC_RESTREAMER_PORT=6000
NEXT_PUBLIC_RESTREAMER_USERNAME=admin
NEXT_PUBLIC_RESTREAMER_PASSWORD=tu_password_restreamer

# URLs para HLS y otros servicios
NEXT_PUBLIC_RESTREAMER_BASE_URL=tu.dominio.com

# StreamingPro Auth
NEXT_PUBLIC_STREAMINGPRO_USERNAME=tu_usuario
NEXT_PUBLIC_STREAMINGPRO_PASSWORD=tu_password
```

4. Construir y ejecutar los contenedores:
```bash
docker compose up -d
```

La aplicación estará disponible en `http://localhost:3002`

## Actualización

Para actualizar la aplicación a la última versión:

```bash
git pull
docker compose down
docker compose up -d --build
```

## Logs

Para ver los logs de la aplicación:

```bash
docker compose logs -f streamingpro
```

## Detener la aplicación

```bash
docker compose down
```
