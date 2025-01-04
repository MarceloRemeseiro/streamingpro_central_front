import { InputProcess } from "@/types/processTypes";
import CopyButton from "./CopyButton";

interface SRTConnectionProps {
  input: InputProcess;
}

interface VideoSource {
  type: string;
  address?: string;
}

interface ProcessState {
  progress?: {
    inputs: VideoSource[];
  };
}

export default function SRTConnection({ input }: SRTConnectionProps) {
  const state = input.state as ProcessState;
  const videoSource = state?.progress?.inputs?.[0] || {} as VideoSource;

  // Extraer datos de la URL SRT
  const srtUrl = videoSource?.address || "";

  const url = `srt://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || ""}`;
  const port = process.env.NEXT_PUBLIC_RESTREAMER_PORT || '6000';
  const streamId = input.streamName;

  const oneLine = `${url}:${port}?mode=caller&streamid=${streamId},mode:publish`;

  const mainFields = [
      { label: "URL", value: url },
];

const detailFields = [
    { label: "Puerto", value: port },
    { label: "Mode", value: "Caller" },
  ];

  const bottomFields = [
    { label: "Stream ID", value: streamId },
    { label: "One-Line", value: oneLine },
  ];

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Información de conexión SRT
      </h3>

      <div className="space-y-4">
        {mainFields.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <div className="min-w-0 flex-1 mr-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                {label}
              </span>
              <p className="text-gray-900 dark:text-white break-all">{value}</p>
            </div>
            <div className="flex-shrink-0">
              <CopyButton text={value.toString()} />
            </div>
          </div>
        ))}

        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {detailFields.map(({ label, value }) => (
              <div key={label}>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {label}
                </span>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {bottomFields.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <div className="min-w-0 flex-1 mr-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
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
    </div>
  );
}
