"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CreateProcessForm from "@/components/CreateProcessForm";
import ProcessPill from "@/components/inputPage/ProcessPill";
import { useProcesses } from "@/hooks/useProcesses";
import { useState } from "react";
import DeleteProcessModal from "@/components/modals/DeleteProcessModal";
import { InputProcess } from "@/types/processTypes";

export default function CreatePage() {
  const { inputs, isLoading, error, refresh } = useProcesses();
  const [processToDelete, setProcessToDelete] = useState<InputProcess | null>(
    null
  );

  const handleSuccess = () => {
    refresh();
  };

  const handleDeleteClick = (input: InputProcess) => {
    setProcessToDelete(input);
  };

  const handleDeleteConfirm = async () => {
    if (!processToDelete) return;

    try {
      const response = await fetch(`/api/process/${processToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el proceso");
      }

      setProcessToDelete(null);
      refresh();
    } catch (error) {
      console.error("Error deleting process:", error);
    }
  };

  const sortedInputs = [...inputs].sort((a, b) => {
    const nameA = a.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre";
    const nameB = b.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre";
    return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
  });

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text dark:text-text-muted-dark dark:hover:text-text-dark transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-text dark:text-text-dark mb-6">
          Crear nuevo Input
        </h1>

        <div className="mb-12">
          <CreateProcessForm onSuccess={handleSuccess} />
        </div>

        <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-6">
          Inputs creados
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-dark"></div>
          </div>
        ) : error ? (
          <div className="bg-error-light dark:bg-error-dark p-4 rounded-md">
            <p className="text-error dark:text-error-dark">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sortedInputs.map((input) => (
              <ProcessPill
                key={input.id}
                process={input}
                onDelete={handleDeleteClick}
                onProcessUpdated={refresh}
              />
            ))}
          </div>
        )}

        <DeleteProcessModal
          isOpen={!!processToDelete}
          onClose={() => setProcessToDelete(null)}
          onConfirm={handleDeleteConfirm}
          processName={
            processToDelete?.metadata?.["restreamer-ui"]?.meta?.name || ""
          }
        />
      </div>
    </div>
  );
}
