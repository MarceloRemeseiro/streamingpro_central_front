import { InputProcess } from "@/types/processTypes";
import { useStreamStats } from "@/hooks/useStreamStats";

interface PacketLossStatsProps {
  input: InputProcess;
}

export default function PacketLossStats({ input }: PacketLossStatsProps) {
  const stats = useStreamStats(input);
  const lossPercentage = stats.packetLoss;

  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] font-medium text-gray-400">Packet Loss</span>
      <p
        className={`text-xs font-medium leading-none ${
          parseFloat(lossPercentage) > 1
            ? "text-red-400 dark:text-red-500"
            : "text-green-500 dark:text-green-400"
        }`}
      >
        {lossPercentage}%
      </p>
    </div>
  );
}
