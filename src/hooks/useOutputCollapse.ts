import { useState, useEffect } from 'react';

type OutputCollapseType = 'rtmp-output' | 'srt-output';

export const useOutputCollapse = (type: OutputCollapseType, outputId: string) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch(`/api/collapse-state?processId=${outputId}&type=${type}`);
        const data = await response.json();
        setIsCollapsed(data.isCollapsed);
      } catch (error) {
        console.error('Error fetching output collapse state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
  }, [outputId, type]);

  const updateCollapse = async (newState: boolean) => {
    try {
      await fetch('/api/collapse-state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processId: outputId,
          type,
          isCollapsed: newState,
        }),
      });
      
      setIsCollapsed(newState);
    } catch (error) {
      console.error('Error updating output collapse state:', error);
    }
  };

  return [isCollapsed, updateCollapse, isLoading] as const;
}; 