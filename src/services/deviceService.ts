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

  static async requestPermissions(): Promise<boolean> {
    // In a real app, we would request specific native permissions here
    // For this web-based demo, we simulate the request
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1500);
    });
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
    if (status.connectionType === 'wifi') return 12 + Math.random() * 15;
    return 35 + Math.random() * 35;
  }

  // Simulate RAM usage
  static getRamUsage(): number {
    // @ts-ignore
    if (window.performance && window.performance.memory) {
      // @ts-ignore
      const memory = window.performance.memory;
      const usage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
      return Math.min(Math.max(usage, 30), 95);
    }
    return 42 + Math.random() * 12;
  }

  // Simulate CPU usage with one decimal place
  static getCpuUsage(): number {
    const usage = 12 + Math.random() * 48;
    return parseFloat(usage.toFixed(1));
  }

  // Simulate CPU temperature
  static getCpuTemp(): number {
    return Math.round(32 + Math.random() * 18);
  }

  // Simulate Junk files found
  static getJunkSize(): string {
    return (0.8 + Math.random() * 4.2).toFixed(1) + ' GB';
  }

  // Simulate optimization actions
  static async performAction(name: string, duration: number = 3000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  static async boostSystem(): Promise<void> {
    // Simulate a deep system boost
    return this.performAction('Boosting System', 4000);
  }

  static async cleanJunk(): Promise<void> {
    return this.performAction('Cleaning Junk', 3500);
  }

  static async coolPhone(): Promise<void> {
    return this.performAction('Cooling Phone', 4000);
  }
}
