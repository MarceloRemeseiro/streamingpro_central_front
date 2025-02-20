import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/utils/authUtils';

const prisma = new PrismaClient();

// GET: Obtener el estado de la grabación
export async function GET(request: NextRequest) {
  return await withAuth(async () => {
    try {
      const id = request.url.split('/').pop()?.split('?')[0];
      if (!id) {
        return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
      }

      const recordingState = await prisma.recordingState.findUnique({
        where: { processId: id }
      });

      return NextResponse.json({ 
        isRecording: recordingState?.isRecording ?? false 
      });
    } catch (error) {
      console.error('Error getting recording state:', error);
      return NextResponse.json(
        { error: 'Error getting recording state' },
        { status: 500 }
      );
    }
  });
}

// PUT: Iniciar/Detener la grabación
export async function PUT(request: NextRequest) {
  return await withAuth(async (token) => {
    try {
      const id = request.url.split('/').pop()?.split('?')[0];
      if (!id) {
        return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
      }

      const { isRecording } = await request.json();
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
      const shortId = id.split(':').pop();
      const processId = `restreamer-ui:record:${shortId}`;

      try {
        // Verificar el estado del proceso de entrada
        const inputProcessResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!inputProcessResponse.ok) {
          throw new Error('Error al obtener información del proceso de input');
        }

        const inputProcess = await inputProcessResponse.json();
        const isProcessRunning = inputProcess.state?.exec === "running";

        // Si el proceso no está corriendo, detenemos la grabación y actualizamos el estado
        if (!isProcessRunning) {
          // Verificamos si existe el proceso de grabación
          const checkResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${processId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // Si existe el proceso de grabación, lo eliminamos
          if (checkResponse.ok) {
            const response = await fetch(`http://${baseUrl}:8080/api/v3/process/${processId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Error al detener la grabación: ${errorText}`);
            }
          }

          // Actualizamos el estado en la base de datos a false
          const recordingState = await prisma.recordingState.upsert({
            where: { processId: id },
            update: {
              isRecording: false,
              lastUpdated: new Date()
            },
            create: {
              id: `recording-${id}`,
              processId: id,
              isRecording: false,
              lastUpdated: new Date()
            }
          });

          return NextResponse.json(recordingState);
        }

        // Si el proceso está corriendo, continuamos con la lógica normal
        if (isRecording) {
          const processName = inputProcess.metadata?.['restreamer-ui']?.meta?.name || 'unnamed';
          
          // Verificamos si existe el proceso de grabación
          const checkResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${processId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // Si existe, lo eliminamos primero
          if (checkResponse.ok) {
            await fetch(`http://${baseUrl}:8080/api/v3/process/${processId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
          }

          // Generamos el nombre del archivo con fecha y hora
          const now = new Date();
          const dateStr = now.toISOString()
            .replace(/[:\-]/g, '')
            .replace('T', '_')
            .split('.')[0];
          
          const sanitizedProcessName = processName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_');

          const filename = `${sanitizedProcessName}_${dateStr}.mp4`;

          // Creamos el archivo de video
          const initialContent = 'init';
          const encoder = new TextEncoder();
          const data = encoder.encode(initialContent);

          const createFileResponse = await fetch(`http://${baseUrl}:8080/api/v3/fs/disk/recordings/${filename}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/data',
              'Authorization': `Bearer ${token}`
            },
            body: data
          });

          if (!createFileResponse.ok) {
            const errorText = await createFileResponse.text();
            throw new Error(`Error al crear el archivo: ${errorText}`);
          }
          
          // Configuración del proceso de grabación
          const recordingConfig = {
            id: processId,
            type: 'ffmpeg',
            reference: shortId,
            input: [
              {
                id: 'input_0',
                address: '{memfs}/' + shortId + '.m3u8',
                options: [
                  '-re'
                ]
              }
            ],
            output: [
              {
                id: 'output_0',
                address: `/core/data/recordings/${filename}`,
                options: [
                  '-c:v',
                  'copy',
                  '-c:a',
                  'copy',
                  '-f',
                  'mp4',
                  '-movflags',
                  '+faststart'
                ]
              }
            ],
            options: [
              '-y',
              '-stats',
              '-loglevel',
              'debug'
            ],
            reconnect: true,
            reconnect_delay_seconds: 15,
            autostart: true,
            stale_timeout_seconds: 30,
            metadata: {
              'restreamer-ui': {
                hideFromUI: true,
                type: 'recording',
                meta: {
                  name: `Recording: ${processName}`,
                  description: 'Proceso de grabación - No mostrar en UI'
                }
              }
            }
          };

          // Creamos el nuevo proceso
          const createProcessResponse = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recordingConfig)
          });

          if (!createProcessResponse.ok) {
            const errorText = await createProcessResponse.text();
            throw new Error(`Error al iniciar la grabación: ${errorText}`);
          }

          // Verificamos que el proceso se haya iniciado correctamente
          const verifyProcessResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${processId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!verifyProcessResponse.ok) {
            throw new Error('El proceso de grabación no se inició correctamente');
          }

          const processData = await verifyProcessResponse.json();
          console.log('Estado del proceso de grabación:', processData);
        } else {
          // Si queremos detener la grabación
          const checkResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${processId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (checkResponse.ok) {
            const response = await fetch(`http://${baseUrl}:8080/api/v3/process/${processId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Error al detener la grabación: ${errorText}`);
            }
          }
        }

        // Actualizamos el estado en la base de datos
        const recordingState = await prisma.recordingState.upsert({
          where: { processId: id },
          update: {
            isRecording: isRecording,
            lastUpdated: new Date()
          },
          create: {
            id: `recording-${id}`,
            processId: id,
            isRecording: isRecording,
            lastUpdated: new Date()
          }
        });

        return NextResponse.json(recordingState);
      } catch (error) {
        console.error('Error updating recording state:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
}