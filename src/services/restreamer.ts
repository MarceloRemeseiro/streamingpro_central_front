import { Process, InputInfo, OutputInfo } from '../types/restreamer';
import { authConfig } from '../lib/config';
import { AuthService } from './auth';

export class RestreamerService {
  private static instance: RestreamerService;
  private auth: AuthService;

  private constructor() {
    this.auth = AuthService.getInstance();
  }

  public static getInstance(): RestreamerService {
    if (!RestreamerService.instance) {
      RestreamerService.instance = new RestreamerService();
    }
    return RestreamerService.instance;
  }

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
        !process.id.includes('_snapshot')
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

  public async createInput(): Promise<void> {
    // TODO: Implementar la creación de inputs
    throw new Error('Método no implementado');
  }

  public async createOutput(): Promise<void> {
    // TODO: Implementar la creación de outputs
    throw new Error('Método no implementado');
  }

  public async deleteProcess(processId: string): Promise<{ success: boolean; deletedOutputs: number }> {
    try {
      const response = await fetch(`/api/process/${processId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el proceso');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error en deleteProcess:', error);
      throw error;
    }
  }
} 