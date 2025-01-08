import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

interface ProcessedMetrics {
  system: {
    cpu: {
      idle: number;
      system: number;
      user: number;
    };
    memory: {
      free: number;
      total: number;
      used: number;
    };
    network: {
      rx: number;
      tx: number;
    };
  };
  sessions: {
    total: number;
    active: number;
    byProcess: {
      [processId: string]: {
        active: number;
        rxBitrate: number;
        txBitrate: number;
      };
    };
  };
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

      const [processes, metrics, sessions] = await Promise.all([
        processesResponse.json(),
        metricsResponse.json(),
        sessionsResponse.json()
      ]);


      

      // Encontrar métricas específicas
      const cpuIdle = metrics.find((m: any) => m.name === 'cpu_idle')?.value || 0;
      const cpuSystem = metrics.find((m: any) => m.name === 'cpu_system')?.value || 0;
      const cpuUser = metrics.find((m: any) => m.name === 'cpu_user')?.value || 0;
      const cpuCores = metrics.find((m: any) => m.name === 'cpu_ncpu')?.value || 0;
      const memTotal = metrics.find((m: any) => m.name === 'mem_total')?.value || 0;
      const memFree = metrics.find((m: any) => m.name === 'mem_free')?.value || 0;
      const memUsed = memTotal - memFree;
      const memPercentage = (memUsed / memTotal) * 100;

      // Calcular métricas de red y sesiones
      let totalRxBitrate = 0;
      let totalTxBitrate = 0;
      let maxRxBitrate = 0;
      let maxTxBitrate = 0;
      let totalSessions = 0;

      // Procesar sesiones activas
      Object.values(sessions).forEach((sessionList: any) => {
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
          total: processes.reduce((acc: number, process: any) => {
            return acc + (process.state?.cpu_usage || 0);
          }, 0),
          cores: cpuCores
        },
        memory: {
          total: processes.reduce((acc: number, process: any) => {
            return acc + (process.state?.memory_bytes || 0);
          }, 0),
          used: processes.reduce((acc: number, process: any) => {
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
        processes: processes.map((process: any) => ({
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