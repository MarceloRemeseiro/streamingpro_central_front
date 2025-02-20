import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function GET() {
  return await withAuth(async (token) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
      
      const response = await fetch(`http://${baseUrl}:8080/api/v3/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta de Restreamer:', errorText);
        throw new Error('Error al obtener la configuración');
      }

      const config = await response.json();
      return NextResponse.json(config);
    } catch (error) {
      console.error('Error obteniendo la configuración:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
} 