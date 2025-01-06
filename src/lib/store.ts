import fs from 'fs';
import path from 'path';

export interface Device {
  device_id: string;
  display_name?: string;
  local_ip: string;
  public_ip: string;
  status: 'ONLINE' | 'OFFLINE' | 'NO REPRODUCIENDO';
  last_ping: string;
  assigned_srt?: string;
  created_at: string;
}

interface StoreData {
  devices: Device[];
}

export class Store {
  private static instance: Store;
  private dbPath: string;

  private constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'db.json');
    this.ensureDbExists();
  }

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  private ensureDbExists(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dbPath)) {
      this.saveData({ devices: [] });
    }
  }

  private loadData(): StoreData {
    const rawData = fs.readFileSync(this.dbPath, 'utf-8');
    return JSON.parse(rawData);
  }

  private saveData(data: StoreData): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  // Métodos para dispositivos
  public getDevices(): Device[] {
    const data = this.loadData();
    return data.devices;
  }

  public getDevice(deviceId: string): Device | undefined {
    const data = this.loadData();
    return data.devices.find((d: Device) => d.device_id === deviceId);
  }

  public upsertDevice(deviceData: Partial<Device> & { device_id: string }): Device {
    const data = this.loadData();
    const index = data.devices.findIndex((d: Device) => d.device_id === deviceData.device_id);
    const now = new Date().toISOString();

    if (index === -1) {
      // Crear nuevo dispositivo
      const newDevice: Device = {
        device_id: deviceData.device_id,
        display_name: deviceData.display_name,
        local_ip: deviceData.local_ip || '',
        public_ip: deviceData.public_ip || '',
        status: deviceData.status || 'OFFLINE',
        last_ping: now,
        created_at: now,
      };
      data.devices.push(newDevice);
      this.saveData(data);
      return newDevice;
    } else {
      // Actualizar dispositivo existente
      const updatedDevice: Device = {
        ...data.devices[index],
        ...deviceData,
        last_ping: now,
      };
      data.devices[index] = updatedDevice;
      this.saveData(data);
      return updatedDevice;
    }
  }

  public updateDeviceName(deviceId: string, displayName: string): Device | null {
    const data = this.loadData();
    const device = data.devices.find((d: Device) => d.device_id === deviceId);
    if (!device) return null;

    device.display_name = displayName;
    this.saveData(data);
    return device;
  }

  public updateDeviceSrt(deviceId: string, srtId: string | null): Device | null {
    const data = this.loadData();
    const device = data.devices.find((d: Device) => d.device_id === deviceId);
    if (!device) return null;

    device.assigned_srt = srtId || undefined;
    this.saveData(data);
    return device;
  }

  public deleteDevice(deviceId: string): boolean {
    const data = this.loadData();
    const initialLength = data.devices.length;
    data.devices = data.devices.filter((d: Device) => d.device_id !== deviceId);
    
    if (data.devices.length !== initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  public updateOfflineDevices(timeoutMs: number = 10000): number {
    const data = this.loadData();
    const now = new Date();
    let count = 0;

    data.devices = data.devices.map((device: Device) => {
      const lastPing = new Date(device.last_ping);
      if (now.getTime() - lastPing.getTime() > timeoutMs && device.status === 'ONLINE') {
        device.status = 'OFFLINE';
        count++;
      }
      return device;
    });

    if (count > 0) {
      this.saveData(data);
    }

    return count;
  }
} 