import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';
import { Process } from '@/types/restreamer';
import { InputProcess, OutputProcess, InputType, ProcessState } from '@/types/processTypes';

const parseInputAddress = (address: string): { type: InputType; streamName: string } => {
  const srtMatch = address.match(/\{srt,name=([^,}]+)/);
  const rtmpMatch = address.match(/\{rtmp,name=([^,}]+)/);

  if (srtMatch) {
    return { type: 'srt', streamName: srtMatch[1] };
  } else if (rtmpMatch) {
    return { type: 'rtmp', streamName: rtmpMatch[1] };
  }

  return { type: 'rtmp', streamName: 'unknown' };
};

export async function GET(
  request: NextRequest,
) {
  try {
    const encodedId = request.nextUrl.pathname.split('/')[3]; // /api/process/[id]/input
    const id = decodeURIComponent(encodedId);

    if (!id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    return await withAuth(async (token) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
        
        // Obtener todos los procesos
        const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!processResponse.ok) {
          const errorText = await processResponse.text();
          console.error('Process response error:', errorText);
          throw new Error('Error getting processes');
        }

        const processes = await processResponse.json() as Process[];

        // Encontrar el input proceso
        const inputProcess = processes.find(process => process.id === id);

        if (!inputProcess) {
          return new NextResponse('Input not found', { status: 404 });
        }

        // Procesar el input como en useProcesses
        const inputAddress = inputProcess.config.input[0].address;
        const { type, streamName } = parseInputAddress(inputAddress);

        const input: InputProcess = {
          id: inputProcess.id,
          type: inputProcess.type,
          reference: inputProcess.reference,
          state: inputProcess.state as ProcessState,
          metadata: inputProcess.metadata,
          config: inputProcess.config,
          outputs: [],
          inputType: type,
          streamName,
        };

        // Encontrar y procesar los outputs
        const outputs = processes
          .filter(process => process.id.includes(':egress:') && process.reference === inputProcess.reference)
          .map(process => ({
            id: process.id,
            type: process.type,
            reference: process.reference,
            created_at: process.created_at,
            state: process.state as ProcessState,
            metadata: process.metadata,
            config: process.config,
            parentId: process.reference,
          } as OutputProcess));

        input.outputs = outputs;

        return NextResponse.json(input);
      } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(
          error instanceof Error ? error.message : 'Internal Server Error',
          { status: 500 }
        );
      }
    });
  } catch (error) {
    console.error('Request Error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 