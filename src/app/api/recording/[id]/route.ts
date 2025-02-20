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
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_API_URL;
      const shortId = id.split(':').pop();
      const processId = `restreamer-ui:record:${shortId}`;

      if (isRecording) {
        // Verificamos si existe el proceso de grabación
        const checkResponse = await fetch(`${baseUrl}/api/v3/process/${processId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Si existe, lo eliminamos primero
        if (checkResponse.ok) {
          await fetch(`${baseUrl}/api/v3/process/${processId}`, {
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
        
        const processResponse = await fetch(`http://${baseUrl}/api/v3/process/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!processResponse.ok) {
          throw new Error('Error al obtener información del proceso');
        }

        const processData = await processResponse.json();
        const processName = processData.metadata?.['restreamer-ui']?.meta?.name || 'unnamed';
        const sanitizedProcessName = processName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');

        const filename = `${sanitizedProcessName}_${dateStr}.mp4`;

        // Creamos el archivo de video
        const initialContent = 'init';
        const encoder = new TextEncoder();
        const data = encoder.encode(initialContent);

        const createFileResponse = await fetch(`${baseUrl}/api/v3/fs/disk/recordings/${filename}`, {
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
        const createProcessResponse = await fetch(`${baseUrl}/api/v3/process`, {
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

        // Actualizamos el estado en la base de datos con el nombre del archivo
        const recordingState = await prisma.recordingState.upsert({
          where: { processId: id },
          update: {
            isRecording: true,
            lastUpdated: new Date(),
            lastRecordingFile: filename
          },
          create: {
            id: `recording-${id}`,
            processId: id,
            isRecording: true,
            lastUpdated: new Date(),
            lastRecordingFile: filename
          }
        });

        return NextResponse.json(recordingState);
      } else {
        // Si queremos detener la grabación
        const checkResponse = await fetch(`${baseUrl}/api/v3/process/${processId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (checkResponse.ok) {
          const response = await fetch(`${baseUrl}/api/v3/process/${processId}`, {
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

          // Esperamos que el archivo se cierre
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Obtenemos el estado actual para saber el nombre del archivo
          const currentState = await prisma.recordingState.findUnique({
            where: { processId: id }
          });

          if (currentState?.lastRecordingFile) {
            console.log('Generando thumbnail para:', currentState.lastRecordingFile);

            // Creamos el directorio thumbnail usando el endpoint correcto
            console.log('Creando directorio thumbnail...');
            const createDirResponse = await fetch(`${baseUrl}/api/v3/fs/disk`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                path: '/thumbnail',
                type: 'directory'
              })
            });

            if (!createDirResponse.ok) {
              const errorText = await createDirResponse.text();
              console.error('Error al crear directorio thumbnail:', errorText);
              // No lanzamos error, continuamos aunque falle (podría existir ya)
              console.log('Continuando aunque el directorio pudiera existir...');
            } else {
              console.log('Directorio thumbnail creado correctamente');
            }

            // Creamos un archivo inicial para la miniatura
            const thumbnailPath = `thumbnail/${currentState.lastRecordingFile.replace('.mp4', '.jpg')}`;
            const initialContent = 'init';
            const encoder = new TextEncoder();
            const data = encoder.encode(initialContent);

            console.log('Creando archivo inicial para thumbnail:', thumbnailPath);
            const createFileResponse = await fetch(`${baseUrl}/api/v3/fs/disk/${thumbnailPath}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/data',
                'Authorization': `Bearer ${token}`
              },
              body: data
            });

            if (!createFileResponse.ok) {
              console.error('Error al crear archivo thumbnail:', await createFileResponse.text());
              throw new Error('Error al crear archivo thumbnail');
            }

            // Configuración para generar el thumbnail
            const thumbnailConfig = {
              id: `thumbnail-${Date.now()}`,
              type: 'ffmpeg',
              input: [
                {
                  id: 'input_0',
                  address: `/core/data/recordings/${currentState.lastRecordingFile}`,
                  options: [
                    '-ss',
                    '00:00:01'
                  ]
                }
              ],
              output: [
                {
                  id: 'output_0',
                  address: `/core/data/thumbnail/${currentState.lastRecordingFile.replace('.mp4', '.jpg')}`,
                  options: [
                    '-vframes',
                    '1',
                    '-vf',
                    'scale=320:-1'
                  ]
                }
              ],
              options: [
                '-y'
              ],
              autostart: true
            };

            console.log('Creando thumbnail con config:', thumbnailConfig);

            const thumbnailResponse = await fetch(`${baseUrl}/api/v3/process`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(thumbnailConfig)
            });

            if (!thumbnailResponse.ok) {
              console.error('Error al crear proceso de thumbnail:', await thumbnailResponse.text());
            } else {
              // Esperamos que se genere
              await new Promise(resolve => setTimeout(resolve, 2000));

              // Eliminamos el proceso
              await fetch(`${baseUrl}/api/v3/process/${thumbnailConfig.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              // Actualizamos el estado con el nombre del thumbnail
              const thumbnailFile = currentState.lastRecordingFile.replace('.mp4', '.jpg');
              await prisma.recordingThumbnail.create({
                data: {
                  recordingFile: currentState.lastRecordingFile,
                  thumbnailFile: thumbnailFile
                }
              });

              console.log('Thumbnail generado y registrado correctamente:', thumbnailFile);
            }
          }
        }

        // Actualizamos el estado en la base de datos
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
    } catch (error) {
      console.error('Error updating recording state:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Error interno del servidor' },
        { status: 500 }
      );
    }
  });
}