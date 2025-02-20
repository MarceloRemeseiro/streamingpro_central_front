import { useStreamStats } from '@/hooks/useStreamStats';
import { InputProcess } from '@/types/processTypes';

interface StreamStatsProps {
  input: InputProcess;
}

export default function StreamStats({ input }: StreamStatsProps) {
  const stats = useStreamStats(input);

  return (
    <div className="grid grid-cols-4 bg-card-background dark:bg-card-background-dark py-2 rounded-lg justify-items-center text-xs mt-2">
      <div>
        <span className="font-medium text-text-muted dark:text-text-muted-dark">
          Resolution
        </span>
        <p className="text-text dark:text-text-dark">{stats.resolution}</p>
      </div>

      <div>
        <span className="font-medium text-text-muted dark:text-text-muted-dark">
          FPS
        </span>
        <p className="text-text dark:text-text-dark">{stats.fps}</p>
      </div>

      <div>
        <span className="font-medium text-text-muted dark:text-text-muted-dark">
          Codec
        </span>
        <p className="text-text dark:text-text-dark">{stats.codec}</p>
      </div>

      <div>
        <span className="font-medium text-text-muted dark:text-text-muted-dark">
          Bitrate
        </span>
        <p className="text-text dark:text-text-dark">{stats.bitrate}</p>
      </div>
    </div>
  );
}
