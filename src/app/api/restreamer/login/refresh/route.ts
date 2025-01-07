import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_API_URL?.replace(/\/$/, '');
    const url = `${baseUrl}/api/login/refresh`;

    // Obtener el token de refresco del header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No se proporcionó token de refresco' },
        { status: 401 }
      );
    }

    console.log('Intentando refrescar token en:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al refrescar token:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Error al refrescar token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al refrescar token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 