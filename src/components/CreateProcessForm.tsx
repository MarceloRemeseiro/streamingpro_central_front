"use client";

import { useState } from 'react';
import { CreateProcessInput, ProcessType, Resolution, FPS } from '@/types/createProcessTypes';
import { processService } from '@/services/process';

const resolutions: Resolution[] = ['1920x1080', '1280x720'];
const fpsList: FPS[] = [23.98, 24, 25, 29.97, 30, 59.94, 60];

export default function CreateProcessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProcessInput>({
    type: 'rtmp',
    name: '',
    description: '',
    resolution: '1920x1080',
    fps: 59.94,
  });

  const handleTypeChange = (type: ProcessType) => {
    setFormData(prev => ({
      ...prev,
      type,
      latency: type === 'srt' ? 20000 : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await processService.createProcess(formData);
      // Limpiar el formulario después de crear exitosamente
      setFormData({
        type: 'rtmp',
        name: '',
        description: '',
        resolution: '1920x1080',
        fps: 59.94,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proceso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Crear Nuevo Proceso
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-md">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Conexión
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange('rtmp')}
              className={`px-4 py-2 rounded-md ${
                formData.type === 'rtmp'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              RTMP
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('srt')}
              className={`px-4 py-2 rounded-md ${
                formData.type === 'srt'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              SRT
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resolución
          </label>
          <select
            id="resolution"
            value={formData.resolution}
            onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value as Resolution }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            {resolutions.map(res => (
              <option key={res} value={res}>{res}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            FPS
          </label>
          <select
            id="fps"
            value={formData.fps}
            onChange={(e) => setFormData(prev => ({ ...prev, fps: Number(e.target.value) as FPS }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            {fpsList.map(fps => (
              <option key={fps} value={fps}>{fps} FPS</option>
            ))}
          </select>
        </div>

        {formData.type === 'srt' && (
          <div>
            <label htmlFor="latency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Latencia (ms)
            </label>
            <input
              type="number"
              id="latency"
              value={formData.latency}
              onChange={(e) => setFormData(prev => ({ ...prev, latency: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              min="20"
              max="60000"
              required
            />
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 rounded-md text-white
                     ${isLoading 
                       ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                       : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                     }`}
          >
            {isLoading ? 'Creando...' : 'Crear Proceso'}
          </button>
        </div>
      </div>
    </form>
  );
} 