import { InputProcess } from "@/types/processTypes";
import CopyButton from "../ui/CopyButton";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import CollapseButton from '@/components/ui/CollapseButton';

interface SRTConnectionProps {
  input: InputProcess;
}

export default function SRTConnection({ input }: SRTConnectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || "";
  const port = process.env.NEXT_PUBLIC_RESTREAMER_PORT || "6000";
  const streamId = input.streamName;

  const url = `srt://${baseUrl}`;
  const oneLine = `${url}:${port}?mode=caller&streamid=${streamId},mode:publish`;

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
        <div className="space-y-2 text-xs">
          <div className="flex items-start justify-between p-1 bg-info-background dark:bg-info-background-dark rounded">
            <div className="min-w-0 flex-1 mr-2">
              <span className="font-medium text-text-muted dark:text-text-muted-dark block mb-1">
                URL
              </span>
              <p className="text-text dark:text-text-dark break-all">{url}</p>
            </div>
            <div className="flex-shrink-0">
              <CopyButton text={url} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-info-background dark:bg-info-background-dark rounded">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <span className="font-medium text-text-muted dark:text-text-muted-dark block mb-1">
                  Port
                </span>
                <p className="text-text dark:text-text-dark break-all">{port}</p>
              </div>
              <div className="flex-shrink-0">
                <CopyButton text={port} />
              </div>
            </div>
            <div>
              <span className="font-medium text-text-muted dark:text-text-muted-dark block mb-1">
                Mode
              </span>
              <p className="text-text dark:text-text-dark">Caller</p>
            </div>
          </div>

          <div className="flex items-start justify-between p-1 bg-info-background dark:bg-info-background-dark rounded">
            <div className="min-w-0 flex-1 mr-2">
              <span className="font-medium text-text-muted dark:text-text-muted-dark block mb-1">
                Stream ID
              </span>
              <p className="text-text dark:text-text-dark break-all">{`${streamId},mode:publish`}</p>
            </div>
            <div className="flex-shrink-0">
              <CopyButton text={`${streamId},mode:publish`} />
            </div>
          </div>

          <div className="flex items-start justify-between p-1 bg-info-background dark:bg-info-background-dark rounded">
            <div className="min-w-0 flex-1 mr-2">
              <span className="font-medium text-text-muted dark:text-text-muted-dark block mb-1">
                One-Line
              </span>
              <p className="text-text dark:text-text-dark break-all">{oneLine}</p>
            </div>
            <div className="flex-shrink-0">
              <CopyButton text={oneLine} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
