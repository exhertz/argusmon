export type IntervalType = 'cpu' | 'disk' | 'ram' | 'net';

export interface Server {
  id: number;
  ip: string;
  port: number;
  hostname: string | null;
  active: number;
  created_at: string;
}

export interface CpuMetrics {
  timestamp: string;
  cpu_total: number;
  cpu_idle: number;
}

export interface DiskMetrics {
  timestamp: string;
  disk_total: number;
  disk_free: number;
}

export interface RamMetrics {
  timestamp: string;
  ram_total: number;
  ram_usage: number;
  ram_available: number;
  ram_cached: number;
  ram_free: number;
}

export interface NetMetrics {
  timestamp: string;
  net_download: number;
  net_upload: number;
}