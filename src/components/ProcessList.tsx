import { useProcesses } from "@/hooks/useProcesses";
import { OutputProcess, InputProcess } from "@/types/processTypes";
import VideoPlayer from "./VideoPlayer";
import { memo } from "react";
import RTMPConnection from "./RTMPConnection";
import SRTConnection from "./SRTConnection";
import OutputDefault from "./OutputDefault";
import RTMPOutput from "./RTMPOutput";
import SRTOutput from "./SRTOutput";

const getInputTypeStyles = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    case "rtmp":
      return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
    default:
      return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  }
};

const getInputTypeLabel = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          SRT
        </span>
      );
    case "rtmp":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
          RTMP
        </span>
      );
    default:
      return null;
  }
};

const OutputItem = memo(({ output }: { output: OutputProcess }) => (
  <div className="pl-4 py-2 border-l-2 border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-sm font-medium">
          {output.metadata?.["restreamer-ui"]?.name || "Output sin nombre"}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {output.config?.output?.[0]?.address || "Sin dirección"}
        </p>
      </div>
      <span
        className={`
        px-2 py-1 text-xs rounded-full
        ${
          output.state?.exec === "running"
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
        }
      `}
      >
        {output.state?.exec || "Desconocido"}
      </span>
    </div>
  </div>
));

const InputCard = memo(({ input }: { input: InputProcess }) => {
  const getHlsUrl = () => {
    const streamName = input.streamName.replace(".stream", "");
    return `http://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}/memfs/${streamName}.m3u8`;
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-sm border ${getInputTypeStyles(
        input.inputType
      )}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {getInputTypeLabel(input.inputType)}
            <h3 className="font-medium">
              {input.metadata?.["restreamer-ui"]?.meta?.name ||
                "Input sin nombre"}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {input.metadata?.["restreamer-ui"]?.meta?.description ||
              "Sin descripción"}
          </p>
        </div>
        <span
          className={`
          px-2 py-1 text-xs rounded-full
          ${
            input.state?.exec === "running"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
          }
        `}
        >
          {input.state?.exec || "Desconocido"}
        </span>
      </div>

      <div className="mb-4">
        <VideoPlayer
          url={getHlsUrl()}
          isRunning={input.state?.exec === "running"}
        />
      </div>

      {input.inputType === "rtmp" && <RTMPConnection input={input} />}
      {input.inputType === "srt" && <SRTConnection input={input} />}

      <OutputDefault streamId={input.streamName} />

      <div className="mt-4">
        {input.outputs.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-vase font-bold text-gray-700 dark:text-gray-300">
              Custom Outputs ({input.outputs.length})
            </h4>
            <div className="space-y-3">
              {input.outputs.map((output) => {
                const address = output.config?.output?.[0]?.address || '';
                const isRTMP = address.startsWith('rtmp://');
                const isSRT = address.startsWith('srt://');

                if (isRTMP) {
                  return <RTMPOutput key={output.id} output={output} />;
                }
                if (isSRT) {
                  return <SRTOutput key={output.id} output={output} />;
                }
                return null;
              })}
            </div>
          </div>
        ) : (
          <p className="text-base text-gray-500 dark:text-gray-400">
            No hay outputs configurados
          </p>
        )}
      </div>
    </div>
  );
});

export const ProcessList = () => {
  const { inputs, isLoading, error, refresh } = useProcesses();

  const sortedInputs = [...inputs].sort((a, b) => {
    const nameA =
      a.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre";
    const nameB =
      b.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre";
    return nameA.localeCompare(nameB);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-md">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refresh}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (inputs.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        No hay inputs activos
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sortedInputs.map((input) => (
        <InputCard key={input.id} input={input} />
      ))}
    </div>
  );
};
