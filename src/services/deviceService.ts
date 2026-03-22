import { Device, DeviceInfo, BatteryInfo } from '@capacitor/device';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

export interface RealStats {
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  ping: number;
  ramUsage: number;
  cpuTemp: number;
  model: string;
  platform: string;
}

export class DeviceService {
  static async getDeviceInfo(): Promise<DeviceInfo> {
    return await Device.getInfo();
  }

  static async getBatteryInfo(): Promise<BatteryInfo> {
    return await Device.getBatteryInfo();
  }

  static async getNetworkStatus(): Promise<ConnectionStatus> {
    return await Network.getStatus();
  }

  static async saveSettings(key: string, value: any) {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  static async getSettings(key: string): Promise<any> {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  }

  // Simulate ping based on network type
  static async getPing(status: ConnectionStatus): Promise<number> {
    if (status.connectionType === 'none') return 999;
    if (status.connectionType === 'wifi') return 15 + Math.random() * 20;
    return 40 + Math.random() * 40;
  }

  // Simulate RAM usage based on device info if available
  // Webview doesn't give full system RAM usage easily, so we simulate based on memory info if available
  static getRamUsage(): number {
    // @ts-ignore
    if (window.performance && window.performance.memory) {
      // @ts-ignore
      const memory = window.performance.memory;
      return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
    }
    return 45 + Math.random() * 15;
  }

  // Simulate CPU temp (no direct web API for this)
  static getCpuTemp(): number {
    return 35 + Math.random() * 10;
  }
}
