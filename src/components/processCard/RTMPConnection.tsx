import { FC } from "react";
import { useCollapse } from "@/hooks/useCollapse";
import { InputProcess } from "@/types/processTypes";
import CollapseButton from '@/components/ui/CollapseButton';
import InfoConnection from "../ui/InfoConnection";

interface RTMPConnectionProps {
  input: InputProcess;
}

const RTMPConnection: FC<RTMPConnectionProps> = ({ input }) => {
  const [isCollapsed, setIsCollapsed] = useCollapse('rtmp-connection', input.id);
  const url = `rtmp://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}`;
  const streamKey = input.streamName;

  const fields = [
    {
      label: "URL",
      value: url,
    },
    {
      label: "Stream Key",
      value: streamKey,
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
            Información de conexión RTMP
          </h3>
        </button>
      </div>

      {!isCollapsed && (
        <InfoConnection fields={fields} />
      )}
    </div>
  );
};

export default RTMPConnection;
