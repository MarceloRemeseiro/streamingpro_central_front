import { InputProcess } from "@/types/processTypes";
import { useStreamStats } from "@/hooks/useStreamStats";

interface StreamStatsProps {
  input: InputProcess;
}

export default function StreamStats({ input }: StreamStatsProps) {
  const stats = useStreamStats(input);

  return (
    <div className="grid grid-cols-4 bg-card-background dark:bg-card-background-dark pb-2 pt-1 rounded-b-lg justify-items-center text-xs">
      <div>
        <span className="font-medium text-text-muted dark:text-text-muted-dark">
          Resolución
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
