import { NextResponse } from "next/server";
import { Store } from '@/lib/store';

export async function PUT(
  request: Request,
  context: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await context.params;
    const body = await request.json();
    console.log(`\n[SRT] PUT Actualización de SRT para dispositivo ${deviceId}:`, body);

    const { srtId } = body;
    const store = Store.getInstance();

    // Si srtId es una cadena vacía o "NINGUNO", establecer como null
    const normalizedSrtId = (!srtId || srtId === "" || srtId === "NINGUNO") ? null : srtId;
    console.log(`[SRT] SRT ID normalizado: ${normalizedSrtId}`);
    
    // Obtener estado actual antes de actualizar
    const currentDevice = store.getDevices().find(d => d.device_id === deviceId);
    console.log(`[SRT] Estado actual del dispositivo:`, currentDevice);
    
    if (!currentDevice) {
      console.log(`[SRT] Dispositivo no encontrado: ${deviceId}`);
      return NextResponse.json({ 
        message: "Dispositivo no encontrado",
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Actualizar SRT y estado
    const now = new Date();
    const lastPing = new Date(currentDevice.last_ping);
    const timeSinceLastPing = now.getTime() - lastPing.getTime();
    
    let newStatus = currentDevice.status;
    
    if (timeSinceLastPing > 8000) {
      newStatus = 'OFFLINE';
    } else if (!normalizedSrtId) {
      newStatus = 'NO REPRODUCIENDO';
    } else {
      // TODO: Verificar si el proceso SRT está failed
      newStatus = 'ONLINE';
    }

    const device = store.upsertDevice({
      device_id: deviceId,
      assigned_srt: normalizedSrtId || undefined,
      status: newStatus
    });

    console.log(`[SRT] Dispositivo actualizado:`, device);
    
    return NextResponse.json({
      ...device,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[SRT] Error:", error);
    return NextResponse.json({ 
      message: "Error al actualizar SRT",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 