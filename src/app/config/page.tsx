'use client';

import { useEffect, useState } from 'react';
import { RestreamerConfig } from '@/types/configTypes';
import { baseUrl } from '@/lib/api';

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string | number | boolean }) {
  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value.toString()}
      </dd>
    </div>
  );
}

function ArrayList({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-gray-500 dark:text-gray-400">No hay elementos</span>;
  
  return (
    <ul className="list-disc list-inside">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-gray-900 dark:text-white">{item}</li>
      ))}
    </ul>
  );
}

export default function ConfigPage() {
  const [config, setConfig] = useState<RestreamerConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('Error al cargar la configuración');
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Configuración de Restreamer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ConfigSection title="Información General">
          <ConfigItem label="ID" value={config.config.id} />
          <ConfigItem label="Nombre" value={config.config.name} />
          <ConfigItem label="Dirección" value={config.config.address} />
          <ConfigItem label="Versión" value={config.config.version} />
          <ConfigItem label="Creado" value={new Date(config.created_at).toLocaleString()} />
          <ConfigItem label="Última actualización" value={new Date(config.updated_at).toLocaleString()} />
        </ConfigSection>

        <ConfigSection title="SRT">
          <ConfigItem label="Habilitado" value={config.config.srt.enable} />
          <ConfigItem label="Dirección" value={config.config.srt.address} />
          <ConfigItem label="Log habilitado" value={config.config.srt.log.enable} />
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Temas de log</h3>
            <ArrayList items={config.config.srt.log.topics} />
          </div>
        </ConfigSection>

        <ConfigSection title="RTMP">
          <ConfigItem label="Habilitado" value={config.config.rtmp.enable} />
          <ConfigItem label="Dirección" value={config.config.rtmp.address} />
          <ConfigItem label="Aplicación" value={config.config.rtmp.app} />
          <ConfigItem label="TLS habilitado" value={config.config.rtmp.enable_tls} />
          {config.config.rtmp.enable_tls && (
            <ConfigItem label="Dirección TLS" value={config.config.rtmp.address_tls} />
          )}
        </ConfigSection>

        <ConfigSection title="Almacenamiento">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Disco</h3>
          <ConfigItem label="Directorio" value={config.config.storage.disk.dir} />
          <ConfigItem label="Tamaño máximo (MB)" value={config.config.storage.disk.max_size_mbytes} />
          
          <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300">Memoria</h3>
          <ConfigItem label="Tamaño máximo (MB)" value={config.config.storage.memory.max_size_mbytes} />
          <ConfigItem label="Purgar" value={config.config.storage.memory.purge} />
        </ConfigSection>

        <ConfigSection title="FFmpeg">
          <ConfigItem label="Binario" value={config.config.ffmpeg.binary} />
          <ConfigItem label="Procesos máximos" value={config.config.ffmpeg.max_processes} />
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Entradas permitidas</h3>
            <ArrayList items={config.config.ffmpeg.access.input.allow} />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Salidas permitidas</h3>
            <ArrayList items={config.config.ffmpeg.access.output.allow} />
          </div>
        </ConfigSection>
      </div>

      {/* Sección JSON completo */}
      <div className="col-span-full">
        <ConfigSection title="JSON Completo">
          <div className="overflow-auto max-h-[500px] font-mono text-sm">
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
              <code className="text-gray-800 dark:text-gray-200">
                {JSON.stringify(config, null, 2)}
              </code>
            </pre>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
} 