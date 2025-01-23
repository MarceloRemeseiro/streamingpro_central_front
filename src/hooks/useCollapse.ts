import { useState, useEffect } from 'react';

type CollapseType = 'video-preview' | 'output-default' | 'rtmp-connection' | 'srt-connection' | 'rtmp-output' | 'srt-output';

export const useCollapse = (type: CollapseType, processId: string, defaultValue: boolean = false) => {
  // Creamos una key única combinando el tipo y el ID del proceso
  const key = `${processId}-${type}`;
  
  // Inicializamos el estado desde localStorage o usamos el valor por defecto
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    const stored = localStorage.getItem('collapse-states');
    if (!stored) return defaultValue;

    try {
      const states = JSON.parse(stored);
      return states[key] ?? defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    // Actualizamos localStorage cuando cambia el estado
    const stored = localStorage.getItem('collapse-states');
    let states = {};

    try {
      states = stored ? JSON.parse(stored) : {};
    } catch {
      states = {};
    }

    localStorage.setItem(
      'collapse-states',
      JSON.stringify({
        ...states,
        [key]: isCollapsed,
      })
    );
  }, [isCollapsed, key]);

  return [isCollapsed, setIsCollapsed] as const;
}; 