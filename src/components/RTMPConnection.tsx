import { InputProcess } from "@/types/processTypes";
import CopyButton from "./CopyButton";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface RTMPConnectionProps {
  input: InputProcess;
}

export default function RTMPConnection({ input }: RTMPConnectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const url = `rtmp://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}`;
  const streamKey = input.streamName;
  const oneLine = `${url}/${streamKey}`;

  const fields = [
    { label: "URL", value: url },
    { label: "Stream Key", value: streamKey },
    { label: "One-Line", value: oneLine }
  ];

  return (
    <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          Información de conexión RTMP
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          {isCollapsed ? (
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronUpIcon className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-2 text-xs">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start justify-between p-1 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="min-w-0 flex-1 mr-2">
                <span className="font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {label}
                </span>
                <p className="text-gray-900 dark:text-white break-all">{value}</p>
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
