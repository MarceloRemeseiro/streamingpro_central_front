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
      console.log('Sending command:', command, 'to process:', processId);
      
      const response = await fetch(`/api/process/${processId}/command`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(JSON.stringify(errorData));
        } catch {
          throw new Error(responseText);
        }
      }

      // Solo intentamos parsear como JSON si hay contenido
      const data = responseText ? JSON.parse(responseText) : {};
      console.log('Command response:', data);
    } catch (error) {
      console.error('Error in sendCommand:', error);
      throw error;
    }
  }
}

export const processCommandService = ProcessCommandService.getInstance(); 