import { InputProcess } from "@/types/processTypes";
import CopyButton from "../ui/CopyButton";
import { useState } from "react";
import CollapseButton from '@/components/ui/CollapseButton';

interface RTMPConnectionProps {
  input: InputProcess;
}

export default function RTMPConnection({ input }: RTMPConnectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const url = `rtmp://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}`;
  const streamKey = input.streamName;
  const oneLine = `${url}/${streamKey}`;

  const fields = [
    { label: "URL", value: url },
    { label: "Stream Key", value: streamKey },
    { label: "One-Line", value: oneLine }
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
        <div className="space-y-2 text-xs">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start justify-between p-1 bg-info-background dark:bg-info-background-dark rounded"
            >
              <div className="min-w-0 flex-1 mr-2">
                <span className="font-medium text-text-muted dark:text-text-muted-dark block mb-1">
                  {label}
                </span>
                <p className="text-text dark:text-text-dark break-all">{value}</p>
              </div>
              <div className="flex-shrink-0">
                <CopyButton text={value.toString()} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
