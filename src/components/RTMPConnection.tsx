import { InputProcess } from "@/types/processTypes";
import CopyButton from "./CopyButton";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

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
    <div className="mt-2 p-3 bg-card-background rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-text-primary">
          Información de conexión RTMP
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-info-background rounded-full transition-colors"
        >
          {isCollapsed ? (
            <ChevronDownIcon className="h-4 w-4 text-secondary" />
          ) : (
            <ChevronUpIcon className="h-4 w-4 text-secondary" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-2 text-xs">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start justify-between p-1 bg-info-background rounded"
            >
              <div className="min-w-0 flex-1 mr-2">
                <span className="font-medium text-text-muted block mb-1">
                  {label}
                </span>
                <p className="text-text-primary break-all">{value}</p>
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
