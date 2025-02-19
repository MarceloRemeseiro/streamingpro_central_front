'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import Link from 'next/link';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Process {
  id: string;
  type: string;
  reference: string;
  metadata?: {
    'restreamer-ui'?: {
      meta?: {
        name?: string;
      };
    };
  };
}

export default function JsonPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesses = async () => {
    try {
      const auth = AuthService.getInstance();
      const data = await auth.request<Process[]>('GET', '/api/v3/process');
      setProcesses(data);
    } catch (err) {
      console.error('Error al obtener procesos:', err);
      setError('No se pudieron cargar los procesos');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProcess = async (processId: string) => {
    try {
      const auth = AuthService.getInstance();
      await auth.request('DELETE', `/api/v3/process/${processId}`);
      // Recargar la lista después de eliminar
      await fetchProcesses();
    } catch (err) {
      console.error('Error al eliminar proceso:', err);
      setError('No se pudo eliminar el proceso');
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-light text-error p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {processes.map((process) => (
          <div key={process.id} className="bg-card-background rounded-lg shadow p-4 h-[calc(50vh-4rem)]">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-medium text-text-primary">
                {process.metadata?.['restreamer-ui']?.meta?.name || 'Sin nombre'} ({process.id})
              </h2>
              <button
                onClick={() => deleteProcess(process.id)}
                className="p-2 text-text-muted hover:text-error transition-colors rounded-lg hover:bg-error-light"
                title="Eliminar proceso"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-3rem)] overflow-auto">
              <pre className="bg-info-background p-4 rounded-lg whitespace-pre text-sm text-text-primary min-w-full">
                {JSON.stringify(process, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 