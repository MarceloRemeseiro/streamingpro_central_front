import { useState, useEffect, useCallback } from 'react';
import { InputProcess } from '@/types/processTypes';

export const useProcessState = (initialProcess: InputProcess) => {
  const [stats, setStats] = useState({
    resolution: 'N/A',
    fps: 'N/A',
    codec: 'N/A',
    bitrate: 'N/A'
  });

  const updateStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/process/${initialProcess.id}`);
      const data = await response.json();

      if (!response.ok || !data?.state?.progress?.inputs?.[0]) {
        return;
      }

      const input = data.state.progress.inputs[0];
      
      setStats({
        resolution: input.width && input.height ? `${input.width}x${input.height}` : 'N/A',
        fps: input.fps ? `${input.fps.toFixed(2)} fps` : 'N/A',
        codec: input.codec?.toUpperCase() || 'N/A',
        bitrate: input.bitrate_kbit ? `${(input.bitrate_kbit / 1000).toFixed(2)} Mbps` : 'N/A'
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, [initialProcess.id]);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, [updateStats]);

  return stats;
}; 