import { useStreamStats } from '@/hooks/useStreamStats';
import { InputProcess } from '@/types/processTypes';

interface PacketLossStatsProps {
  input: InputProcess;
}

export default function PacketLossStats({ input }: PacketLossStatsProps) {
  const stats = useStreamStats(input);
  const lossPercentage = stats.packetLoss;

  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] font-medium text-packetLoss-text">Packet Loss</span>
      <p
        className={`text-xs font-medium leading-none ${
          parseFloat(lossPercentage) > 1
            ? "text-packetLoss-bad"
            : "text-packetLoss-good"
        }`}
      >
        {lossPercentage}%
      </p>
    </div>
  );
}
