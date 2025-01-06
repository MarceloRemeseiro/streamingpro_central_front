import { InputProcess } from "@/types/processTypes";
import { useStreamStats } from "@/hooks/useStreamStats";

interface StreamStatsProps {
  input: InputProcess;
}

export default function StreamStats({ input }: StreamStatsProps) {
  const stats = useStreamStats(input);

  return (
    <div className="grid grid-cols-4 bg-card-background pb-2 pt-1 rounded-b-lg justify-items-center text-xs">
      <div>
        <span className="font-medium text-text-muted">
          Resolución
        </span>
        <p className="text-text-light">{stats.resolution}</p>
      </div>

      <div>
        <span className="font-medium text-text-muted">
          FPS
        </span>
        <p className="text-text-light">{stats.fps}</p>
      </div>

      <div>
        <span className="font-medium text-text-muted">
          Codec
        </span>
        <p className="text-text-light">{stats.codec}</p>
      </div>

      <div>
        <span className="font-medium text-text-muted">
          Bitrate
        </span>
        <p className="text-text-light">{stats.bitrate}</p>
      </div>
    </div>
  );
}
