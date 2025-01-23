"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useProcesses } from "@/hooks/useProcesses";
import { InputProcess } from "@/types/processTypes";
import VideoPlayer from "@/components/processCard/VideoPlayer";
import OutputDefault from "@/components/processCard/OutputDefault";
import RTMPConnection from "@/components/processCard/RTMPConnection";
import SRTConnection from "@/components/processCard/SRTConnection";
import CustomOutputs from "@/components/processCard/CustomOutputs";
import RTMPOutput from "@/components/processOutputs/RTMPOutput";
import SRTOutput from "@/components/processOutputs/SRTOutput";
import PacketLossStats from "@/components/processCard/PacketLossStats";
import DeleteProcessModal from "@/components/modals/DeleteProcessModal";
import EditProcessModal from "@/components/modals/EditProcessModal";
import Button from '@/components/ui/Button';
import EditButton from '../ui/EditButton';
import DeleteButton from '../ui/DeleteButton';

const getInputTypeStyles = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return "bg-protocol-srt-background dark:bg-protocol-srt-background-dark border-protocol-srt-border dark:border-protocol-srt-border-dark";
    case "rtmp":
      return "bg-protocol-rtmp-background dark:bg-protocol-rtmp-background-dark border-protocol-rtmp-border dark:border-protocol-rtmp-border-dark";
    default:
      return "bg-card dark:bg-card-dark border-border dark:border-border-dark";
  }
};

const getInputTypeLabel = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-protocol-srt-background dark:bg-protocol-srt-background-dark text-protocol-srt-text dark:text-protocol-srt-text-dark">
          SRT
        </span>
      );
    case "rtmp":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-protocol-rtmp-background dark:bg-protocol-rtmp-background-dark text-protocol-rtmp-text dark:text-protocol-rtmp-text-dark">
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
                className="font-medium text-text dark:text-text-dark hover:text-hover-link dark:hover:text-hover-link-dark transition-colors"
              >
                {input.metadata?.["restreamer-ui"]?.meta?.name ||
                  "Input sin nombre"}
              </Link>
              <div className="flex items-center gap-1">
                <EditButton 
                  onClick={() => setIsEditModalOpen(true)}
                  protocol={input.inputType}
                />
              </div>
            </div>
            <p className="text-sm text-text-muted dark:text-text-muted-dark">
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
              <DeleteButton
                onClick={() => onDeleteClick(input)}
              />
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

        <OutputDefault streamId={input.streamName} processId={input.id} />

        <CustomOutputs
          streamId={input.streamName}
          onOutputCreated={onProcessUpdated}
        />

        <div className="mt-4">
          {input.outputs.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-text dark:text-text-dark">
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
            <p className="text-base text-text-muted dark:text-text-muted-dark">
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light dark:bg-error-dark p-4 rounded-md">
        <p className="text-error dark:text-error-dark">{error}</p>
        <Button
          onClick={refresh}
          variant="danger"
          type="button"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (inputs.length === 0) {
    return (
      <div className="text-center p-8 text-text-muted dark:text-text-muted-dark">
        No inputs found
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
