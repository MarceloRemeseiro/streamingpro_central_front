"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useProcesses } from "@/hooks/useProcesses";
import { InputProcess } from "@/types/processTypes";
import VideoPlayer from "./VideoPlayer";
import OutputDefault from "./OutputDefault";
import RTMPConnection from "./RTMPConnection";
import SRTConnection from "./SRTConnection";
import CustomOutputs from "./CustomOutputs";
import RTMPOutput from "./RTMPOutput";
import SRTOutput from "./SRTOutput";
import PacketLossStats from "./PacketLossStats";
import DeleteProcessModal from "./DeleteProcessModal";
import EditProcessModal from "./EditProcessModal";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

const getInputTypeStyles = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return "bg-protocol-srt-background border-protocol-srt-border";
    case "rtmp":
      return "bg-protocol-rtmp-background border-protocol-rtmp-border";
    default:
      return "bg-card-background border-border-color";
  }
};

const getInputTypeLabel = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-protocol-srt-background text-protocol-srt-text">
          SRT
        </span>
      );
    case "rtmp":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-protocol-rtmp-background text-protocol-rtmp-text">
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
              <Link 
                href={`/input/${input.id}`}
                className="font-medium hover:text-hover-link transition-colors"
              >
                {input.metadata?.["restreamer-ui"]?.meta?.name ||
                  "Input sin nombre"}
              </Link>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 text-secondary hover:text-secondary-dark"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-text-muted">
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
                ? "bg-success-light text-success-dark"
                : "bg-error-light text-error-dark"
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
                className="p-1 text-error hover:text-error-dark"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <VideoPlayer
          url={getHlsUrl()}
          isRunning={input.state?.exec === "running"}
          stats={input}
        />

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
              <h4 className="text-base font-bold text-text-primary">
                Custom Outputs ({input.outputs.length})
              </h4>
              <div className="space-y-3">
                {input.outputs
                  .sort((a, b) => {
                    const nameA = a.metadata?.["restreamer-ui"]?.name || "";
                    const nameB = b.metadata?.["restreamer-ui"]?.name || "";
                    return nameA.localeCompare(nameB);
                  })
                  .map((output) => {
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
            <p className="text-base text-text-muted">
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
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        });
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light p-4 rounded-md">
        <p className="text-error">{error}</p>
        <button
          onClick={refresh}
          className="mt-2 text-sm text-error hover:text-error-dark"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (inputs.length === 0) {
    return (
      <div className="text-center p-8 text-text-muted">
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
