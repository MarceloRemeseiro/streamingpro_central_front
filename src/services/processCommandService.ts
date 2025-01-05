
class ProcessCommandService {
  private static instance: ProcessCommandService;

  private constructor() {}

  public static getInstance(): ProcessCommandService {
    if (!ProcessCommandService.instance) {
      ProcessCommandService.instance = new ProcessCommandService();
    }
    return ProcessCommandService.instance;
  }

  public async sendCommand(processId: string, command: 'start' | 'stop'): Promise<void> {
    const response = await fetch(`/api/process/${processId}/command`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al enviar el comando');
    }
  }
}

export const processCommandService = ProcessCommandService.getInstance(); 