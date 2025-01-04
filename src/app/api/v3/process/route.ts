import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth';
import { CreateProcessPayload } from '@/types/createProcessTypes';

export async function POST(request: Request) {
  try {
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

      // Guardamos el token en el servicio de autenticación
      authService.setAccessToken(access_token);
    } catch (error) {
      console.error('Error de autenticación:', error);
      return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
    }

    const token = authService.getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const input: CreateProcessPayload = await request.json();

    // Crear el proceso
    const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(input.config)
    });

    if (!processResponse.ok) {
      const errorData = await processResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error creating process');
    }

    // Crear los metadatos
    const metadataResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${input.config.id}/metadata/restreamer-ui`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(input.metadata)
    });

    if (!metadataResponse.ok) {
      const errorData = await metadataResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error creating metadata');
    }

    return NextResponse.json({ id: input.config.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 