import { NextResponse } from "next/server";
import { Store } from '@/lib/store';
import { processService } from '@/services/process';

// Mapa en memoria para trackear los últimos GET de cada dispositivo
const lastChecks = new Map<string, string>();

// Mapa para trackear el último estado del proceso SRT
const lastProcessStates = new Map<string, string>();

// GET /api/devices/[deviceId]/config - Obtiene configuración del dispositivo
export async function GET(
    request: Request,
    context: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await context.params;
        
        // Actualizar último check (el dispositivo está haciendo la petición ahora)
        const now = new Date().toISOString();
        lastChecks.set(deviceId, now);
        
        const store = Store.getInstance();
        const device = store.getDevices().find(d => d.device_id === deviceId);
        
        // Si no existe el dispositivo, lo creamos con la info básica
        if (!device) {
            store.upsertDevice({
                device_id: deviceId,
                created_at: now
            });
            
            return NextResponse.json({ 
                srt_url: null,
                status: 'success',
                timestamp: now,
                device_status: 'NO REPRODUCIENDO'
            });
        }

        // El dispositivo está haciendo la petición, así que está online
        // Verificar si tiene SRT asignado y su estado
        let srt_url = null;
        let deviceStatus = 'NO REPRODUCIENDO';

        if (device.assigned_srt) {
            try {
                const processState = await processService.getProcessState(device.assigned_srt);
                const lastState = lastProcessStates.get(device.assigned_srt);
                
                if (lastState && lastState !== processState) {
                }
                
                lastProcessStates.set(device.assigned_srt, processState);

                if (processState === 'running') {
                    const streamId = device.assigned_srt
                        .replace('restreamer-ui:ingest:', '')
                        .replace('?mode=request', '');
                    
                    srt_url = `srt://core.streamingpro.es:6000/?mode=caller&transtype=live&streamid=${streamId}`;
                    deviceStatus = 'ONLINE';
                } else {
                }
            } catch (error) {
                console.error(`[CONFIG] Error al verificar SRT:`, error);
            }
        }

        const response = { 
            srt_url,
            status: 'success',
            timestamp: now,
            device_status: deviceStatus
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("[CONFIG] Error:", error);
        return NextResponse.json({ 
            message: "Error al obtener configuración",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// POST /api/devices/[deviceId]/config - Actualiza configuración del dispositivo
export async function POST(
    request: Request,
    context: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await context.params;
        const body = await request.json();
        
        const store = Store.getInstance();
        const device = store.getDevice(deviceId);

        // Actualizar solo la información estática en el store
        store.upsertDevice({
            device_id: deviceId,
            display_name: body.display_name,
            local_ip: body.local_ip,
            public_ip: body.public_ip,
            assigned_srt: device?.assigned_srt // Mantener el SRT asignado
        });

        return NextResponse.json({ 
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("[CONFIG] Error:", error);
        return NextResponse.json({ 
            message: "Error al actualizar configuración",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 