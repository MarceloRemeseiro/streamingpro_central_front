import { AuthService } from '@/services/auth';
import { NextResponse } from 'next/server';

export async function authenticateRestreamer() {
  const authService = AuthService.getInstance();
  const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;

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
    return { token: access_token };
  } catch (error) {
    console.error('Error de autenticación:', error);
    throw error;
  }
}

export async function withAuth<T>(handler: (token: string) => Promise<T>) {
  try {
    const { token } = await authenticateRestreamer();
    return await handler(token);
  } catch (error) {
    console.error('Error en la operación autenticada:', error);
    return NextResponse.json(
      { error: 'Error de autenticación' },
      { status: 401 }
    );
  }
} 