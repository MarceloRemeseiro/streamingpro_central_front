import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth';

interface CommandRequest {
  command: 'start' | 'stop';
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const auth = AuthService.getInstance();
    const { command } = await request.json() as CommandRequest;
    const id = request.nextUrl.pathname.split('/')[3]; // Obtener el ID de la URL

    if (!command || !['start', 'stop'].includes(command)) {
      return NextResponse.json(
        { error: 'Comando inválido' },
        { status: 400 }
      );
    }

    const response = await auth.request(
      'POST',
      `/api/v3/process/${id}/command/${command}`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al enviar comando:', error);
    return NextResponse.json(
      { error: 'Error al enviar el comando' },
      { status: 500 }
    );
  }
} 