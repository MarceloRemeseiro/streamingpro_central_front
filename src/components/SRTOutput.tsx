import { FC, useState } from "react";
import { OutputProcess } from "@/types/processTypes";
import ProcessSwitch from "./ProcessSwitch";
import { processCommandService } from "@/services/processCommandService";
import {
  TrashIcon,
  PencilIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import DeleteProcessModal from "./DeleteProcessModal";
import EditSRTOutputModal from "./EditSRTOutputModal";
import EditSRTTitleModal from "./EditSRTTitleModal";
import SwitchWarning from "./SwitchWarning";

interface SRTOutputProps {
  output: OutputProcess;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const SRTOutput: FC<SRTOutputProps> = ({ output, onDeleted, onUpdated }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
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
      <div className="p-2 bg-protocol-srt-output-background rounded border border-protocol-srt-output-border">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 flex-1 group"
          >
            <div className="flex items-center gap-1">
              <ChevronDownIcon
                className={`h-3 w-3 text-protocol-srt-output-secondary transition-transform ${
                  !isCollapsed ? "transform rotate-180" : ""
                }`}
              />
              <h4 className="text-xs font-medium text-protocol-srt-output-text">
                {name}
              </h4>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setModals((m) => ({ ...m, editTitle: true }));
                }}
                className="p-0.5 text-protocol-srt-output-secondary hover:text-protocol-srt-output-hover cursor-pointer"
              >
                <PencilIcon className="h-3 w-3" />
              </span>
            </div>
          </button>
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

        {!isCollapsed && (
          <>
            <div className="grid grid-cols-2 gap-1 text-[10px] mt-2">
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

            <div className="flex justify-end mt-1 space-x-1">
              <button
                onClick={() => setModals((m) => ({ ...m, edit: true }))}
                className="p-0.5 text-protocol-srt-output-secondary hover:text-protocol-srt-output-hover"
                title="Editar configuración"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </button>
              {output.state?.exec !== "running" && (
                <button
                  onClick={() => setModals((m) => ({ ...m, delete: true }))}
                  className="p-0.5 text-error hover:text-error-dark"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
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
