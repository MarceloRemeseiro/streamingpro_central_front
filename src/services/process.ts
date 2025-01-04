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
}

export const processService = new ProcessService();

export const getProcess = async (id: string): Promise<InputProcess> => {
  const response = await fetch(`/api/process/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el proceso: ${response.statusText}`);
  }

  return response.json();
}; 