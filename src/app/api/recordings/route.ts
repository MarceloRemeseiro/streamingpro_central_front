import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Recording {
  name: string;
  size_bytes: number;
  last_modified: number;
  thumbnail?: string | null;
}

export async function GET() {
  return await withAuth(async (token) => {
    try {
      const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;
      console.log('Fetching recordings from:', `${baseUrl}/api/v3/fs/disk?sort=lastmod&order=desc`);

      const response = await fetch(`${baseUrl}/api/v3/fs/disk?sort=lastmod&order=desc`, {
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

      // Obtenemos todas las miniaturas
      const thumbnails = await prisma.recordingThumbnail.findMany();

      // Creamos un mapa de nombre de archivo -> thumbnail
      const thumbnailMap = new Map(
        thumbnails.map((thumbnail: { recordingFile: string; thumbnailFile: string }) => [
          thumbnail.recordingFile,
          thumbnail.thumbnailFile
        ])
      );

      // Transformamos los nombres y agregamos las miniaturas
      const processedRecordings = recordings.map(recording => {
        const fileName = recording.name.substring(1); // Quitamos el / inicial
        const baseName = fileName.replace('recordings/', '');
        
        return {
          ...recording,
          name: fileName,
          thumbnail: thumbnailMap.get(baseName) || null
        };
      });

      console.log('Processed recordings with thumbnails:', processedRecordings);

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
      const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;
      
      // Aseguramos que el nombre del archivo tenga el formato correcto
      const formattedFilename = filename.startsWith('/') ? filename : `/${filename}`;
      const cleanFilename = filename.replace(/^recordings\//, '');
      
      console.log('Attempting to delete file:', formattedFilename);

      try {
        // Primero buscamos si tiene una miniatura asociada
        const thumbnail = await prisma.recordingThumbnail.findUnique({
          where: { recordingFile: cleanFilename }
        });

        if (thumbnail) {
          // Si tiene miniatura, la eliminamos del sistema de archivos
          console.log('Deleting thumbnail file:', thumbnail.thumbnailFile);
          await fetch(`${baseUrl}/api/v3/fs/disk/thumbnail/${thumbnail.thumbnailFile}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // Eliminamos la referencia en la base de datos
          console.log('Deleting thumbnail reference from database');
          await prisma.recordingThumbnail.delete({
            where: { recordingFile: cleanFilename }
          });
        }

        // Finalmente eliminamos el archivo de video
        console.log('Deleting video file:', formattedFilename);
        const response = await fetch(`${baseUrl}/api/v3/fs/disk${formattedFilename}`, {
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

        console.log('Files deleted successfully');
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error during deletion:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
} 