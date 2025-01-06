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
      console.log('Process state change requested:', { processId, checked });
      
      // Si estamos apagando, permitimos la acción incluso durante loading
      if (!checked) {
        setIsMovedRight(false);
        await onStateChange(false);
        return;
      }

      // Si estamos encendiendo y no está en loading, procedemos normalmente
      if (!isLoading) {
        setIsMovedRight(true);
        setIsLoading(true);
        await onStateChange(true);
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
    if (!isMovedRight) return 'bg-gray-300 dark:bg-gray-600';
    if (isLoading) return 'bg-orange-400 dark:bg-orange-600';
    if (isConnecting()) return 'bg-orange-400 dark:bg-orange-600';
    
    switch (state) {
      case 'running':
        return 'bg-green-500 dark:bg-green-600';
      case 'failed':
        return 'bg-red-500 dark:bg-red-600';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  return (
    <Switch
      checked={isMovedRight}
      onChange={handleChange}
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