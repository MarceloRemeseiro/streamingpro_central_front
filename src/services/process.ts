import { CreateProcessInput } from '@/types/createProcessTypes';
import { rtmpService } from './rtmpService';
import { srtService } from './srtService';
import { InputProcess } from "@/types/processTypes";

class ProcessService {
  async createProcess(input: CreateProcessInput): Promise<string> {
    try {
      if (input.type === 'rtmp') {
        return await rtmpService.createProcess(input);
      } else if (input.type === 'srt') {
        return await srtService.createProcess(input);
      } else {
        throw new Error('Invalid process type');
      }
    } catch (error) {
      console.error('Error creating process:', error);
      throw error;
    }
  }

  async getProcessState(id: string): Promise<'running' | 'failed' | 'finished' | string> {
    try {
      const process = await getProcess(id);
      return process.state?.exec || 'unknown';
    } catch (error) {
      console.error('Error getting process state:', error);
      return 'failed';
    }
  }
}

export const processService = new ProcessService();

export const getProcess = async (id: string): Promise<InputProcess> => {
  // Determinar si estamos en el cliente o en el servidor
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? 'http://localhost:3000' : '';
  
  const response = await fetch(`${baseUrl}/api/process/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el proceso: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}; 