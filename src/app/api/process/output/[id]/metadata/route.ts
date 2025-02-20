import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function PUT(request: NextRequest) {
  try {
    const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;
    const body = await request.json();
    const { name } = body;
    const id = request.nextUrl.pathname.split('/')[4]; // /api/process/output/[id]/metadata

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    if (!id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    return await withAuth(async (token) => {
      try {
        // Primero obtenemos los metadatos actuales
        const getMetadataResponse = await fetch(`${baseUrl}/api/v3/process/${id}/metadata/restreamer-ui`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!getMetadataResponse.ok) {
          throw new Error('Error getting current metadata');
        }

        const currentMetadata = await getMetadataResponse.json();

        // Actualizamos solo el nombre manteniendo el resto de metadatos
        const updatedMetadata = {
          ...currentMetadata,
          name
        };

        const updateResponse = await fetch(`${baseUrl}/api/v3/process/${id}/metadata/restreamer-ui`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedMetadata)
        });

        if (!updateResponse.ok) {
          const text = await updateResponse.text();
          throw new Error(text || 'Error updating metadata');
        }

        return new NextResponse(null, { status: 200 });
      } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(
          error instanceof Error ? error.message : 'Internal Server Error',
          { status: 500 }
        );
      }
    });
  } catch (error) {
    console.error('Request Error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 