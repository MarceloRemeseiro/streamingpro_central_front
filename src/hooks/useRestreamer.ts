import { useState, useEffect, useCallback } from 'react';
import { InputInfo } from '../types/restreamer';
import { RestreamerService } from '../services/restreamer';

export const useRestreamer = () => {
  const [processes, setProcesses] = useState<InputInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restreamerService = RestreamerService.getInstance();

  const fetchProcesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restreamerService.getProcesses();
      setProcesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener los procesos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const createInput = useCallback(async (data: {
    name: string;
    description: string;
    inputAddress: string;
  }) => {
    try {
      await restreamerService.createInput(data);
      await fetchProcesses(); // Actualizar la lista después de crear
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error al crear el input');
    }
  }, [fetchProcesses]);

  const createOutput = useCallback(async (
    streamId: string,
    data: {
      name: string;
      address: string;
      streamKey?: string;
    }
  ) => {
    try {
      await restreamerService.createOutput(streamId, data);
      await fetchProcesses(); // Actualizar la lista después de crear
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error al crear el output');
    }
  }, [fetchProcesses]);

  const deleteProcess = useCallback(async (processId: string) => {
    try {
      await restreamerService.deleteProcess(processId);
      await fetchProcesses(); // Actualizar la lista después de eliminar
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error al eliminar el proceso');
    }
  }, [fetchProcesses]);

  return {
    processes,
    loading,
    error,
    refresh: fetchProcesses,
    createInput,
    createOutput,
    deleteProcess,
  };
}; 