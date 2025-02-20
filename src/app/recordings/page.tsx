'use client';

import { useState, useEffect } from 'react';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Recording {
  name: string;
  size_bytes: number;
  last_modified: number;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/recordings');
      if (!response.ok) {
        throw new Error('Error al obtener las grabaciones');
      }
      const data = await response.json();
      setRecordings(data);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleDelete = async (filename: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta grabación?')) {
      return;
    }

    try {
      const response = await fetch('/api/recordings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la grabación');
      }

      await fetchRecordings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar la grabación');
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      // Construimos la URL de descarga usando nuestro endpoint proxy
      // Quitamos 'recordings/' del inicio del nombre del archivo si existe
      const cleanFilename = filename.replace(/^recordings\//, '');
      const downloadUrl = `/api/download/disk/recordings/${cleanFilename}`;
      
      console.log('Attempting to download from:', downloadUrl);
      
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al descargar el archivo');
      }
      
      // Creamos un blob con la respuesta
      const blob = await response.blob();
      // Creamos una URL para el blob
      const url = window.URL.createObjectURL(blob);
      // Creamos un elemento <a> temporal
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanFilename; // Usamos el nombre limpio del archivo
      // Añadimos el elemento al DOM y simulamos el clic
      document.body.appendChild(a);
      a.click();
      // Limpiamos
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(error instanceof Error ? error.message : 'Error al descargar el archivo');
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-light text-error rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-text dark:text-text-dark">Grabaciones</h1>
      
      {recordings.length === 0 ? (
        <p className="text-text-muted dark:text-text-muted-dark">No hay grabaciones disponibles.</p>
      ) : (
        <div className="bg-card dark:bg-card-dark rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border dark:divide-border-dark">
            <thead className="bg-card-header dark:bg-card-header-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
                  Tamaño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
                  Fecha de modificación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {recordings.map((recording) => (
                <tr key={recording.name} className="hover:bg-card-hover dark:hover:bg-card-hover-dark">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text dark:text-text-dark">
                    {recording.name.replace('recordings/', '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text dark:text-text-dark">
                    {formatFileSize(recording.size_bytes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text dark:text-text-dark">
                    {formatDate(recording.last_modified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDownload(recording.name)}
                        className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary-dark/20"
                        title="Descargar"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(recording.name)}
                        className="text-error hover:text-error-dark dark:text-error-light dark:hover:text-error p-2 rounded-full hover:bg-error/10 dark:hover:bg-error-dark/20"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 