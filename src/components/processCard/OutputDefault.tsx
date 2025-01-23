import { FC } from "react";
import { useCollapse } from "@/hooks/useCollapse";
import CollapseButton from '@/components/ui/CollapseButton';
import InfoConnection from "../ui/InfoConnection";

interface OutputDefaultProps {
  streamId: string;
  processId: string;
}

const OutputDefault: FC<OutputDefaultProps> = ({ streamId, processId }) => {
  const [isCollapsed, setIsCollapsed] = useCollapse('output-default', processId);
  const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || "";
  const port = process.env.NEXT_PUBLIC_RESTREAMER_PORT || "6000";
  const cleanStreamId = streamId
    .replace(".stream", "")
    .replace(",mode:request", "");

  const fields = [
    {
      label: "SRT",
      value: `srt://${baseUrl}:${port}/?mode=caller&transtype=live&streamid=${cleanStreamId},mode:request`,
    },
    {
      label: "RTMP",
      value: `rtmp://${baseUrl}/${cleanStreamId}.stream`,
    },
    {
      label: "HLS",
      value: `https://${baseUrl}/memfs/${cleanStreamId}.m3u8`,
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
            Salidas por defecto
          </h3>
        </button>
      </div>

      {!isCollapsed && (
        <InfoConnection fields={fields} />
      )}
    </div>
  );
};

export default OutputDefault;
