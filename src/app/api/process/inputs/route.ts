import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

interface ProcessMetadata {
  'restreamer-ui'?: {
    meta?: {
      name?: string;
    };
  };
}

interface Process {
  id: string;
  type: string;
  reference: string;
  metadata?: ProcessMetadata;
}

interface InputProcess {
  id: string;
  name: string;
  streamId: string;
}

export async function GET() {
  try {
    return await withAuth(async (token) => {
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
      const response = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo procesos');
      }

      const processes = await response.json();
      
      // Filtrar solo los inputs
      const inputs = processes.filter((process: Process) => 
        process.type === 'ffmpeg' && 
        process.id.includes(':ingest:') && 
        !process.id.includes('_snapshot')
      ).map((process: Process): InputProcess => ({
        id: process.id,
        name: process.metadata?.['restreamer-ui']?.meta?.name || 'Sin nombre',
        streamId: process.reference
      }));

      return NextResponse.json(inputs);
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener inputs' },
      { status: 500 }
    );
  }
} 