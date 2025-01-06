import { NextResponse } from "next/server";
import { Store } from '@/lib/store';

// GET /api/devices - Lista todos los dispositivos
export async function GET() {
  try {
    const store = Store.getInstance();
    const devices = store.getDevices();
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Error al obtener dispositivos" }, { status: 500 });
  }
}

// POST /api/devices - Registra un nuevo dispositivo
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const store = Store.getInstance();
    
    const device = store.upsertDevice({
      device_id: data.device_id,
      local_ip: data.local_ip,
      public_ip: data.public_ip,
      status: data.status,
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error al registrar dispositivo" },
      { status: 500 }
    );
  }
}