import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function POST(request: NextRequest) {
  return await withAuth(async (token) => {
    try {
      const filename = request.url.split('/').pop();
      if (!filename) {
        return NextResponse.json({ error: 'Nombre de archivo no proporcionado' }, { status: 400 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
      const { content } = await request.json();

      // Convertimos el string a un array de bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(content);

      // Creamos el archivo directamente en el sistema de archivos disk
      const response = await fetch(`http://${baseUrl}:8080/api/v3/fs/disk/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/data',
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear el archivo: ${errorText}`);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error creating file:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: NextRequest) {
  return await withAuth(async (token) => {
    try {
      const filename = request.url.split('/').pop();
      if (!filename) {
        return NextResponse.json({ error: 'Nombre de archivo no proporcionado' }, { status: 400 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;

      const response = await fetch(`http://${baseUrl}:8080/api/v3/fs/disk/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        throw new Error(`Error al eliminar el archivo: ${errorText}`);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
} 