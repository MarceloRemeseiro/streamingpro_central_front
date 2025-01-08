'use client';

import { useState, useEffect } from 'react';
import { CpuChipIcon, ArrowUpIcon, ArrowDownIcon, ServerIcon, UserGroupIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface SystemMetrics {
  cpu: {
    total: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    bandwidth_rx: number;
    bandwidth_tx: number;
    max_bandwidth_rx: number;
    max_bandwidth_tx: number;
  };
  sessions: {
    active: number;
    max: number;
  };
  processes: Array<{
    id: string;
    name: string;
    type: string;
    state: string;
    cpu: number;
    memory: number;
  }>;
}

const initialMetrics: SystemMetrics = {
  cpu: {
    total: 0,
    cores: 0
  },
  memory: {
    total: 0,
    used: 0,
    free: 0,
    percentage: 0
  },
  network: {
    bandwidth_rx: 0,
    bandwidth_tx: 0,
    max_bandwidth_rx: 0,
    max_bandwidth_tx: 0
  },
  sessions: {
    active: 0,
    max: 0
  },
  processes: []
};

export const SystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>(initialMetrics);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (!response.ok) throw new Error('Error al obtener métricas');
        const data = await response.json();
       
        // Calcular totales para debug
        const cpuTotal = data.processes.reduce((acc: number, p: { cpu: number }) => acc + (p.cpu || 0), 0);
        const memTotal = data.processes.reduce((acc: number, p: { memory: number }) => acc + (p.memory || 0), 0);
      
        setMetrics(data);
        setHasError(false);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setHasError(true);
        setMetrics(initialMetrics);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatMemory = (bytes: number) => {
    if (!bytes) return '0.00';
    // Convertir bytes a MB
    const mb = Number(bytes) / (1024 * 1024);
    return mb.toFixed(2);
  };

  const formatCPU = (usage: number) => {
    if (usage === undefined || usage === null) return 'N/A';
    return `${usage.toFixed(2)}`;
  };

  const formatBandwidth = (mbit: number) => {
    return `${mbit.toFixed(1)} Mbit/s`;
  };

  if (hasError) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-error-light rounded-lg text-sm text-error">
        <ExclamationCircleIcon className="h-4 w-4" />
        <span>Error al obtener métricas</span>
      </div>
    );
  }

  // Calcular totales de los procesos
  const totalCPU = metrics.processes.reduce((acc, process) => acc + (process.cpu || 0), 0);
  const totalMemory = metrics.processes.reduce((acc, process) => acc + (process.memory || 0), 0);

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-card-background rounded-lg text-sm">
      {/* CPU */}
      <div className="flex items-center gap-2">
        <CpuChipIcon className="h-4 w-4 text-primary" />
        <div className="flex flex-col">
          <span className="text-text-primary">
            {formatCPU(totalCPU)}%
          </span>
          
        </div>
      </div>

      {/* Memoria */}
      <div className="flex items-center gap-2">
        <ServerIcon className="h-4 w-4 text-primary" />
        <div className="flex flex-col">
          <span className="text-text-primary">
            {formatMemory(totalMemory)} MB
          </span>
        </div>
      </div>

      {/* Network IN */}
      <div className="flex items-center gap-2">
        <ArrowDownIcon className="h-4 w-4 text-green-500" />
        <div className="flex flex-col">
          <span className="text-text-primary">
            {formatBandwidth(metrics.network.bandwidth_rx)}
          </span>
        </div>
      </div>

      {/* Network OUT */}
      <div className="flex items-center gap-2">
        <ArrowUpIcon className="h-4 w-4 text-blue-500" />
        <div className="flex flex-col">
          <span className="text-text-primary">
            {formatBandwidth(metrics.network.bandwidth_tx)}
          </span>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="flex items-center gap-2">
        <UserGroupIcon className="h-4 w-4 text-primary" />
        <div className="flex flex-col">
          <span className="text-text-primary">
            {metrics.sessions.active-2} Viewer{metrics.sessions.active !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}; 