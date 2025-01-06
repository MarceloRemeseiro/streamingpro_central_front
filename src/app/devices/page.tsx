"use client";
import { useEffect, useState, useCallback } from "react";
import EditNameModal from "@/components/EditNameModal";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Device } from "@/lib/store";

interface SrtInput {
  id: string;
  name: string;
  streamId: string;
}

const StatusIndicator = ({ deviceId }: { deviceId: string }) => {
  const [status, setStatus] = useState<Device['status']>('OFFLINE');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/devices/${deviceId}/config`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.device_status);
        }
      } catch (error) {
        console.error("Error al obtener estado:", error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const getStatusColor = () => {
    switch (status) {
      case 'ONLINE':
        return 'bg-success dark:bg-success';
      case 'NO REPRODUCIENDO':
        return 'bg-warning dark:bg-warning';
      default:
        return 'bg-error dark:bg-error';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-text-primary dark:text-text-light">{status}</span>
    </div>
  );
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [srtInputs, setSrtInputs] = useState<SrtInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch("/api/devices");
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error("Error al obtener dispositivos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSrtInputs = async () => {
      try {
        const response = await fetch("/api/process/inputs");
        if (response.ok) {
          const data = await response.json();
          setSrtInputs(data);
        }
      } catch (error) {
        console.error("Error al obtener SRTs:", error);
      }
    };

    fetchDevices();
    fetchSrtInputs();

    const pollInterval = setInterval(fetchDevices, 5000);
    return () => clearInterval(pollInterval);
  }, [fetchDevices]);

  const handleSrtSelection = async (deviceId: string, srtId: string) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/srt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ srtId: srtId || null }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar SRT');
      }

      const updatedDevice = await response.json();
      
      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          if (device.device_id === deviceId) {
            return { ...device, assigned_srt: updatedDevice.assigned_srt };
          }
          return device;
        })
      );
    } catch (error) {
      console.error("Error:", error);
      fetchDevices();
    }
  };

  const handleEditName = (device: Device) => {
    setEditingDevice(device);
  };

  const handleSaveName = async (deviceId: string, newName: string) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: newName }),
      });

      if (response.ok) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.device_id === deviceId
              ? { ...device, display_name: newName }
              : device
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar nombre:", error);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este dispositivo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDevices((prevDevices) =>
          prevDevices.filter((device) => device.device_id !== deviceId)
        );
      } else {
        console.error("Error al eliminar dispositivo");
      }
    } catch (error) {
      console.error("Error al eliminar dispositivo:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-2">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary dark:text-text-muted dark:hover:text-text-light transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver</span>
        </Link>
      </div>
        <h1 className="text-2xl font-semibold text-text-primary dark:text-text-light mb-2">
          Dispositivos
        </h1>

      {devices.length === 0 ? (
        <div className="bg-info-background dark:bg-card-background/50 rounded-lg p-8 text-center">
          <p className="text-text-muted dark:text-text-muted">No hay dispositivos conectados</p>
        </div>
      ) : (
        <div className="bg-card-background dark:bg-card-background rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-border">
              <thead className="bg-info-background dark:bg-card-background/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted uppercase tracking-wider">
                    IP Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted uppercase tracking-wider">
                    IP Pública
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted uppercase tracking-wider">
                    SRT Asignado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted dark:text-text-muted uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card-background dark:bg-card-background divide-y divide-border dark:divide-border">
                {devices.map((device) => (
                  <tr key={device.device_id} className="dark:hover:bg-card-background/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-text-primary dark:text-text-light">
                            {device.display_name || device.device_id}
                          </div>
                          <div className="text-xs text-text-muted dark:text-text-muted">
                            {device.device_id}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditName(device)}
                          className="text-text-muted hover:text-text-primary dark:hover:text-text-light transition-colors"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-light">
                      {device.local_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-light">
                      {device.public_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="block w-full border border-border bg-card-background dark:bg-card-background text-text-primary dark:text-text-light rounded-md py-1.5 pl-3 pr-10 focus:ring-2 focus:ring-primary dark:focus:ring-primary sm:text-sm sm:leading-6"
                        value={device.assigned_srt || ""}
                        onChange={(e) =>
                          handleSrtSelection(device.device_id, e.target.value)
                        }
                      >
                        <option value="">NINGUNO</option>
                        {srtInputs.map((srt) => (
                          <option key={srt.id} value={srt.id}>
                            {srt.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusIndicator deviceId={device.device_id} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteDevice(device.device_id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-text-light bg-error hover:bg-error-hover dark:bg-error dark:hover:bg-error-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error dark:focus:ring-offset-card-background transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditNameModal
        device={editingDevice}
        isOpen={!!editingDevice}
        onClose={() => setEditingDevice(null)}
        onSave={handleSaveName}
      />
    </main>
  );
}
