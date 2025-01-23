import { FC } from "react";
import { useCollapse } from "@/hooks/useCollapse";
import { InputProcess } from "@/types/processTypes";
import CollapseButton from '@/components/ui/CollapseButton';
import InfoConnection from "../ui/InfoConnection";

interface SRTConnectionProps {
  input: InputProcess;
}

const SRTConnection: FC<SRTConnectionProps> = ({ input }) => {
  const [isCollapsed, setIsCollapsed] = useCollapse('srt-connection', input.id);
  const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || "";
  const port = process.env.NEXT_PUBLIC_RESTREAMER_PORT || "6000";
  const streamId = input.streamName;

  const url = `srt://${baseUrl}`;
  const oneLine = `${url}:${port}?mode=caller&streamid=${streamId},mode:publish`;

  const fields = [
    {
      label: "URL",
      value: url,
    },
    {
      label: "Port",
      value: port,
      grid: true,
    },
    {
      label: "Mode",
      value: "Caller",
    },
    {
      label: "Stream ID",
      value: `${streamId},mode:publish`,
    },
    {
      label: "One-Line",
      value: oneLine,
    },
  ];

  return (
    <div className="mt-2 p-3 bg-card-background dark:bg-card-background-dark rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 flex-1 group"
        >
          <CollapseButton 
            isCollapsed={isCollapsed} 
          />
          <h3 className="text-base font-medium text-text dark:text-text-dark">
            Información de conexión SRT
          </h3>
        </button>
      </div>

      {!isCollapsed && (
        <InfoConnection fields={fields} />
      )}
    </div>
  );
};

export default SRTConnection;
