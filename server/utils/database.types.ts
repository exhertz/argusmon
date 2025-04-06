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
  cpu_total: number;
  cpu_idle: number;
}

export interface DiskMetrics {
  disk_total: number;
  disk_free: number;
}

export interface RamMetrics {
  ram_total: number;
  ram_usage: number;
  ram_available: number;
  ram_cached: number;
  ram_free: number;
}

export interface NetMetrics {
  net_download: number;
  net_upload: number;
}