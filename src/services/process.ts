import { CreateProcessInput } from '@/types/createProcessTypes';
import { rtmpService } from './rtmpService';
import { srtService } from './srtService';
import { InputProcess } from "@/types/processTypes";
import { AuthService } from '@/services/auth';

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
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? 'http://localhost:3000' : '';
  
  const authService = AuthService.getInstance();
  let token = authService.getAccessToken();

  if (!token) {
    await authService.request('POST', '/api/login', {
      username: process.env.NEXT_PUBLIC_RESTREAMER_USERNAME,
      password: process.env.NEXT_PUBLIC_RESTREAMER_PASSWORD
    });
    token = authService.getAccessToken();
  }

  if (!token) {
    throw new Error('No se pudo obtener el token de autenticación');
  }
  
  const response = await fetch(`${baseUrl}/api/process/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      await authService.request('POST', '/api/refresh', {});
      token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('No se pudo refrescar el token de autenticación');
      }

      const retryResponse = await fetch(`${baseUrl}/api/process/${id}`, {
        method: 'GET',
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
}; 