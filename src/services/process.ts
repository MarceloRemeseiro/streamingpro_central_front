import { CreateProcessInput } from '@/types/createProcessTypes';
import { rtmpService } from './rtmpService';
import { srtService } from './srtService';

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