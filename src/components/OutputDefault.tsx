import { FC, useState } from "react";
import CopyButton from "./CopyButton";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface OutputDefaultProps {
  streamId: string;
}

const OutputDefault: FC<OutputDefaultProps> = ({ streamId }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || "";
  const port = process.env.NEXT_PUBLIC_RESTREAMER_PORT || "6000";
  const cleanStreamId = streamId
    .replace(".stream", "")
    .replace(",mode:request", "");

  const outputs = [
    {
      label: "SRT",
      url: `srt://${baseUrl}:${port}/?mode=caller&transtype=live&streamid=${cleanStreamId},mode:request`,
    },
    {
      label: "RTMP",
      url: `rtmp://${baseUrl}/${cleanStreamId}.stream`,
    },
    {
      label: "HLS",
      url: `https://${baseUrl}/memfs/${cleanStreamId}.m3u8`,
    },
   /*  {
      label: "HTML",
      url: `https://${baseUrl}/${cleanStreamId}.html`,
    }, */
  ];

  return (
    <div className="mt-2 p-3 bg-card-background dark:bg-card-background-dark rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-text dark:text-text-dark">
          Outputs por defecto
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-info-background dark:hover:bg-info-background-dark rounded-full transition-colors"
        >
          {isCollapsed ? (
            <ChevronDownIcon className="h-4 w-4 text-secondary dark:text-secondary-dark" />
          ) : (
            <ChevronUpIcon className="h-4 w-4 text-secondary dark:text-secondary-dark" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-2 text-xs">
          {outputs.map(({ label, url }) => (
            <div
              key={label}
              className="flex items-start justify-between p-1 bg-info-background dark:bg-info-background-dark rounded"
            >
              <div className="min-w-0 flex-1 mr-2">
                <span className="font-medium text-text-muted dark:text-text-muted-dark block mb-1">
                  {label}
                </span>
                <p className="text-text dark:text-text-dark break-all">{url}</p>
              </div>
              <div className="flex-shrink-0">
                <CopyButton text={url} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutputDefault;
