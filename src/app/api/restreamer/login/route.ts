import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_API_URL?.replace(/\/$/, '');
    const url = `${baseUrl}/api/login`;

    const username = process.env.NEXT_PUBLIC_RESTREAMER_USERNAME;
    const password = process.env.NEXT_PUBLIC_RESTREAMER_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Faltan credenciales de Restreamer' },
        { status: 500 }
      );
    }

    console.log('Intentando autenticar con Restreamer en:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Restreamer:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Error al autenticar con Restreamer' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al autenticar con Restreamer:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 