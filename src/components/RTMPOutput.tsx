import { FC, useState } from "react";
import { OutputProcess } from "@/types/processTypes";
import ProcessSwitch from "./ProcessSwitch";
import { processCommandService } from "@/services/processCommandService";
import { TrashIcon, PencilIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import DeleteProcessModal from "./DeleteProcessModal";
import EditRTMPOutputModal from "./EditRTMPOutputModal";
import EditRTMPTitleModal from "./EditRTMPTitleModal";

interface RTMPOutputProps {
  output: OutputProcess;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const RTMPOutput: FC<RTMPOutputProps> = ({ output, onDeleted, onUpdated }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);

  const name = output.metadata?.["restreamer-ui"]?.name || "Output sin nombre";
  const address = output.config?.output?.[0]?.address || "";
  const streamKey = output.config?.output?.[0]?.options?.[13] || "";

  const handleStateChange = async (isRunning: boolean) => {
    await processCommandService.sendCommand(output.id, isRunning ? 'start' : 'stop');
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/process/${output.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el output');
      }

      setIsDeleteModalOpen(false);
      onDeleted?.();
    } catch (error) {
      console.error('Error deleting output:', error);
    }
  };

  return (
    <>
      <div className="p-3 bg-protocol-rtmp-output-background rounded-lg border border-protocol-rtmp-output-border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-protocol-rtmp-output-text">
              {name}
            </h4>
            <button
              onClick={() => setIsEditTitleModalOpen(true)}
              className="p-1 text-protocol-rtmp-output-secondary hover:text-protocol-rtmp-output-hover"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <ProcessSwitch
            processId={output.id}
            state={output.state?.exec || 'finished'}
            lastLogLine={output.state?.last_logline}
            onStateChange={handleStateChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <span className="text-xs font-medium text-protocol-rtmp-output-secondary">
                URL
              </span>
              <p className="text-protocol-rtmp-output-text break-all text-xs">
                {address}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <span className="text-xs font-medium text-protocol-rtmp-output-secondary">
                Stream Key
              </span>
              <p className="text-protocol-rtmp-output-text break-all text-xs">
                {streamKey}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2 space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 text-protocol-rtmp-output-secondary hover:text-protocol-rtmp-output-hover"
            title="Editar configuración"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          {output.state?.exec !== 'running' && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1 text-error hover:text-error-dark"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <DeleteProcessModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        processName={name}
      />

      <EditRTMPOutputModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        output={output}
        onUpdated={() => {
          setIsEditModalOpen(false);
          onUpdated?.();
        }}
      />

      <EditRTMPTitleModal
        isOpen={isEditTitleModalOpen}
        onClose={() => setIsEditTitleModalOpen(false)}
        output={output}
        onUpdated={() => {
          setIsEditTitleModalOpen(false);
          onUpdated?.();
        }}
      />
    </>
  );
};

export default RTMPOutput;
