import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
      const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;

    return await withAuth(async (token) => {
      const processResponse = await fetch(`${baseUrl}/api/v3/process/${id}/state`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!processResponse.ok) {
        throw new Error('Error obteniendo el estado del proceso');
      }

      const data = await processResponse.json();
      return NextResponse.json(data);
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 