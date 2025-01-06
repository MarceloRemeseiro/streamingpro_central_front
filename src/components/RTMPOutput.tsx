import { FC, useState } from "react";
import { OutputProcess } from "@/types/processTypes";
import ProcessSwitch from "./ProcessSwitch";
import { processCommandService } from "@/services/processCommandService";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import DeleteProcessModal from "./DeleteProcessModal";
import EditRTMPOutputModal from "./EditRTMPOutputModal";

interface RTMPOutputProps {
  output: OutputProcess;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const RTMPOutput: FC<RTMPOutputProps> = ({ output, onDeleted, onUpdated }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      <div className="p-3 bg-purple-100/60 dark:bg-purple-900/30 rounded-lg border border-purple-300 dark:border-purple-700">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">
            {name}
          </h4>
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
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                URL
              </span>
              <p className="text-purple-900 dark:text-purple-100 break-all text-xs">
                {address}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                Stream Key
              </span>
              <p className="text-purple-900 dark:text-purple-100 break-all text-xs">
                {streamKey}
              </p>
            </div>
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

      <EditRTMPOutputModal
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

export default RTMPOutput;
