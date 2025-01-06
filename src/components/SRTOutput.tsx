import { FC, useState } from "react";
import { OutputProcess } from "@/types/processTypes";
import ProcessSwitch from "./ProcessSwitch";
import { processCommandService } from "@/services/processCommandService";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import DeleteProcessModal from "./DeleteProcessModal";
import EditSRTOutputModal from "./EditSRTOutputModal";

interface SRTOutputProps {
  output: OutputProcess;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const SRTOutput: FC<SRTOutputProps> = ({ output, onDeleted, onUpdated }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      <div className="p-3 bg-blue-100/60 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {name}
          </h4>
          <ProcessSwitch
            processId={output.id}
            state={output.state?.exec || 'finished'}
            lastLogLine={output.state?.last_logline}
            onStateChange={handleStateChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              URL
            </span>
            <p className="text-blue-900 dark:text-blue-100 break-all">{url}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Puerto
            </span>
            <p className="text-blue-900 dark:text-blue-100">{port}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Stream ID
            </span>
            <p className="text-blue-900 dark:text-blue-100 break-all">
              {streamId}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Latency
            </span>
            <p className="text-blue-900 dark:text-blue-100">{latency}ms</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Mode
            </span>
            <p className="text-blue-900 dark:text-blue-100">{mode}</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Passphrase
            </span>
            <p className="text-blue-900 dark:text-blue-100">{passphrase}</p>
          </div>
        </div>

        <div className="flex justify-end mt-2 space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          {output.state?.exec !== 'running' && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
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
    </>
  );
};

export default SRTOutput;
