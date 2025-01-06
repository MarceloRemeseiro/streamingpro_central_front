import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function GET(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()?.split('?')[0];
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;

    return await withAuth(async (token) => {
      const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}/state`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error obteniendo el estado del proceso');
      }

      const data = await processResponse.json();
      return NextResponse.json(data);
    });
  } catch (error) {
    console.error('Error fetching process:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()?.split('?')[0];
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
    const input = await request.json();

    return await withAuth(async (token) => {
      // Actualizar los metadatos
      const metadataResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}/metadata/restreamer-ui`, {
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

    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;

    return await withAuth(async (token) => {
      // Primero obtenemos todos los procesos para encontrar los outputs asociados
      const processesResponse = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
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
      const processToDelete = processes.find((process: any) => process.id === id);
      if (!processToDelete) {
        throw new Error('Proceso no encontrado');
      }

      const streamId = processToDelete.reference;
      
      // Encontrar todos los outputs asociados al input que vamos a borrar
      const outputsToDelete = processes.filter((process: any) => {
        return process.id.includes(':egress:') && process.reference === streamId;
      });
      

      // Eliminar todos los outputs asociados
      for (const output of outputsToDelete) {
        console.log('Eliminando output:', output.id);
        await fetch(`http://${baseUrl}:8080/api/v3/process/${output.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Finalmente, eliminar el proceso principal
      const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}`, {
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