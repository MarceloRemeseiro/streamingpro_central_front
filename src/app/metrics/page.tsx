'use client';

import { useState, useEffect } from 'react';

export default function MetricsDebug() {
  const [processes, setProcesses] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (!response.ok) {
          throw new Error('Error al obtener métricas');
        }
        const data = await response.json();
        setProcesses(data.processes);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setProcesses(null);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!processes) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Cargando datos...</h1>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Estado de los Procesos</h2>
        {processes.map((process: any) => (
          <div key={process.id} className="mb-8 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">{process.id}</h3>
            <div className="bg-white p-4 rounded-lg">
              <pre className="text-black whitespace-pre-wrap overflow-auto">
                {JSON.stringify(process.state, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 