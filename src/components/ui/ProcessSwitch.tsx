import { FC, useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';

interface ProcessSwitchProps {
  processId: string;
  state: string;
  lastLogLine?: string;
  onStateChange: (isRunning: boolean) => Promise<void>;
}

const ProcessSwitch: FC<ProcessSwitchProps> = ({ processId, state, lastLogLine, onStateChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMovedRight, setIsMovedRight] = useState(state === 'running');
  const [previousState, setPreviousState] = useState(state);

  useEffect(() => {
    if (state !== previousState) {
      setIsLoading(false);
      setPreviousState(state);
      setIsMovedRight(state === 'running');
    }
  }, [state, previousState]);

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
    try {
      
      // Si estamos apagando y está running, solo notificamos sin mover el switch
      if (!checked && state === 'running') {
        await onStateChange(false);
        return;
      }

      // Si estamos apagando durante la conexión
      if (!checked && isLoading) {
        setIsMovedRight(false);
        setIsLoading(false);
        await onStateChange(false);
        return;
      }

      // Si estamos encendiendo y no está en loading, procedemos normalmente
      if (!isLoading && checked) {
        setIsMovedRight(true);
        setIsLoading(true);
        await onStateChange(true);
        return;
      }

      // Si estamos apagando y no está running ni loading, apagamos directamente
      if (!checked && state !== 'running' && !isLoading) {
        setIsMovedRight(false);
        await onStateChange(false);
      }
    } catch (error) {
      console.error('Error changing process state:', error);
      // Si hay error al encender, regresamos el switch a su posición original
      if (!state.includes('running')) {
        setIsMovedRight(false);
      }
      setIsLoading(false);
    }
  };

  const getStateStyles = () => {
    if (!isMovedRight) return 'bg-switch-off';
    if (isLoading) return 'bg-switch-connecting';
    if (isConnecting()) return 'bg-switch-connecting';
    
    switch (state) {
      case 'running':
        return 'bg-switch-running';
      case 'failed':
        return 'bg-switch-failed';
      default:
        return 'bg-switch-off';
    }
  };

  return (
    <Switch
      checked={isMovedRight}
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
        {state === 'running' ? 'Detener proceso' : 'Iniciar proceso'}
      </span>
      <span
        className={`
          switch-handle
          ${isMovedRight ? 'translate-x-6' : 'translate-x-1'}
          inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform duration-200 ease-in-out
          ${isLoading || isConnecting() ? 'animate-pulse' : ''}
        `}
      />
    </Switch>
  );
};

export default ProcessSwitch; 