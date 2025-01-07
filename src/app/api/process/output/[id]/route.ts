import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function PUT(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
    const payload = await request.json();
    const id = request.nextUrl.pathname.split('/')[4]; // /api/process/output/[id]

    if (!id) {
      return NextResponse.json(
        { error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    return await withAuth(async (token) => {
      try {
        // Actualizar el proceso
        const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload.config)
        });

        const processResponseText = await processResponse.text();

        if (!processResponse.ok) {
          let errorMessage = 'Error updating output process';
          try {
            const errorData = JSON.parse(processResponseText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = processResponseText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        // Actualizar los metadatos
        const metadataResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}/metadata/restreamer-ui`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload.metadata)
        });

        const metadataResponseText = await metadataResponse.text();

        if (!metadataResponse.ok) {
          let errorMessage = 'Error updating output metadata';
          try {
            const errorData = JSON.parse(metadataResponseText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = metadataResponseText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Error interno del servidor' },
          { status: 500 }
        );
      }
    });
  } catch (error) {
    console.error('Request Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()?.split('?')[0];
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;

    return await withAuth(async (token) => {
      // Primero obtenemos todos los procesos para encontrar los outputs asociados
      const processesResponse = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!processesResponse.ok) {
        throw new Error('Error obteniendo los procesos');
      }
     
      const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error eliminando el proceso');
      }

      return NextResponse.json({ 
        success: true,
      });
    });
  } catch (error) {
    console.error('Error deleting process:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 