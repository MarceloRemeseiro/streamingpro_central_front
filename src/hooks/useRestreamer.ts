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
  }, [restreamerService]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const createInput = useCallback(async () => {
    try {
      await restreamerService.createInput();
      await fetchProcesses();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error al crear el input');
    }
  }, [fetchProcesses, restreamerService]);

  const createOutput = useCallback(async () => {
    try {
      await restreamerService.createOutput();
      await fetchProcesses();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error al crear el output');
    }
  }, [fetchProcesses, restreamerService]);

  const deleteProcess = useCallback(async (processId: string) => {
    try {
      const response = await restreamerService.deleteProcess(processId);
      if (response.deletedOutputs > 0) {
      } else {
      }
      await fetchProcesses();
    } catch (err) {
      console.error('Error al eliminar el proceso:', err);
      throw err instanceof Error ? err : new Error('Error al eliminar el proceso');
    }
  }, [fetchProcesses, restreamerService]);

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