import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

interface Metric {
  name: string;
  value: number;
}

interface ProcessState {
  state: string;
  cpu_usage: number;
  memory_bytes: number;
  traffic_in_bytes?: number;
  traffic_out_bytes?: number;
  bitrate_kbit?: number;
}

interface Process {
  id: string;
  name: string;
  type: string;
  state: ProcessState;
}

interface Session {
  bandwidth_rx_kbit: number;
  bandwidth_tx_kbit: number;
}

interface SessionMap {
  [key: string]: Session[];
}

export async function GET() {
  try {
    return await withAuth(async (token) => {
      const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
      
      // Obtener datos de los tres endpoints
      const [processesResponse, metricsResponse, sessionsResponse] = await Promise.all([
        fetch(`http://${baseUrl}:8080/api/v3/process`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://${baseUrl}:8080/api/v3/metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://${baseUrl}:8080/api/v3/session/active?collectors=rtmp,hls,srt`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!processesResponse.ok) {
        throw new Error(`Error en /process: ${processesResponse.status} ${processesResponse.statusText}`);
      }
      if (!metricsResponse.ok) {
        throw new Error(`Error en /metrics: ${metricsResponse.status} ${metricsResponse.statusText}`);
      }
      if (!sessionsResponse.ok) {
        throw new Error(`Error en /session: ${sessionsResponse.status} ${sessionsResponse.statusText}`);
      }

      const [processes, metrics, sessions]: [Process[], Metric[], SessionMap] = await Promise.all([
        processesResponse.json(),
        metricsResponse.json(),
        sessionsResponse.json()
      ]);

      // Encontrar métricas específicas
      const cpuCores = metrics.find((m) => m.name === 'cpu_ncpu')?.value || 0;

      // Calcular métricas de red y sesiones
      let totalRxBitrate = 0;
      let totalTxBitrate = 0;
      const maxRxBitrate = 0;
      const maxTxBitrate = 0;
      let totalSessions = 0;

      // Procesar sesiones activas
      Object.values(sessions).forEach((sessionList) => {
        if (Array.isArray(sessionList)) {
          sessionList.forEach(session => {
            totalRxBitrate += session.bandwidth_rx_kbit || 0;
            totalTxBitrate += session.bandwidth_tx_kbit || 0;
            totalSessions++;
          });
        }
      });

      // Convertir kbit/s a Mbit/s
      totalRxBitrate = totalRxBitrate / 1000;
      totalTxBitrate = totalTxBitrate / 1000;

      // Procesar métricas del sistema
      const systemMetrics = {
        cpu: {
          total: processes.reduce((acc, process) => {
            return acc + (process.state?.cpu_usage || 0);
          }, 0),
          cores: cpuCores
        },
        memory: {
          total: processes.reduce((acc, process) => {
            return acc + (process.state?.memory_bytes || 0);
          }, 0),
          used: processes.reduce((acc, process) => {
            return acc + (process.state?.memory_bytes || 0);
          }, 0),
          free: 0,
          percentage: 0
        },
        network: {
          bandwidth_rx: totalRxBitrate,
          bandwidth_tx: totalTxBitrate,
          max_bandwidth_rx: maxRxBitrate,
          max_bandwidth_tx: maxTxBitrate
        },
        sessions: {
          active: totalSessions,
          max: Math.max(totalSessions, 0)
        },
        processes: processes.map((process) => ({
          id: process.id,
          name: process.name,
          type: process.type,
          state: process.state?.state || 'unknown',
          cpu: process.state?.cpu_usage || 0,
          memory: process.state?.memory_bytes || 0
        }))
      };

      return NextResponse.json(systemMetrics);
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener métricas' },
      { status: 500 }
    );
  }
} 