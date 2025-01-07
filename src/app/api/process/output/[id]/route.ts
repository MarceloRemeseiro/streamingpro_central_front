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