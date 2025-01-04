'use client';

import { ProcessList } from "@/components/ProcessList";
import { useState } from "react";
import CreateProcessModal from "@/components/CreateProcessModal";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProcessCreated = () => {
    setIsModalOpen(false);
    setRefreshKey(prev => prev + 1); // Esto forzará la actualización de ProcessList
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Procesos
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Crear Proceso
        </button>
      </div>

      <ProcessList key={refreshKey} />

      <CreateProcessModal
        isOpen={isModalOpen}
        onClose={handleProcessCreated}
      />
    </main>
  );
}
