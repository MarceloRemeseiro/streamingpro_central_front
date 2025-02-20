import { FC, useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';

interface ProcessSwitchProps {
  processId: string;
  state: string;
  lastLogLine?: string;
  onStateChange: (isRunning: boolean) => Promise<void>;
}

const ProcessSwitch: FC<ProcessSwitchProps> = ({ processId, state, lastLogLine, onStateChange }) => {
  // Estado para la posición del switch (visual)
  const [switchPosition, setSwitchPosition] = useState(false);
  // Estado para si el proceso está activo (lógica)
  const [isProcessActive, setIsProcessActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Al montar el componente, obtenemos el estado de la API
    const loadSavedState = async () => {
      try {
        const response = await fetch(`/api/process-state?processId=${processId}`);
        if (!response.ok) throw new Error('Error loading process state');
        const data = await response.json();
        setSwitchPosition(data.isEnabled);
      } catch (error) {
        console.error('Error loading process state:', error);
        // Si hay error, usamos el estado actual del proceso
        const isActive = state === 'running' || state === 'connecting' || state === 'starting';
        setSwitchPosition(isActive);
      }
      setIsProcessActive(state === 'running' || state === 'connecting' || state === 'starting');
    };

    loadSavedState();
  }, [processId, state]);

  useEffect(() => {
    // Actualizamos solo el estado lógico cuando cambia el estado del proceso
    const isActive = state === 'running' || state === 'connecting' || state === 'starting';
    setIsProcessActive(isActive);
  }, [state]);

  const isConnecting = () => {
    if (!lastLogLine) return false;
    return (
      lastLogLine.includes('Opening connection') ||
      lastLogLine.includes('Connecting') ||
      lastLogLine.includes('Starting playback') ||
      lastLogLine.includes('Opening stream')
    );
  };

  const handleChange = async (checked: boolean) => {
    if (!checked && isProcessActive) {
      await onStateChange(checked);
      return;
    }

    try {
      setIsLoading(true);
      setSwitchPosition(checked);
      
      // Guardar el estado en la API
      const response = await fetch('/api/process-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processId,
          isEnabled: checked
        }),
      });

      if (!response.ok) throw new Error('Error saving process state');
      
      await onStateChange(checked);
    } catch (error) {
      console.error('Error changing process state:', error);
      setSwitchPosition(!checked);
      // Intentar revertir el estado en la API
      await fetch('/api/process-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processId,
          isEnabled: !checked
        }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStateStyles = () => {
    if (!switchPosition) return 'bg-switch-off';
    if (isConnecting() ) return 'bg-switch-connecting';
    if (state === 'failed') return 'bg-switch-failed';
    if (!isProcessActive) return 'bg-switch-off';
    return 'bg-switch-running';
  };

  return (
    <Switch
      checked={switchPosition}
      onChange={handleChange}
      data-process-id={processId}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-300 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
        ${getStateStyles()}
      `}
    >
      <span className="sr-only">
        {switchPosition ? 'Detener proceso' : 'Iniciar proceso'}
      </span>
      <span
        className={`
          switch-handle
          ${switchPosition ? 'translate-x-6' : 'translate-x-1'}
          inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform duration-200 ease-in-out
          ${isLoading || isConnecting() ? 'animate-pulse' : ''}
        `}
      />
    </Switch>
  );
};

export default ProcessSwitch; 