import { InputProcess } from "@/types/processTypes";
import CopyButton from "./CopyButton";

interface SRTConnectionProps {
  input: InputProcess;
}

interface VideoSource {
  type: string;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  url?: string;
}

export default function SRTConnection({ input }: SRTConnectionProps) {
  const videoSource =
    (input.metadata?.["restreamer-ui"]?.sources?.[0]
      ?.streams?.[0] as VideoSource) || {};

  // Extraer datos del video
  const resolution =
    videoSource.width && videoSource.height
      ? `${videoSource.width}x${videoSource.height}`
      : "N/A";
  const fps = videoSource?.fps || "N/A";
  const codec = videoSource?.codec?.toUpperCase() || "N/A";

  // Extraer datos de la URL SRT
  const srtUrl = videoSource?.url || "";
  const urlParams = new URLSearchParams(srtUrl.split("?")[1]);

  const url = `srt://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || ""}`;
  const port = process.env.NEXT_PUBLIC_RESTREAMER_PORT || '6000';
  const latency = urlParams.get("latency") || "20000";
  const streamId =
    urlParams.get("streamid")?.replace(",mode:request", "") || input.streamName;

  const oneLine = `${url}:${port}?type=caller&streamid=${streamId}&latency=${latency},mode:publish`;

  const mainFields = [
    { label: "URL", value: url },
  ];

  const detailFields = [
    { label: "Resolución", value: resolution },
    { label: "FPS", value: fps },
    { label: "Codec", value: codec },
    { label: "Puerto", value: port },
    { label: "Mode", value: "Caller" },
    { label: "Latency", value: `${latency}ms` },
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
