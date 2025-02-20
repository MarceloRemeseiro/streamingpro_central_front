"use client";

import { Switch } from "@headlessui/react";
import { useRecordingState } from "@/hooks/useRecordingState";
import { useState } from "react";
import SwitchWarning from "@/components/processCard/SwitchWarning";

interface RecordingSwitchProps {
  processId: string;
  isProcessRunning: boolean;
}

export default function RecordingSwitch({
  processId,
  isProcessRunning,
}: RecordingSwitchProps) {
  const { isRecording, isLoading, error, toggleRecording } =
    useRecordingState(processId);
  const [showWarning, setShowWarning] = useState(false);

  const handleToggle = () => {
    console.log('handleToggle called:', { 
      isRecording, 
      isProcessRunning 
    });
    
    if (isRecording) {
      setShowWarning(true);
    } else if (isProcessRunning) {
      toggleRecording();
    }
  };

  const handleConfirmStop = () => {
    console.log('handleConfirmStop called');
    setShowWarning(false);
    toggleRecording();
  };

  const handleCancelStop = () => {
    console.log('handleCancelStop called');
    setShowWarning(false);
  };

  return (
    <div className="flex items-center gap-2 relative">
      <span className="text-sm text-text-muted dark:text-text-muted-dark">
        {isLoading ? "Cargando..." : isRecording ? "RECORDING" : "REC"}
      </span>
      <Switch
        checked={isRecording}
        onChange={handleToggle}
        disabled={isLoading || !isProcessRunning}
        className={`${
          isRecording ? "bg-red-600" : "bg-gray-400"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${
          isLoading || !isProcessRunning ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className="sr-only">Activar grabación</span>
        <span
          className={`${
            isRecording ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>

      <SwitchWarning
        isVisible={showWarning}
        onConfirm={handleConfirmStop}
        onCancel={handleCancelStop}
      />

      {error && (
        <span className="text-sm text-error dark:text-error-dark ml-2">
          {error}
        </span>
      )}
    </div>
  );
}
