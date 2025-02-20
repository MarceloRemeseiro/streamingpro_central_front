import { useState, useEffect, useCallback } from 'react';

export const useRecordingState = (processId: string) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const updateRecordingState = useCallback(async (newState: boolean) => {
    console.log('updateRecordingState called:', { 
      processId, 
      newState,
      currentState: isRecording,
      timestamp: Date.now()
    });
    
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const response = await fetch(`/api/recording/${processId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isRecording: newState,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar el estado de la grabación');
      }

      const data = await response.json();
      setIsRecording(!!data.isRecording);
      setLastUpdate(Date.now());
      setError(null);
    } catch (error) {
      console.error('Error updating recording state:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setIsRecording(!newState);
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  const fetchState = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/recording/${processId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener el estado de la grabación');
      }
      
      const data = await response.json();
   
      
      if (Date.now() - lastUpdate > 2000) {
        setIsRecording(!!data.isRecording);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching recording state:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [processId, lastUpdate]);

  useEffect(() => {
   
    
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [processId, fetchState]);

  const toggleRecording = useCallback(() => {
    console.log('toggleRecording called:', { 
      processId, 
      currentState: isRecording,
      timestamp: Date.now()
    });
    
    const newState = !isRecording;
    setIsRecording(newState);
    setLastUpdate(Date.now());
    updateRecordingState(newState);
  }, [processId, isRecording, updateRecordingState]);

  const stopRecording = useCallback(() => {
    console.log('stopRecording called:', { 
      processId, 
      currentState: isRecording,
      timestamp: Date.now()
    });
    
    setIsRecording(false);
    setLastUpdate(Date.now());
    updateRecordingState(false);
  }, [processId, isRecording, updateRecordingState]);

  return {
    isRecording,
    isLoading,
    error,
    toggleRecording,
    stopRecording
  };
}; 