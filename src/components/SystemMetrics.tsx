'use client';

import { useState, useEffect } from 'react';
import { CpuChipIcon, ArrowUpIcon, ArrowDownIcon, ServerIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Metrics {
  cpu: string | null;
  memory: {
    used: string | null;
    total: string | null;
    percentage: string | null;
  };
  network: {
    in: string | null;
    out: string | null;
  };
}

const initialMetrics: Metrics = {
  cpu: null,
  memory: {
    used: null,
    total: null,
    percentage: null
  },
  network: {
    in: null,
    out: null
  }
};

export const SystemMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (!response.ok) throw new Error('Error al obtener métricas');
        const data = await response.json();
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

  const formatMemory = (used: string | null, total: string | null) => {
    if (!used || !total) return 'N/A';
    return `${used}/${total}`;
  };

  const formatNetwork = (value: string | null) => {
    if (!value) return 'N/A';
    // Convertir bytes a MB/s
    const bytes = parseFloat(value);
    const mbps = (bytes / 1024 / 1024).toFixed(1);
    return `${mbps} MB/s`;
  };

  if (hasError) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-error-light rounded-lg text-sm text-error">
        <ExclamationCircleIcon className="h-4 w-4" />
        <span>Error al obtener métricas</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-card-background rounded-lg text-sm">
      {/* CPU */}
      <div className="flex items-center gap-2">
        <CpuChipIcon className="h-4 w-4 text-primary" />
        <span className="text-text-primary">{metrics.cpu ? `${metrics.cpu}%` : 'N/A'}</span>
      </div>

      {/* RAM */}
      <div className="flex items-center gap-2">
        <ServerIcon className="h-4 w-4 text-primary" />
        <span className="text-text-primary">
          {formatMemory(metrics.memory.used, metrics.memory.total)}
        </span>
      </div>

      {/* Network IN */}
      <div className="flex items-center gap-2">
        <ArrowDownIcon className="h-4 w-4 text-green-500" />
        <span className="text-text-primary">{formatNetwork(metrics.network.in)}</span>
      </div>

      {/* Network OUT */}
      <div className="flex items-center gap-2">
        <ArrowUpIcon className="h-4 w-4 text-blue-500" />
        <span className="text-text-primary">{formatNetwork(metrics.network.out)}</span>
      </div>
    </div>
  );
}; 