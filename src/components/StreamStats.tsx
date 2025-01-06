import { InputProcess } from "@/types/processTypes";
import { useStreamStats } from "@/hooks/useStreamStats";

interface StreamStatsProps {
  input: InputProcess;
}

export default function StreamStats({ input }: StreamStatsProps) {
  const stats = useStreamStats(input);

  return (
    <div className="grid grid-cols-4 bg-gray-800 pb-2 pt-1 rounded-b-lg justify-items-center text-xs">
      <div className=" ">
        <span className="font-medium text-gray-500 dark:text-gray-400">
          Resolución
        </span>
        <p className="text-white ">{stats.resolution}</p>
      </div>

      <div className=" ">
        <span className=" font-medium text-gray-500 dark:text-gray-400">
          FPS
        </span>
        <p className="text-white ">{stats.fps}</p>
      </div>

      <div className=" ">
        <span className=" font-medium text-gray-500 dark:text-gray-400">
          Codec
        </span>
        <p className="text-white ">{stats.codec}</p>
      </div>

      <div className=" ">
        <span className=" font-medium text-gray-500 dark:text-gray-400">
          Bitrate
        </span>
        <p className="text-white ">{stats.bitrate}</p>
      </div>
    </div>
  );
}
