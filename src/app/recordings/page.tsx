'use client';

import { useState, useEffect } from 'react';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Recording {
  name: string;
  size_bytes: number;
  last_modified: number;
  thumbnail: string | null;
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
      const cleanFilename = filename.replace(/^recordings\//, '');
      const downloadUrl = `/api/download/disk/recordings/${cleanFilename}`;
      
      console.log('Attempting to download from:', downloadUrl);
      
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al descargar el archivo');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording) => (
            <div 
              key={recording.name}
              className="bg-card dark:bg-card-dark rounded-lg shadow overflow-hidden"
            >
              <div className="aspect-video relative bg-black">
                {recording.thumbnail ? (
                  <Image
                    src={`/api/download/disk/thumbnail/${recording.thumbnail}`}
                    alt={recording.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted dark:text-text-muted-dark">
                    No thumbnail
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-text dark:text-text-dark mb-2">
                  {recording.name.replace('recordings/', '')}
                </h3>
                <div className="text-sm text-text-muted dark:text-text-muted-dark space-y-1">
                  <p>Tamaño: {formatFileSize(recording.size_bytes)}</p>
                  <p>Fecha: {formatDate(recording.last_modified)}</p>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 