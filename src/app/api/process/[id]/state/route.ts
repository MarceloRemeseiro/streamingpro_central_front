import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authService = AuthService.getInstance();
    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;

    // Intentamos hacer login primero
    try {
      const loginResponse = await fetch(`http://${baseUrl}:8080/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: process.env.NEXT_PUBLIC_RESTREAMER_USERNAME,
          password: process.env.NEXT_PUBLIC_RESTREAMER_PASSWORD
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Error en la autenticación');
      }

      const { access_token } = await loginResponse.json();
      if (!access_token) {
        throw new Error('No se recibió el token de acceso');
      }

      authService.setAccessToken(access_token);
    } catch (error) {
      console.error('Error de autenticación:', error);
      return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
    }

    const token = authService.getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}/state`, {
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
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 