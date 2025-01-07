import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ContainerStats {
  cpu: string;
  memory: {
    used: string;
    total: string;
    percentage: string;
  };
  network: {
    in: string;
    out: string;
  };
}

interface ContainersStatsMap {
  [key: string]: ContainerStats;
}

interface SystemMetrics {
  cpu: string;
  memory: {
    used: string;
    total: string;
    percentage: string;
  };
  network: {
    in: string;
    out: string;
  };
}

async function getDockerStats(): Promise<SystemMetrics | null> {
  try {
    // Verificar que docker está disponible
    await execAsync('docker --version');
    
    // Verificar permisos del socket
    await execAsync('ls -l /var/run/docker.sock');
    
    // Obtener métricas de ambos contenedores
    const { stdout } = await execAsync(
      'docker stats streamingpro restreamer --no-stream --format "{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"'
    );

    if (!stdout.trim()) {
      throw new Error('No se obtuvieron datos de los contenedores');
    }

    const containersStats = stdout.trim().split('\n').reduce((acc, line) => {
      const [name, cpu, memUsage, memPerc, netIO] = line.split('\t');
      const [used, total] = memUsage.split(' / ');
      const [netIn, netOut] = netIO.split(' / ');

      acc[name] = {
        cpu: cpu.replace('%', ''),
        memory: {
          used,
          total,
          percentage: memPerc.replace('%', '')
        },
        network: {
          in: netIn,
          out: netOut
        }
      };
      return acc;
    }, {} as ContainersStatsMap);

    // Sumar las métricas de ambos contenedores
    const totalCPU = Object.values(containersStats).reduce(
      (sum, stats) => sum + parseFloat(stats.cpu), 0
    ).toFixed(1);

    // Convertir todo a bytes para sumar
    const totalMemUsed = Object.values(containersStats).reduce(
      (sum, stats) => sum + parseFloat(stats.memory.used), 0
    ).toFixed(1) + 'GB';

    const totalMemTotal = Object.values(containersStats).reduce(
      (sum, stats) => sum + parseFloat(stats.memory.total), 0
    ).toFixed(1) + 'GB';

    const totalMemPerc = (Object.values(containersStats).reduce(
      (sum, stats) => sum + parseFloat(stats.memory.percentage), 0
    ) / Object.keys(containersStats).length).toFixed(1);

    // Sumar el tráfico de red
    const totalNetIn = Object.values(containersStats).reduce(
      (sum, stats) => sum + parseFloat(stats.network.in), 0
    ).toFixed(1) + 'B';

    const totalNetOut = Object.values(containersStats).reduce(
      (sum, stats) => sum + parseFloat(stats.network.out), 0
    ).toFixed(1) + 'B';

    return {
      cpu: totalCPU,
      memory: {
        used: totalMemUsed,
        total: totalMemTotal,
        percentage: totalMemPerc
      },
      network: {
        in: totalNetIn,
        out: totalNetOut
      }
    };
  } catch (error) {
    console.error('Error getting docker stats:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error) {
      throw new Error(`Error al obtener métricas: ${error.message}`);
    }
    throw new Error('Error desconocido al obtener métricas');
  }
}

export async function GET() {
  try {
    const stats = await getDockerStats();
    if (!stats) {
      return NextResponse.json(
        { error: 'No se obtuvieron métricas' },
        { status: 500 }
      );
    }
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 