
import { InputProcess } from "@/types/processTypes";
import { useStreamStats } from "@/hooks/useStreamStats";

interface StreamStatsProps {
  input: InputProcess;
}

export default function StreamStats({ input }: StreamStatsProps) {
  const stats = useStreamStats(input);

  return (
    <div className="grid grid-cols-4 bg-gray-800 p-4 rounded-bl-lg rounded-br-lg justify-items-center gap-4">
      <div className=" ">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Resolución
        </span>
        <p className="text-white text-sm">{stats.resolution}</p>
      </div>

      <div className=" ">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          FPS
        </span>
        <p className="text-white text-sm">{stats.fps}</p>
      </div>

      <div className=" ">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Codec
        </span>
        <p className="text-white text-sm">{stats.codec}</p>
      </div>

      <div className=" ">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Bitrate
        </span>
        <p className="text-white text-sm">{stats.bitrate}</p>
      </div>
    </div>
  );
}
