#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[StreamingPro]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Warning]${NC} $1"
}

print_error() {
    echo -e "${RED}[Error]${NC} $1"
}

# Verificar requisitos
check_requirements() {
    print_message "Verificando requisitos..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
}

# Preparar entorno
setup_environment() {
    print_message "Preparando entorno..."
    
    # Crear archivo .env si no existe
    if [ ! -f .env ]; then
        cp .env.production .env
        print_warning "Archivo .env creado desde .env.production. Por favor, revisa y ajusta las credenciales."
    fi

    # Verificar permisos de archivos
    chmod +x deploy.sh
    chmod 600 .env
}

# Desplegar aplicación
deploy_app() {
    print_message "Desplegando aplicación..."
    
    # Detener contenedores existentes
    docker compose down

    # Construir y levantar contenedores
    docker compose up -d --build

    # Verificar estado
    if [ $? -eq 0 ]; then
        print_message "Aplicación desplegada correctamente"
    else
        print_error "Error al desplegar la aplicación"
        exit 1
    fi
}

# Monitorear recursos
monitor_resources() {
    print_message "Configurando monitoreo..."
    
    # Crear directorio para logs si no existe
    mkdir -p ./logs

    # Función para obtener estadísticas
    get_stats() {
        echo "=== StreamingPro Stats $(date) ===" >> ./logs/monitor.log
        echo "CPU Usage:" >> ./logs/monitor.log
        docker stats streamingpro --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" >> ./logs/monitor.log
        echo "Memory Usage:" >> ./logs/monitor.log
        docker stats streamingpro --no-stream --format "table {{.MemPerc}}\t{{.NetIO}}" >> ./logs/monitor.log
        echo "Network I/O:" >> ./logs/monitor.log
        docker stats streamingpro --no-stream --format "table {{.NetIO}}\t{{.BlockIO}}" >> ./logs/monitor.log
        echo "----------------------------------------" >> ./logs/monitor.log
    }

    # Configurar cron para monitoreo cada 5 minutos
    (crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/deploy.sh --monitor") | crontab -

    print_message "Monitoreo configurado. Los logs se guardan en ./logs/monitor.log"
}

# Verificar salud de la aplicación
check_health() {
    print_message "Verificando salud de la aplicación..."
    
    # Esperar a que la aplicación esté lista
    sleep 10

    # Verificar endpoint de health
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health)
    
    if [ $response -eq 200 ]; then
        print_message "La aplicación está funcionando correctamente"
    else
        print_error "La aplicación no responde correctamente (HTTP $response)"
    fi
}

# Función principal
main() {
    case "$1" in
        --monitor)
            get_stats
            ;;
        *)
            check_requirements
            setup_environment
            deploy_app
            monitor_resources
            check_health
            ;;
    esac
}

main "$@" 