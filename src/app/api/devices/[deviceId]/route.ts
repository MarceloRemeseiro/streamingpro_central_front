import { NextResponse } from 'next/server';
import { Store } from '@/lib/store';

export async function DELETE(
    request: Request,
    context: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await context.params;
    const store = Store.getInstance();
    
    // Primero verificamos si el dispositivo existe
    const device = store.getDevices().find(d => d.device_id === deviceId);
    if (!device) {
      return NextResponse.json(
        { message: 'Dispositivo no encontrado' },
        { status: 404 }
      );
    }
    
    const success = store.deleteDevice(deviceId);
    if (!success) {
      return NextResponse.json(
        { message: 'Error al eliminar el dispositivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Dispositivo eliminado correctamente',
      deviceId 
    });
  } catch (error) {
    console.error('Error al eliminar dispositivo:', error);
    return NextResponse.json(
      { message: 'Error interno al eliminar dispositivo' },
      { status: 500 }
    );
  }
}