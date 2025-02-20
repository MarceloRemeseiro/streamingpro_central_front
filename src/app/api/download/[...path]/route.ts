import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function GET(request: NextRequest) {
  return await withAuth(async (token) => {
    try {
      // Extraemos la ruta completa después de /api/download
      const { pathname } = new URL(request.url);
      // Eliminamos el prefijo "/api/download/disk" para obtener la ruta deseada
      const filePath = pathname.replace('/api/download/disk', '');
      
      const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;
      // Construimos la URL destino para acceder al archivo
      const targetUrl = `${baseUrl}/api/v3/fs/disk${filePath}`;
      
      console.log('Downloading file from:', targetUrl);
      
      // Realizamos la petición al endpoint de Restreamer incluyendo el token
      const response = await fetch(targetUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error:', errorText);
        return NextResponse.json({ error: errorText }, { status: response.status });
      }

      const data = await response.arrayBuffer();
      const filename = filePath.split('/').pop();

      console.log('File downloaded successfully:', filename);
      
      return new NextResponse(data, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
}