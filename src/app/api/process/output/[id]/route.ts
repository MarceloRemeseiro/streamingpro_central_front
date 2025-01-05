import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function PUT(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
    const payload = await request.json();
    const id = request.url.split('/').pop()?.split('?')[0];

    if (!id) {
      return NextResponse.json(
        { error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    return await withAuth(async (token) => {
      // Actualizar el proceso
      const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: payload.id,
          type: payload.type,
          config: payload.config
        })
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error actualizando el proceso de output');
      }

      // Actualizar los metadatos
      const metadataResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}/metadata/restreamer-ui`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload.metadata["restreamer-ui"])
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error actualizando los metadatos del output');
      }

      return NextResponse.json({ id });
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 