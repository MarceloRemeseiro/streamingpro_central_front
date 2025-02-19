import { prisma } from '@/lib/db';

export class ProcessStateService {
  private static instance: ProcessStateService;

  private constructor() {}

  static getInstance(): ProcessStateService {
    if (!ProcessStateService.instance) {
      ProcessStateService.instance = new ProcessStateService();
    }
    return ProcessStateService.instance;
  }

  async getProcessState(processId: string): Promise<boolean> {
    const state = await prisma.processState.findUnique({
      where: { id: processId }
    });
    return state?.isEnabled ?? false;
  }

  async setProcessState(processId: string, isEnabled: boolean): Promise<void> {
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

  async deleteProcessState(processId: string): Promise<void> {
    await prisma.processState.delete({
      where: { id: processId }
    }).catch(() => {
      // Ignoramos el error si el registro no existe
    });
  }
} 