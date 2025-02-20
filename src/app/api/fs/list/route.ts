import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function GET() {
  return await withAuth(async (token) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;

      const response = await fetch(`http://${baseUrl}:8080/api/v3/fs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener la lista de sistemas de archivos');
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error listing filesystems:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
} 