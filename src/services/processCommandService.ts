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
    try {
      
      const response = await fetch(`/api/process/${processId}/command`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(JSON.stringify(errorData));
        } catch {
          throw new Error(responseText);
        }
      }

     
    } catch (error) {
      console.error('Error in sendCommand:', error);
      throw error;
    }
  }
}

export const processCommandService = ProcessCommandService.getInstance(); 