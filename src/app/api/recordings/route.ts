import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

interface Recording {
  name: string;
  size_bytes: number;
  last_modified: number;
}

export async function GET() {
  return await withAuth(async (token) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
      console.log('Fetching recordings from:', `http://${baseUrl}:8080/api/v3/fs/disk?sort=lastmod&order=desc`);

      const response = await fetch(`http://${baseUrl}:8080/api/v3/fs/disk?sort=lastmod&order=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Error al obtener la lista de grabaciones: ${errorText}`);
      }

      const allFiles: Recording[] = await response.json();
      console.log('All files received:', allFiles);
      
      // Filtramos solo los archivos de la carpeta recordings
      const recordings = allFiles.filter(file => file.name.startsWith('/recordings/'));
      console.log('Filtered recordings:', recordings);

      // Transformamos los nombres para quitar la barra inicial
      const processedRecordings = recordings.map(recording => ({
        ...recording,
        name: recording.name.substring(1) // Quitamos el / inicial
      }));
      console.log('Processed recordings:', processedRecordings);

      return NextResponse.json(processedRecordings);
    } catch (error) {
      console.error('Error listing recordings:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: Request) {
  return await withAuth(async (token) => {
    try {
      const { filename } = await request.json();
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
      
      // Aseguramos que el nombre del archivo tenga el formato correcto
      const formattedFilename = filename.startsWith('/') ? filename : `/${filename}`;
      
      console.log('Attempting to delete file:', formattedFilename);
      console.log('Delete URL:', `http://${baseUrl}:8080/api/v3/fs/disk${formattedFilename}`);

      const response = await fetch(`http://${baseUrl}:8080/api/v3/fs/disk${formattedFilename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        console.error('Delete Error Response:', errorText);
        throw new Error(`Error al eliminar la grabación: ${errorText}`);
      }

      console.log('File deleted successfully');
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting recording:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
} 