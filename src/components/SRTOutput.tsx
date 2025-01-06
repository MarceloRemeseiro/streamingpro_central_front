import { FC, useState } from "react";
import { OutputProcess } from "@/types/processTypes";
import ProcessSwitch from "./ProcessSwitch";
import { processCommandService } from "@/services/processCommandService";
import { TrashIcon, PencilIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import DeleteProcessModal from "./DeleteProcessModal";
import EditSRTOutputModal from "./EditSRTOutputModal";
import EditSRTTitleModal from "./EditSRTTitleModal";

interface SRTOutputProps {
  output: OutputProcess;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const SRTOutput: FC<SRTOutputProps> = ({ output, onDeleted, onUpdated }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);

  const name = output.metadata?.["restreamer-ui"]?.name || "Output sin nombre";
  const address = output.config?.output?.[0]?.address || "";

  // Extraer información del address SRT
  const url = `srt:${address.split(":")[1].split("?")[0]}` || "";
  const port = address.split(":")[2].split("?")[0] || "";
  const params = new URLSearchParams(address.split("?")[1] || "");

  const streamId = params.get("streamid") ||"No configurado";
  const latency = params.get("latency") || "";
  const mode = params.get("mode") || "CALLER";
  const passphrase = params.get("passphrase") || "No configurado";

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
      <div className="p-3 bg-protocol-srt-output-background rounded-lg border border-protocol-srt-output-border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-protocol-srt-output-text">
              {name}
            </h4>
            <button
              onClick={() => setIsEditTitleModalOpen(true)}
              className="p-1 text-protocol-srt-output-secondary hover:text-protocol-srt-output-hover"
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

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium text-protocol-srt-output-secondary">
              URL
            </span>
            <p className="text-protocol-srt-output-text break-all">{url}</p>
          </div>
          <div>
            <span className="font-medium text-protocol-srt-output-secondary">
              Puerto
            </span>
            <p className="text-protocol-srt-output-text">{port}</p>
          </div>
          <div>
            <span className="font-medium text-protocol-srt-output-secondary">
              Stream ID
            </span>
            <p className="text-protocol-srt-output-text break-all">
              {streamId}
            </p>
          </div>
          <div>
            <span className="font-medium text-protocol-srt-output-secondary">
              Latency
            </span>
            <p className="text-protocol-srt-output-text">{latency}ms</p>
          </div>
          <div>
            <span className="font-medium text-protocol-srt-output-secondary">
              Mode
            </span>
            <p className="text-protocol-srt-output-text">{mode}</p>
          </div>
          <div>
            <span className="font-medium text-protocol-srt-output-secondary">
              Passphrase
            </span>
            <p className="text-protocol-srt-output-text">{passphrase}</p>
          </div>
        </div>

        <div className="flex justify-end mt-2 space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 text-protocol-srt-output-secondary hover:text-protocol-srt-output-hover"
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

      <EditSRTOutputModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        output={output}
        onUpdated={() => {
          setIsEditModalOpen(false);
          onUpdated?.();
        }}
      />

      <EditSRTTitleModal
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

export default SRTOutput;
