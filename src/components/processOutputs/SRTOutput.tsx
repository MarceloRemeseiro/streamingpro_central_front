import { FC, useState } from "react";
import { useOutputCollapse } from "@/hooks/useOutputCollapse";
import { OutputProcess } from "@/types/processTypes";
import ProcessSwitch from "../ui/ProcessSwitch";
import { processCommandService } from "@/services/processCommandService";
import {
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import DeleteProcessModal from "../modals/DeleteProcessModal";
import EditSRTOutputModal from "../modals/EditSRTOutputModal";
import EditSRTTitleModal from "../modals/EditSRTTitleModal";
import SwitchWarning from "../processCard/SwitchWarning";
import CollapseButton from '@/components/ui/CollapseButton';
import EditButton from '@/components/ui/EditButton';
import DeleteButton from '../ui/DeleteButton';

interface SRTOutputProps {
  output: OutputProcess;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const SRTOutput: FC<SRTOutputProps> = ({ output, onDeleted, onUpdated }) => {
  // El ID del proceso está en el parent_id del output
  const [isCollapsed, setIsCollapsed] = useOutputCollapse('srt-output', output.id);
  const [modals, setModals] = useState({
    delete: false,
    edit: false,
    editTitle: false,
  });
  const [showStopWarning, setShowStopWarning] = useState(false);

  const name = output.metadata?.["restreamer-ui"]?.name || "Output sin nombre";
  const address = output.config?.output?.[0]?.address || "";

  // Extraer información del address SRT
  const url = `srt:${address.split(":")[1].split("?")[0]}` || "";
  const port = address.split(":")[2].split("?")[0] || "";
  const params = new URLSearchParams(address.split("?")[1] || "");

  const streamId = params.get("streamid") || "No configurado";
  const latency = params.get("latency") || "";
  const mode = params.get("mode") || "CALLER";
  const passphrase = params.get("passphrase") || "No configurado";

  const handleStateChange = async (isRunning: boolean) => {
    if (output.state?.exec === 'running' && !isRunning) {
      setShowStopWarning(true);
      return;
    }
    await processCommandService.sendCommand(output.id, isRunning ? 'start' : 'stop');
  };

  const handleConfirmStop = async () => {
    const processSwitch = document.querySelector(`[data-process-id="${output.id}"] .switch-handle`);
    if (processSwitch) {
      processSwitch.classList.remove('translate-x-6');
      processSwitch.classList.add('translate-x-1');
    }
    await processCommandService.sendCommand(output.id, 'stop');
    setShowStopWarning(false);
  };

  const handleCancelStop = () => {
    setShowStopWarning(false);
  };

  const handleDelete = async () => {
    try {
      const scrollPosition = window.scrollY;
      const response = await fetch(`/api/process/output/${output.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar el output");

      setModals((m) => ({ ...m, delete: false }));
      onDeleted?.();

      // Restaurar la posición del scroll después de que se actualice la UI
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        });
      });
    } catch (error) {
      console.error("Error deleting output:", error);
    }
  };

  const closeModal = (type: keyof typeof modals) => () =>
    setModals((m) => ({ ...m, [type]: false }));

  const handleUpdate = (type: keyof typeof modals) => () => {
    setModals((m) => ({ ...m, [type]: false }));
    onUpdated?.();
  };

  return (
    <>
      <div className="p-2 bg-protocol-srt-output-background dark:bg-protocol-srt-output-background-dark rounded border border-protocol-srt-output-border dark:border-protocol-srt-output-border-dark">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 flex-1 group"
          >
            <CollapseButton isCollapsed={isCollapsed} />
            <h4 className="text-xs font-medium text-protocol-srt-output-text dark:text-protocol-srt-output-text-dark">
              {name}
            </h4>
            <EditButton
              onClick={() => setModals(m => ({ ...m, editTitle: true }))}
              protocol="srt"
            />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ProcessSwitch
                processId={output.id}
                state={output.state?.exec || "finished"}
                lastLogLine={output.state?.last_logline}
                onStateChange={handleStateChange}
              />
              <SwitchWarning 
                isVisible={showStopWarning}
                onConfirm={handleConfirmStop}
                onCancel={handleCancelStop}
              />
            </div>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="grid grid-cols-2 gap-1 text-[10px] mt-2">
              <div>
                <span className="font-medium text-protocol-srt-output-secondary dark:text-protocol-srt-output-secondary-dark">
                  URL
                </span>
                <p className="text-protocol-srt-output-text dark:text-protocol-srt-output-text-dark break-all">{url}</p>
              </div>
              <div>
                <span className="font-medium text-protocol-srt-output-secondary dark:text-protocol-srt-output-secondary-dark">
                  Port
                </span>
                <p className="text-protocol-srt-output-text dark:text-protocol-srt-output-text-dark">{port}</p>
              </div>
              <div>
                <span className="font-medium text-protocol-srt-output-secondary dark:text-protocol-srt-output-secondary-dark">
                  Stream ID
                </span>
                <p className="text-protocol-srt-output-text dark:text-protocol-srt-output-text-dark break-all">
                  {streamId}
                </p>
              </div>
              <div>
                <span className="font-medium text-protocol-srt-output-secondary dark:text-protocol-srt-output-secondary-dark">
                  Latency
                </span>
                <p className="text-protocol-srt-output-text dark:text-protocol-srt-output-text-dark">{latency}ms</p>
              </div>
              <div>
                <span className="font-medium text-protocol-srt-output-secondary dark:text-protocol-srt-output-secondary-dark">
                  Mode
                </span>
                <p className="text-protocol-srt-output-text dark:text-protocol-srt-output-text-dark">{mode}</p>
              </div>
              <div>
                <span className="font-medium text-protocol-srt-output-secondary dark:text-protocol-srt-output-secondary-dark">
                  Passphrase
                </span>
                <p className="text-protocol-srt-output-text dark:text-protocol-srt-output-text-dark">{passphrase}</p>
              </div>
            </div>

            <div className="flex justify-end mt-1 space-x-1">
              <button
                onClick={() => setModals((m) => ({ ...m, edit: true }))}
                className="p-0.5 text-protocol-srt-output-secondary dark:text-protocol-srt-output-secondary-dark hover:text-protocol-srt-output-hover dark:hover:text-protocol-srt-output-hover-dark"
                title="Editar configuración"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </button>
              {output.state?.exec !== "running" && (
                <DeleteButton
                  onClick={() => setModals((m) => ({ ...m, delete: true }))}
                />
              )}
            </div>
          </>
        )}
      </div>

      <DeleteProcessModal
        isOpen={modals.delete}
        onClose={closeModal("delete")}
        onConfirm={handleDelete}
        processName={name}
      />

      <EditSRTOutputModal
        isOpen={modals.edit}
        onClose={closeModal("edit")}
        output={output}
        onUpdated={handleUpdate("edit")}
      />

      <EditSRTTitleModal
        isOpen={modals.editTitle}
        onClose={closeModal("editTitle")}
        output={output}
        onUpdated={handleUpdate("editTitle")}
      />
    </>
  );
};

export default SRTOutput;
