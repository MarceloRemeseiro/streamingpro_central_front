import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth';
import { Process } from '@/types/restreamer';
import { InputProcess, OutputProcess, InputType } from '@/types/processTypes';

export const useProcesses = () => {
  const [inputs, setInputs] = useState<InputProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseInputAddress = (address: string): { type: InputType; streamName: string } => {
    const srtMatch = address.match(/\{srt,name=([^,}]+)/);
    const rtmpMatch = address.match(/\{rtmp,name=([^,}]+)/);

    if (srtMatch) {
      return { type: 'srt', streamName: srtMatch[1] };
    } else if (rtmpMatch) {
      return { type: 'rtmp', streamName: rtmpMatch[1] };
    }

    // Por defecto, asumimos RTMP si no podemos determinar el tipo
    return { type: 'rtmp', streamName: 'unknown' };
  };

  const processData = (data: Process[]) => {
    const inputProcesses: { [key: string]: InputProcess } = {};
    const outputProcesses: OutputProcess[] = [];

    // Primero identificamos todos los inputs
    data.forEach(process => {
      if (process.id.includes(':ingest:') && !process.id.includes('_snapshot')) {
        const streamId = process.reference;
        const inputAddress = process.config.input[0].address;
        const { type, streamName } = parseInputAddress(inputAddress);

        inputProcesses[streamId] = {
          ...process,
          outputs: [],
          inputType: type,
          streamName,
        };
      }
    });

    // Luego procesamos los outputs y los asignamos a sus inputs
    data.forEach(process => {
      if (process.id.includes(':egress:')) {
        const parentId = process.reference;
        const outputProcess: OutputProcess = {
          ...process,
          parentId,
        };
        
        if (inputProcesses[parentId]) {
          inputProcesses[parentId].outputs.push(outputProcess);
        }
      }
    });

    return Object.values(inputProcesses);
  };

  const fetchProcesses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = AuthService.getInstance();
      const data = await auth.request<Process[]>('GET', '/api/v3/process');
      const processedData = processData(data);
      setInputs(processedData);
    } catch (err) {
      console.error('Error al obtener procesos:', err);
      setError('No se pudieron cargar los procesos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  return {
    inputs,
    isLoading,
    error,
    refresh: fetchProcesses,
  };
}; 