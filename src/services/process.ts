import { Process, InputInfo, OutputInfo, InputProcess } from '../types/restreamer';
import { authConfig } from '../lib/config';
import { AuthService } from './auth';
import { prisma } from '@/lib/db';
import { CreateProcessInput } from '@/types/createProcessTypes';
import { RTMPService } from './rtmpService';
import { SRTService } from './srtService';

export class ProcessService {
  private static instance: ProcessService;
  private auth: AuthService;
  private rtmpService: RTMPService;
  private srtService: SRTService;

  private constructor() {
    this.auth = AuthService.getInstance();
    this.rtmpService = new RTMPService();
    this.srtService = new SRTService();
  }

  public static getInstance(): ProcessService {
    if (!ProcessService.instance) {
      ProcessService.instance = new ProcessService();
    }
    return ProcessService.instance;
  }

  // Métodos de estado del proceso (anteriormente en ProcessStateService)
  public async getProcessState(processId: string): Promise<boolean> {
    const state = await prisma.processState.findUnique({
      where: { id: processId }
    });
    return state?.isEnabled ?? false;
  }

  public async setProcessState(processId: string, isEnabled: boolean): Promise<void> {
    await prisma.processState.upsert({
      where: { id: processId },
      update: { 
        isEnabled,
        lastUpdated: new Date()
      },
      create: {
        id: processId,
        isEnabled,
        lastUpdated: new Date()
      }
    });
  }

  public async deleteProcessState(processId: string): Promise<void> {
    await prisma.processState.delete({
      where: { id: processId }
    }).catch(() => {
      // Ignoramos el error si el registro no existe
    });
  }

  // Métodos de proceso (anteriormente en RestreamerService)
  private formatDefaultOutputs(streamId: string): InputInfo['defaultOutputs'] {
    return {
      SRT: `srt://${authConfig.baseUrl}:${authConfig.port}/?mode=caller&transtype=live&streamid=${streamId},mode:request`,
      RTMP: `rtmp://${authConfig.baseUrl}/${streamId}.stream`,
      HLS: `https://${authConfig.baseUrl}/memfs/${streamId}.m3u8`,
      HTML: `https://${authConfig.baseUrl}/${streamId}.html`,
    };
  }

  public async getProcesses(): Promise<InputInfo[]> {
    const processes = await this.auth.request<Process[]>('GET', '/api/v3/process');
    
    // Primero procesamos los inputs
    const inputs = processes.reduce<InputInfo[]>((acc: InputInfo[], process: Process) => {
      if (
        process.type === 'ffmpeg' &&
        process.id.includes(':ingest:') &&
        !process.id.includes('_snapshot') &&
        !process.id.includes(':record:')
      ) {
        const streamId = process.reference;
        const inputAddress = process.config.input[0].address;
        const isRTMP = inputAddress.startsWith('{rtmp');

        const inputInfo: InputInfo = {
          id: process.id,
          name: process.metadata?.['restreamer-ui']?.meta?.name || 'Sin nombre',
          description: process.metadata?.['restreamer-ui']?.meta?.description || 'Sin descripción',
          createdAt: process.created_at,
          createdAtFormatted: new Date(process.created_at * 1000).toLocaleString(),
          streamId,
          state: process.state?.exec || 'Desconocido',
          type: isRTMP ? 'rtmp' : 'srt',
          inputAddress,
          defaultOutputs: this.formatDefaultOutputs(streamId),
          customOutputs: [],
        };
        acc.push(inputInfo);
      }
      return acc;
    }, []);

    // Luego procesamos los outputs
    processes.forEach((process: Process) => {
      if (process.id.includes(':egress:')) {
        const parentInput = inputs.find(
          (input: InputInfo) => input.streamId === process.reference
        );

        if (parentInput) {
          const outputInfo: OutputInfo = {
            id: process.id,
            name: process.metadata?.['restreamer-ui']?.name || 'Sin nombre',
            address: process.config?.output?.[0]?.address || 'Dirección no disponible',
            state: process.state?.exec || 'Desconocido',
            order: process.state?.order || 'Desconocido',
            streamKey: process.config?.output?.[0]?.options?.[13] || '',
          };

          parentInput.customOutputs.push(outputInfo);
        }
      }
    });

    return inputs;
  }

  public async getProcess(id: string): Promise<InputProcess> {
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer ? 'http://localhost:3000' : '';
    
    let token = this.auth.getAccessToken();

    if (!token) {
      await this.auth.request('POST', '/api/login', {
        username: process.env.NEXT_PUBLIC_RESTREAMER_USERNAME,
        password: process.env.NEXT_PUBLIC_RESTREAMER_PASSWORD
      });
      token = this.auth.getAccessToken();
    }

    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación');
    }
    
    const response = await fetch(`${baseUrl}/api/process/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        await this.auth.request('POST', '/api/refresh', {});
        token = this.auth.getAccessToken();
        
        if (!token) {
          throw new Error('No se pudo refrescar el token de autenticación');
        }

        const retryResponse = await fetch(`${baseUrl}/api/process/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!retryResponse.ok) {
          throw new Error(`Error al obtener el proceso: ${retryResponse.statusText}`);
        }

        return await retryResponse.json();
      }
      throw new Error(`Error al obtener el proceso: ${response.statusText}`);
    }

    return await response.json();
  }

  public async deleteProcess(processId: string): Promise<{ success: boolean; deletedOutputs: number }> {
    const response = await fetch(`/api/process/${processId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el proceso');
    }

    return await response.json();
  }

  public async createInput(): Promise<void> {
    // TODO: Implementar la lógica de creación de input
    throw new Error('Método no implementado');
  }

  public async createOutput(): Promise<void> {
    // TODO: Implementar la lógica de creación de output
    throw new Error('Método no implementado');
  }

  public async createProcess(input: CreateProcessInput): Promise<string> {
    if (input.type === 'rtmp') {
      return this.rtmpService.createProcess(input);
    } else if (input.type === 'srt') {
      return this.srtService.createProcess(input);
    } else {
      throw new Error('Tipo de proceso no soportado');
    }
  }
}

export const getProcess = async (id: string): Promise<InputProcess> => {
  const processService = ProcessService.getInstance();
  return processService.getProcess(id);
};

export const processService = ProcessService.getInstance(); 