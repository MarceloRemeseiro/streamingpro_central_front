import { useEffect, useState } from 'react';
import { InputProcess, VideoInput } from '@/types/processTypes';
import { getProcess } from '@/services/process';

interface StreamStats {
  fps: string;
  bitrate: string;
  resolution: string;
  codec: string;
  packetLoss: string;
}

const initialStats: StreamStats = {
  fps: 'N/A',
  bitrate: 'N/A',
  resolution: 'N/A',
  codec: 'N/A',
  packetLoss: '0.00'
};

export const useStreamStats = (input: InputProcess) => {
  const [stats, setStats] = useState<StreamStats>(initialStats);

  useEffect(() => {
    const updateStats = async () => {
      try {
        if (input.state?.exec !== 'running') {
          setStats(initialStats);
          return;
        }

        const process = await getProcess(input.id);
        
        if (!process?.progress?.inputs) {
          setStats(initialStats);
          return;
        }

        const progress = process.progress;

        // Calcular pérdida de paquetes
        const totalPackets = progress.packet || 0;
        const droppedPackets = progress.drop || 0;
        const lossPercentage = totalPackets > 0 
          ? ((droppedPackets / totalPackets) * 100).toFixed(2)
          : '0.00';

        if (input.inputType === 'rtmp') {
          const videoInput = progress.inputs.find((input: VideoInput) => input.type === 'video');
          
          if (videoInput) {
            const newStats = {
              fps: videoInput.fps ? `${videoInput.fps.toFixed(2)} fps` : 'N/A',
              bitrate: videoInput.bitrate_kbit ? `${(videoInput.bitrate_kbit / 1000).toFixed(2)} Mbps` : 'N/A',
              resolution: videoInput.width && videoInput.height ? `${videoInput.width}x${videoInput.height}` : 'N/A',
              codec: videoInput.codec || 'N/A',
              packetLoss: lossPercentage
            };
            setStats(newStats);
          }
        } else if (input.inputType === 'srt') {
          const videoInput = progress.inputs.find((input: VideoInput) => input.type === 'video');
          
          if (videoInput) {
            const newStats = {
              fps: videoInput.fps ? `${videoInput.fps.toFixed(2)} fps` : 'N/A',
              bitrate: videoInput.bitrate_kbit ? `${(videoInput.bitrate_kbit / 1000).toFixed(2)} Mbps` : 'N/A',
              resolution: videoInput.width && videoInput.height ? `${videoInput.width}x${videoInput.height}` : 'N/A',
              codec: videoInput.codec || 'N/A',
              packetLoss: lossPercentage
            };
            setStats(newStats);
          } else {
            setStats(initialStats);
          }
        }

      } catch (error) {
        console.error('Error actualizando estadísticas:', error);
        setStats(initialStats);
      }
    };

    updateStats();
    const intervalId: NodeJS.Timeout = setInterval(updateStats, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [input.id, input.state?.exec, input.inputType]);

  return stats;
}; 