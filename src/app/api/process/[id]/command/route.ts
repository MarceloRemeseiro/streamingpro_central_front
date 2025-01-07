import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

interface CommandRequest {
  command: 'start' | 'stop';
}

export async function PUT(request: NextRequest) {
  try {
    // Extraer el ID de la URL
    const id = request.nextUrl.pathname.split('/')[3];
    const { command } = await request.json() as CommandRequest;

    if (!command || !['start', 'stop'].includes(command)) {
      console.error('Invalid command received:', command);
      return NextResponse.json(
        { error: 'Comando inválido' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
    const apiUrl = `http://${baseUrl}:8080/api/v3/process/${id}/command`;

    return await withAuth(async (token) => {
      try {
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ command })
        });

        const responseText = await response.text();

        if (!response.ok) {
          console.error('API Error Response:', responseText);
          throw new Error(responseText || 'Error al enviar el comando');
        }

        const data = responseText ? JSON.parse(responseText) : {};
        return NextResponse.json(data);
      } catch (error: unknown) {
        console.error('API Error:', error);
        if (error instanceof Error) {
          return NextResponse.json(
            { error: `Error en la API: ${error.message}` },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: 'Error desconocido en la API' },
          { status: 500 }
        );
      }
    });
  } catch (error: unknown) {
    console.error('Error al procesar la solicitud:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error al enviar el comando: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error desconocido al procesar la solicitud' },
      { status: 500 }
    );
  }
} 