import { FC, useState } from "react";
import { useOutputCollapse } from "@/hooks/useOutputCollapse";
import { OutputProcess } from "@/types/processTypes";
import ProcessSwitch from "../ui/ProcessSwitch";
import { processCommandService } from "@/services/processCommandService";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import DeleteProcessModal from "../modals/DeleteProcessModal";
import EditRTMPOutputModal from "../modals/EditRTMPOutputModal";
import EditRTMPTitleModal from "../modals/EditRTMPTitleModal";
import SwitchWarning from "../processCard/SwitchWarning";
import CollapseButton from '@/components/ui/CollapseButton';
import EditButton from '@/components/ui/EditButton';
import DeleteButton from '../ui/DeleteButton';



interface RTMPOutputProps {
  output: OutputProcess;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const RTMPOutput: FC<RTMPOutputProps> = ({ output, onDeleted, onUpdated }) => {
  const [isCollapsed, setIsCollapsed] = useOutputCollapse('rtmp-output', output.id);
  const [showStopWarning, setShowStopWarning] = useState(false);
  const [modals, setModals] = useState({
    delete: false,
    edit: false,
    editTitle: false
  });

  const name = output.metadata?.["restreamer-ui"]?.name || "Output sin nombre";
  const address = output.config?.output?.[0]?.address || "";
  const streamKey = output.config?.output?.[0]?.options?.[13] || "";

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
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el output');
      
      setModals(m => ({ ...m, delete: false }));
      onDeleted?.();
      
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        });
      });
    } catch (error) {
      console.error('Error deleting output:', error);
    }
  };

  const closeModal = (type: keyof typeof modals) => () => 
    setModals(m => ({ ...m, [type]: false }));

  const handleUpdate = (type: keyof typeof modals) => () => {
    setModals(m => ({ ...m, [type]: false }));
    onUpdated?.();
  };

  return (
    <>
      <div className="p-2 bg-protocol-rtmp-output-background dark:bg-protocol-rtmp-output-background-dark rounded border border-protocol-rtmp-output-border dark:border-protocol-rtmp-output-border-dark">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 flex-1 group"
          >
            <CollapseButton isCollapsed={isCollapsed} />
            <h4 className="text-xs font-medium text-protocol-rtmp-output-text dark:text-protocol-rtmp-output-text-dark">
              {name}
            </h4>
            <EditButton
              onClick={() => setModals(m => ({ ...m, editTitle: true }))}
              protocol="rtmp"
            />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ProcessSwitch
                processId={output.id}
                state={output.state?.exec || 'finished'}
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
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-1">
                  <span className="text-[10px] font-medium text-protocol-rtmp-output-secondary dark:text-protocol-rtmp-output-secondary-dark">
                    URL
                  </span>
                  <p className="text-protocol-rtmp-output-text dark:text-protocol-rtmp-output-text-dark break-all text-[10px]">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-1">
                  <span className="text-[10px] font-medium text-protocol-rtmp-output-secondary dark:text-protocol-rtmp-output-secondary-dark">
                    Stream Key
                  </span>
                  <p className="text-protocol-rtmp-output-text dark:text-protocol-rtmp-output-text-dark break-all text-[10px]">
                    {streamKey}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-1 space-x-1">
              <button
                onClick={() => setModals(m => ({ ...m, edit: true }))}
                className="p-0.5 text-protocol-rtmp-output-secondary dark:text-protocol-rtmp-output-secondary-dark hover:text-protocol-rtmp-output-hover dark:hover:text-protocol-rtmp-output-hover-dark"
                title="Editar configuración"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </button>
              {output.state?.exec !== 'running' && (
                <DeleteButton
                  onClick={() => setModals(m => ({ ...m, delete: true }))}
                />
              )}
            </div>
          </>
        )}
      </div>

      <DeleteProcessModal
        isOpen={modals.delete}
        onClose={closeModal('delete')}
        onConfirm={handleDelete}
        processName={name}
      />

      <EditRTMPOutputModal
        isOpen={modals.edit}
        onClose={closeModal('edit')}
        output={output}
        onUpdated={handleUpdate('edit')}
      />

      <EditRTMPTitleModal
        isOpen={modals.editTitle}
        onClose={closeModal('editTitle')}
        output={output}
        onUpdated={handleUpdate('editTitle')}
      />
    </>
  );
};

export default RTMPOutput;
