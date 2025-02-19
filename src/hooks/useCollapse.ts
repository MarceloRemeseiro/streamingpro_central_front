import { useState, useEffect } from 'react';

type CollapseType = 'video-preview' | 'output-default' | 'rtmp-connection' | 'srt-connection' | 'rtmp-output' | 'srt-output';

export const useCollapse = (type: CollapseType, processId: string, defaultValue: boolean = false) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch(`/api/collapse-state?processId=${processId}&type=${type}`);
        const data = await response.json();
        setIsCollapsed(data.isCollapsed);
      } catch (error) {
        console.error('Error fetching collapse state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
  }, [processId, type]);

  const updateCollapse = async (newState: boolean) => {
    try {
      await fetch('/api/collapse-state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processId,
          type,
          isCollapsed: newState,
        }),
      });
      
      setIsCollapsed(newState);
    } catch (error) {
      console.error('Error updating collapse state:', error);
    }
  };

  return [isCollapsed, updateCollapse, isLoading] as const;
}; 