import { NextResponse } from "next/server";
import { Store } from '@/lib/store';

export async function PUT(
    request: Request,
    context: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await context.params;
    const { displayName } = await request.json();
    const store = Store.getInstance();

    const device = store.updateDeviceName(deviceId, displayName);
    if (!device) {
      return NextResponse.json({ message: "Dispositivo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error al actualizar nombre:", error);
    return NextResponse.json(
      { message: "Error al actualizar nombre" },
      { status: 500 }
    );
  }
} 