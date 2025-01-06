import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

interface CommandRequest {
  command: 'start' | 'stop';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Command request received for process:', id);
    const { command } = await request.json() as CommandRequest;
    console.log('Command to execute:', command);

    if (!command || !['start', 'stop'].includes(command)) {
      console.error('Invalid command received:', command);
      return NextResponse.json(
        { error: 'Comando inválido' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
    const apiUrl = `http://${baseUrl}:8080/api/v3/process/${id}/command`;
    console.log('Sending request to API:', apiUrl);

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
        console.log('Raw API Response:', responseText);

        if (!response.ok) {
          console.error('API Error Response:', responseText);
          throw new Error(responseText || 'Error al enviar el comando');
        }

        const data = responseText ? JSON.parse(responseText) : {};
        console.log('API Success Response:', data);
        return NextResponse.json(data);
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        return NextResponse.json(
          { error: `Error en la API: ${apiError?.message || 'Error desconocido'}` },
          { status: 500 }
        );
      }
    });
  } catch (error: any) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json(
      { error: `Error al enviar el comando: ${error?.message || 'Error desconocido'}` },
      { status: 500 }
    );
  }
} 