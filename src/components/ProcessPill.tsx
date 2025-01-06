'use client';

import { InputProcess } from "@/types/processTypes";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import EditProcessModal from "./EditProcessModal";
import Link from "next/link";

const getInputTypeStyles = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    case "rtmp":
      return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
    default:
      return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  }
};

const getInputTypeLabel = (type: InputProcess["inputType"]) => {
  switch (type) {
    case "srt":
      return (
        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          SRT
        </span>
      );
    case "rtmp":
      return (
        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
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
              className="font-medium text-sm text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 truncate transition-colors"
            >
              {process.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre"}
            </Link>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
            {process.metadata?.["restreamer-ui"]?.meta?.description || "Sin descripción"}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-0.5 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          {process.state?.exec !== "running" && (
            <button
              onClick={() => onDelete(process)}
              className="p-0.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
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
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
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