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

type SortType = 'date' | 'name';

const ITEMS_PER_PAGE = 24;

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortType, setSortType] = useState<SortType>('date');

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/recordings');
      if (!response.ok) {
        throw new Error('Error al obtener las grabaciones');
      }
      const data = await response.json();
      
      // Ordenar según el criterio seleccionado
      const sortedData = [...data].sort((a: Recording, b: Recording) => {
        if (sortType === 'date') {
          return sortOrder === 'desc' 
            ? b.last_modified - a.last_modified 
            : a.last_modified - b.last_modified;
        } else {
          // Ordenar por nombre y luego por fecha
          const nameA = a.name.replace('recordings/', '').toLowerCase();
          const nameB = b.name.replace('recordings/', '').toLowerCase();
          const nameCompare = sortOrder === 'desc' 
            ? nameB.localeCompare(nameA)
            : nameA.localeCompare(nameB);
          
          // Si los nombres son iguales, ordenar por fecha
          if (nameCompare === 0) {
            return sortOrder === 'desc' 
              ? b.last_modified - a.last_modified 
              : a.last_modified - b.last_modified;
          }
          return nameCompare;
        }
      });

      setRecordings(sortedData);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [sortOrder, sortType]);

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

  // Calcular paginación
  const totalPages = Math.ceil(recordings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecordings = recordings.slice(startIndex, endIndex);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Grabaciones</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="appearance-none bg-white/5 backdrop-blur-sm text-text dark:text-text-dark border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <option value="date" className="bg-card-dark text-text-dark">Ordenar por fecha</option>
              <option value="name" className="bg-card-dark text-text-dark">Ordenar por nombre</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-dark">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="bg-white/5 backdrop-blur-sm text-text dark:text-text-dark px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {sortOrder === 'desc' ? '↓ Descendente' : '↑ Ascendente'}
          </button>
        </div>
      </div>
      
      {recordings.length === 0 ? (
        <p className="text-text-muted dark:text-text-muted-dark">No hay grabaciones disponibles.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {currentRecordings.map((recording) => (
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
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted dark:text-text-muted-dark">
                      No thumbnail
                    </div>
                  )}
                </div>
                
                <div className="p-2">
                  <h3 className="font-medium text-sm text-text dark:text-text-dark mb-1 truncate">
                    {recording.name.replace('recordings/', '')}
                  </h3>
                  <div className="text-xs text-text-muted dark:text-text-muted-dark space-y-0.5">
                    <p className="truncate">{formatFileSize(recording.size_bytes)}</p>
                    <p className="truncate">{formatDate(recording.last_modified)}</p>
                  </div>
                  
                  <div className="mt-2 flex justify-end gap-1">
                    <button
                      onClick={() => handleDownload(recording.name)}
                      className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary p-1 rounded-full hover:bg-primary/10 dark:hover:bg-primary-dark/20"
                      title="Descargar"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(recording.name)}
                      className="text-error hover:text-error-dark dark:text-error-light dark:hover:text-error p-1 rounded-full hover:bg-error/10 dark:hover:bg-error-dark/20"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-text-muted dark:text-text-muted-dark">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 