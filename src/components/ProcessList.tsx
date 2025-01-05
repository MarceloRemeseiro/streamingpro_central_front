"use client";

import { memo, useState } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { InputProcess } from "@/types/processTypes";
import VideoPlayer from "./VideoPlayer";
import OutputDefault from "./OutputDefault";
import RTMPConnection from "./RTMPConnection";
import SRTConnection from "./SRTConnection";
import CustomOutputs from "./CustomOutputs";
import RTMPOutput from "./RTMPOutput";
import SRTOutput from "./SRTOutput";
import StreamStats from "./StreamStats";
import PacketLossStats from "./PacketLossStats";
import DeleteProcessModal from "./DeleteProcessModal";
import EditProcessModal from "./EditProcessModal";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

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

const InputCard = memo(
  ({
    input,
    onDeleteClick,
    onProcessUpdated,
  }: {
    input: InputProcess;
    onDeleteClick: (input: InputProcess) => void;
    onProcessUpdated: () => void;
  }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {input.metadata?.["restreamer-ui"]?.meta?.description ||
                "Sin descripción"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
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
            {input.state?.exec === "running" ? (
              <PacketLossStats input={input} />
            ) : (
              <button
                onClick={() => onDeleteClick(input)}
                className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <VideoPlayer
          url={getHlsUrl()}
          isRunning={input.state?.exec === "running"}
        />

        <StreamStats input={input} />

        {input.inputType === "rtmp" && <RTMPConnection input={input} />}
        {input.inputType === "srt" && <SRTConnection input={input} />}

        <OutputDefault streamId={input.streamName} />

        <CustomOutputs
          streamId={input.streamName}
          onOutputCreated={onProcessUpdated}
        />

        <div className="mt-4">
          {input.outputs.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-vase font-bold text-gray-700 dark:text-gray-300">
                Custom Outputs ({input.outputs.length})
              </h4>
              <div className="space-y-3">
                {input.outputs.map((output) => {
                  const address = output.config?.output?.[0]?.address || "";
                  const isRTMP = address.startsWith("rtmp://");
                  const isSRT = address.startsWith("srt://");

                  if (isRTMP) {
                    return (
                      <RTMPOutput
                        key={output.id}
                        output={output}
                        onDeleted={onProcessUpdated}
                        onUpdated={onProcessUpdated}
                      />
                    );
                  }
                  if (isSRT) {
                    return (
                      <SRTOutput
                        key={output.id}
                        output={output}
                        onDeleted={onProcessUpdated}
                        onUpdated={onProcessUpdated}
                      />
                    );
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

        <EditProcessModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          process={input}
          onProcessUpdated={onProcessUpdated}
        />
      </div>
    );
  }
);

InputCard.displayName = "InputCard";

const ProcessList = () => {
  const { inputs, isLoading, error, refresh } = useProcesses();
  const [processToDelete, setProcessToDelete] = useState<InputProcess | null>(
    null
  );

  const handleDeleteClick = (input: InputProcess) => {
    setProcessToDelete(input);
  };

  const handleDeleteConfirm = async () => {
    if (!processToDelete) return;

    try {
      const response = await fetch(`/api/process/${processToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el proceso");
      }

      setProcessToDelete(null);
      refresh();
    } catch (error) {
      console.error("Error deleting process:", error);
    }
  };

  const handleProcessUpdated = () => {
    const scrollPosition = window.scrollY;
    refresh().then(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "instant",
      });
    });
  };

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
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {sortedInputs.map((input) => (
          <InputCard
            key={input.id}
            input={input}
            onDeleteClick={handleDeleteClick}
            onProcessUpdated={handleProcessUpdated}
          />
        ))}
      </div>

      <DeleteProcessModal
        isOpen={!!processToDelete}
        onClose={() => setProcessToDelete(null)}
        onConfirm={handleDeleteConfirm}
        processName={
          processToDelete?.metadata?.["restreamer-ui"]?.meta?.name || ""
        }
      />
    </>
  );
};

export { ProcessList };
