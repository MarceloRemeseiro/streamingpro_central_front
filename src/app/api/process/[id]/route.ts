import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';
import { ProcessStateService } from '@/services/processStateService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Process {
  id: string;
  reference: string;
}

interface ProcessWithOutputs extends Process {
  id: string;
  reference: string;
  outputs?: Process[];
}

export async function GET(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()?.split('?')[0];
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No se proporcionó token de autenticación' }, { status: 401 });
    }

    return await withAuth(async (token) => {
      try {
        const processResponse = await fetch(`${baseUrl}/api/v3/process/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!processResponse.ok) {
          const errorText = await processResponse.text();
          throw new Error(`Error obteniendo los datos del proceso: ${errorText}`);
        }

        const processData = await processResponse.json();

        const data = {
          ...processData,
          state: {
            exec: processData.state?.exec || 'unknown',
            progress: processData.state?.progress || 0
          },
          progress: processData.state?.progress || {}
        };

        return NextResponse.json(data);
      } catch (error) {
        throw error;
      }
    });
  } catch (error) {
    console.error('Error fetching process:', error);
    if (error instanceof Error) {
      if (error.message.includes('autenticación') || error.message.includes('token')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()?.split('?')[0];
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;
    const input = await request.json();

    return await withAuth(async (token) => {
      // Actualizar los metadatos
      const metadataResponse = await fetch(`${baseUrl}/api/v3/process/${id}/metadata/restreamer-ui`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meta: {
            name: input.name,
            description: input.description
          }
        })
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error actualizando el proceso');
      }

      return NextResponse.json({ success: true });
    });
  } catch (error) {
    console.error('Error updating process:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()?.split('?')[0];
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;

    return await withAuth(async (token) => {
      // Primero obtenemos todos los procesos para encontrar los outputs asociados
      const processesResponse = await fetch(`${baseUrl}/api/v3/process`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!processesResponse.ok) {
        throw new Error('Error obteniendo los procesos');
      }

      const processes = await processesResponse.json();
      
      // Obtenemos el streamId del proceso que vamos a borrar
      const processToDelete = processes.find((process: ProcessWithOutputs) => process.id === id);
      if (!processToDelete) {
        throw new Error('Proceso no encontrado');
      }

      const streamId = processToDelete.reference;
      
      // Encontrar todos los outputs asociados al input que vamos a borrar
      const outputsToDelete = processes.filter((process: ProcessWithOutputs) => {
        return process.id.includes(':egress:') && process.reference === streamId;
      });

      // Eliminar los estados de colapso y switches de todos los outputs asociados
      for (const output of outputsToDelete) {
        // Eliminar estados de colapso del output
        await prisma.collapseState.deleteMany({
          where: {
            processId: output.id
          }
        });

        // Eliminar estado del switch del output
        const processStateService = ProcessStateService.getInstance();
        await processStateService.deleteProcessState(output.id);

        // Eliminar el output en Restreamer
        await fetch(`${baseUrl}/api/v3/process/${output.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Eliminar el estado de colapso del input
      await prisma.collapseState.deleteMany({
        where: {
          processId: id
        }
      });

      // Eliminar el estado del switch del input
      const processStateService = ProcessStateService.getInstance();
      await processStateService.deleteProcessState(id);

      // Eliminar el estado de grabación
      await prisma.recordingState.deleteMany({
        where: {
          processId: id
        }
      });

      // Eliminar el proceso de grabación si existe
      const shortId = id.split(':').pop();
      const recordingProcessId = `restreamer-ui:record:${shortId}`;
      const checkRecordingResponse = await fetch(`${baseUrl}/api/v3/process/${recordingProcessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (checkRecordingResponse.ok) {
        await fetch(`${baseUrl}/api/v3/process/${recordingProcessId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Finalmente eliminamos el proceso principal en Restreamer
      const processResponse = await fetch(`${baseUrl}/api/v3/process/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error eliminando el proceso');
      }

      return NextResponse.json({ 
        success: true,
        deletedOutputs: outputsToDelete.length
      });
    });
  } catch (error) {
    console.error('Error deleting process:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 