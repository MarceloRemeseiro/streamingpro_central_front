'use client';

import { InputProcess } from "@/types/processTypes";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import EditProcessModal from "./EditProcessModal";
import Link from "next/link";

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
        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-protocol-srt-background text-protocol-srt-text">
          SRT
        </span>
      );
    case "rtmp":
      return (
        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-protocol-rtmp-background text-protocol-rtmp-text">
          RTMP
        </span>
      );
    default:
      return null;
  }
};

interface ProcessPillProps {
  process: InputProcess;
  onDelete: (process: InputProcess) => void;
  onProcessUpdated: () => void;
}

export default function ProcessPill({ process, onDelete, onProcessUpdated }: ProcessPillProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className={`rounded-lg shadow p-3 flex flex-col border ${getInputTypeStyles(process.inputType)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {getInputTypeLabel(process.inputType)}
            <Link 
              href={`/input/${process.id}`}
              className="font-medium text-sm text-text-primary hover:text-hover-link truncate transition-colors"
            >
              {process.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre"}
            </Link>
          </div>
          <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
            {process.metadata?.["restreamer-ui"]?.meta?.description || "Sin descripción"}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-0.5 text-secondary hover:text-secondary-dark"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          {process.state?.exec !== "running" && (
            <button
              onClick={() => onDelete(process)}
              className="p-0.5 text-error hover:text-error-dark"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-2">
        <span
          className={`
            inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full
            ${
              process.state?.exec === "running"
                ? "bg-success-light text-success-dark"
                : "bg-error-light text-error-dark"
            }
          `}
        >
          {process.state?.exec || "Desconocido"}
        </span>
      </div>

      <EditProcessModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        process={process}
        onProcessUpdated={onProcessUpdated}
      />
    </div>
  );
} 