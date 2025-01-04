import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthService } from '@/services/auth';
import { Process } from '@/types/restreamer';
import { InputProcess, OutputProcess, InputType, ProcessState } from '@/types/processTypes';

export const useProcesses = () => {
  const [inputs, setInputs] = useState<InputProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const auth = useRef(AuthService.getInstance());
  const isInitialLoadDone = useRef(false);

  const parseInputAddress = (address: string): { type: InputType; streamName: string } => {
    const srtMatch = address.match(/\{srt,name=([^,}]+)/);
    const rtmpMatch = address.match(/\{rtmp,name=([^,}]+)/);

    if (srtMatch) {
      return { type: 'srt', streamName: srtMatch[1] };
    } else if (rtmpMatch) {
      return { type: 'rtmp', streamName: rtmpMatch[1] };
    }

    return { type: 'rtmp', streamName: 'unknown' };
  };

  const processData = useCallback((data: Process[]) => {
    const inputProcesses: { [key: string]: InputProcess } = {};
    const outputProcesses: OutputProcess[] = [];

    // Primero identificamos todos los inputs
    data.forEach(process => {
      if (process.id.includes(':ingest:') && !process.id.includes('_snapshot')) {
        const streamId = process.reference;
        const inputAddress = process.config.input[0].address;
        const { type, streamName } = parseInputAddress(inputAddress);

        const inputProcess: InputProcess = {
          id: process.id,
          type: process.type,
          reference: process.reference,
          created_at: process.created_at,
          state: process.state as ProcessState,
          metadata: process.metadata,
          config: process.config,
          outputs: [],
          inputType: type,
          streamName,
        } as InputProcess;

        inputProcesses[streamId] = inputProcess;
      }
    });

    // Luego procesamos los outputs y los asignamos a sus inputs
    data.forEach(process => {
      if (process.id.includes(':egress:')) {
        const parentId = process.reference;
        const outputProcess: OutputProcess = {
          id: process.id,
          type: process.type,
          reference: process.reference,
          created_at: process.created_at,
          state: process.state as ProcessState,
          metadata: process.metadata,
          config: process.config,
          parentId,
        } as OutputProcess;
        
        if (inputProcesses[parentId]) {
          inputProcesses[parentId].outputs.push(outputProcess);
        }
      }
    });

    return Object.values(inputProcesses);
  }, []);

  const updateStates = useCallback((data: Process[]) => {
    setInputs(prevInputs => {
      const updatedInputs = prevInputs.map(prevInput => {
        // Buscamos el proceso correspondiente en los nuevos datos
        const newProcess = data.find(p => p.id === prevInput.id);
        if (!newProcess) return prevInput;

        // Solo actualizamos el estado y mantenemos el resto de la información
        const updatedInput: InputProcess = {
          ...prevInput,
          state: newProcess.state as ProcessState
        };

        // Actualizamos los estados de los outputs
        updatedInput.outputs = prevInput.outputs.map(prevOutput => {
          const newOutput = data.find(p => p.id === prevOutput.id);
          if (!newOutput) return prevOutput;

          return {
            ...prevOutput,
            state: newOutput.state as ProcessState
          } as OutputProcess;
        });

        return updatedInput;
      });

      // Solo actualizamos si hay cambios en los estados
      const hasStateChanges = updatedInputs.some((updatedInput, index) => {
        const prevInput = prevInputs[index];
        const stateChanged = updatedInput.state?.exec !== prevInput.state?.exec;
        const outputsChanged = updatedInput.outputs.some((output, outputIndex) => 
          output.state?.exec !== prevInput.outputs[outputIndex]?.state?.exec
        );
        return stateChanged || outputsChanged;
      });

      return hasStateChanges ? updatedInputs : prevInputs;
    });
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const data = await auth.current.request<Process[]>('GET', '/api/v3/process');
      const processedData = processData(data);
      setInputs(processedData);
      setError(null);
      isInitialLoadDone.current = true;
    } catch (err) {
      console.error('Error al obtener procesos:', err);
      setError('No se pudieron cargar los procesos');
    } finally {
      setIsLoading(false);
    }
  }, [processData]);

  const pollStates = useCallback(async () => {
    if (!isInitialLoadDone.current) return;

    try {
      const data = await auth.current.request<Process[]>('GET', '/api/v3/process');
      updateStates(data);
      setError(null);
    } catch (err) {
      console.error('Error al actualizar estados:', err);
    }
  }, [updateStates]);

  useEffect(() => {
    fetchInitialData();

    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(async () => {
        await pollStates();
        startPolling();
      }, 10000);
    };

    startPolling();

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [fetchInitialData, pollStates]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchInitialData();
  }, [fetchInitialData]);

  return {
    inputs,
    isLoading,
    error,
    refresh
  };
}; 