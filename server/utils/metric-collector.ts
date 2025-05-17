import AgentClient from './agentclient';
import { 
  saveCpuMetrics, 
  saveDiskMetrics, 
  saveRamMetrics, 
  saveNetMetrics, 
  getUpdateInterval, 
  getAllActiveServers,
  activateServer,
  deactivateServer,
  getServerById
} from './database';

interface Server {
  id: number;
  ip: string;
  port: number;
  active?: boolean | number;
}

type MetricType = 'cpu' | 'disk' | 'ram' | 'net';
type CollectFunction = (serverId: number, serverIp: string, serverPort: number) => Promise<void>;

class MetricsCollector {
  private intervalIds: Map<number, NodeJS.Timeout[]> = new Map();
  private static instance: MetricsCollector;

  private constructor() {}

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private async executeAgentRequest(
    serverId: number, 
    serverIp: string, 
    serverPort: number, 
    command: string
  ): Promise<string> {
    const client = new AgentClient(serverIp, serverPort);
    try {
      await client.connect();
      const response = await client.sendRequest(command);
      return response;
    } finally {
      client.close();
    }
  }

  private isServerActive(serverId: number): boolean {
    return getServerById(serverId)?.active === 1;
  }

  // Общий метод для сбора метрик с обработкой ошибок
  private async collectMetrics(
    serverId: number,
    serverIp: string,
    serverPort: number,
    metricType: MetricType,
    command: string,
    saveFunction: (serverId: number, ...args: any[]) => Promise<void>,
    parseFunction: (data: string) => any[]
  ): Promise<void> {
    try {
      const stats = await this.executeAgentRequest(serverId, serverIp, serverPort, command);
      const metrics = parseFunction(stats);
      await saveFunction(serverId, ...metrics);
      console.log(`[${new Date().toISOString()}] ${metricType} metrics collected for server ${serverId}`);
    } catch (err) {
      console.error(`${metricType} Error for server ${serverId}:`, err);
      await this.handleServerError(serverId);
      throw err;
    }
  }

  // Сбор CPU метрик
  public async collectCpuMetrics(serverId: number, serverIp: string, serverPort: number): Promise<void> {
    return this.collectMetrics(
      serverId,
      serverIp,
      serverPort,
      'cpu',
      'getCpuStat',
      saveCpuMetrics,
      (data) => {
        const [cpuTotal, cpuIdle] = data.split(" ");
        return [parseInt(cpuTotal), parseInt(cpuIdle)];
      }
    );
  }

  // Сбор Disk метрик
  public async collectDiskMetrics(serverId: number, serverIp: string, serverPort: number): Promise<void> {
    return this.collectMetrics(
      serverId,
      serverIp,
      serverPort,
      'disk',
      'getDiskStat',
      saveDiskMetrics,
      (data) => {
        const [diskTotal, diskFree] = data.split(" ");
        return [parseInt(diskTotal), parseInt(diskFree)];
      }
    );
  }

  // Сбор RAM метрик
  public async collectRamMetrics(serverId: number, serverIp: string, serverPort: number): Promise<void> {
    return this.collectMetrics(
      serverId,
      serverIp,
      serverPort,
      'ram',
      'getRamStat',
      saveRamMetrics,
      (data) => {
        const [ramTotal, ramUsage, ramAvailable, ramCached, ramFree] = data.split(" ");
        return [{
          ramTotal: parseInt(ramTotal),
          ramUsage: parseInt(ramUsage || '0'),
          ramAvailable: parseInt(ramAvailable || '0'),
          ramCached: parseInt(ramCached || '0'),
          ramFree: parseInt(ramFree || '0')
        }];
      }
    );
  }

  // Сбор Network метрик
  public async collectNetMetrics(serverId: number, serverIp: string, serverPort: number): Promise<void> {
    return this.collectMetrics(
      serverId,
      serverIp,
      serverPort,
      'net',
      'getNetStat',
      saveNetMetrics,
      (data) => {
        const [netDownload, netUpload] = data.split(" ");
        return [parseInt(netDownload), parseInt(netUpload)];
      }
    );
  }

  // Обработчик ошибок сервера
  private async handleServerError(serverId: number): Promise<void> {
    if (!this.isServerActive(serverId)) {
      return;
    }

    await deactivateServer(serverId);
    this.clearServerIntervals(serverId);
    console.log(`Server ${serverId} deactivated and intervals cleared due to error`);
  }

  // Настройка интервала сбора метрик
  private setupInterval(
    serverId: number, 
    serverIp: string, 
    serverPort: number, 
    metricType: MetricType, 
    collectFunction: CollectFunction
  ): NodeJS.Timeout {
    const intervalMs = getUpdateInterval(serverId, metricType);
    console.log(`Setting up ${metricType} collection for server ${serverId} every ${intervalMs}ms`);
    
    return setInterval(async () => {
      if (!this.isServerActive(serverId)) {
        console.log(`Skipping ${metricType} collection for inactive server ${serverId}`);
        return;
      }
      
      try {
        await collectFunction.call(this, serverId, serverIp, serverPort);
      } catch (error) {
        console.error(`Error collecting ${metricType} metrics for server ${serverId} in scheduled job:`, error);
      }
    }, intervalMs);
  }

  // Запуск сбора метрик для всех серверов
  public async startCollection(): Promise<void> {
    try {
      console.log('Starting metrics collection for all active servers');
      
      const servers = getAllActiveServers();
      if (!servers || servers.length === 0) {
        console.log('No active servers found');
        return;
      }
      
      console.log(`Found ${servers.length} active servers`);
      this.clearAllIntervals();
      
      for (const server of servers) {
        this.setupServerCollection(server);
      }
      
      this.setupShutdownHandler();
      console.log('Metrics collection scheduled for all servers');
    } catch (err) {
      console.error("Error starting metrics collection:", err);
    }
  }

  private setupShutdownHandler(): void {
    process.on('SIGINT', () => {
      console.log('Stopping metrics collection...');
      this.clearAllIntervals();
      process.exit(0);
    });
  }

  private clearAllIntervals(): void {
    for (const [serverId, intervals] of this.intervalIds.entries()) {
      this.clearServerIntervals(serverId);
    }
    this.intervalIds.clear();
  }

  private clearServerIntervals(serverId: number): void {
    const intervals = this.intervalIds.get(serverId);
    if (intervals && intervals.length > 0) {
      intervals.forEach(id => clearInterval(id));
      console.log(`Cleared ${intervals.length} interval(s) for server ${serverId}`);
      this.intervalIds.delete(serverId);
    }
  }

  public setupServerCollection(server: Server): boolean {
    try {
      if (!server || !server.id || !server.ip || !server.port) {
        console.error('Invalid server data for metrics collection:', server);
        return false;
      }

      console.log(`Setting up metrics collection for server ${server.id} (${server.ip}:${server.port})`);
      
      const serverIntervals: NodeJS.Timeout[] = [];
      
      serverIntervals.push(
        this.setupInterval(server.id, server.ip, server.port, 'cpu', this.collectCpuMetrics),
        this.setupInterval(server.id, server.ip, server.port, 'disk', this.collectDiskMetrics),
        this.setupInterval(server.id, server.ip, server.port, 'ram', this.collectRamMetrics),
        this.setupInterval(server.id, server.ip, server.port, 'net', this.collectNetMetrics)
      );
      
      this.intervalIds.set(server.id, serverIntervals);
      
      console.log(`Metrics collection scheduled for server ${server.id}`);
      return true;
    } catch (error) {
      console.error(`Error setting up metrics collection for server ${server.id}:`, error);
      return false;
    }
  }

  public async collectServerMetricsOnce(
    serverId: number, 
    serverIp: string, 
    serverPort: number
  ): Promise<boolean> {
    console.log(`Attempting one-time metrics collection for server ${serverId} (${serverIp}:${serverPort})...`);
    
    try {
      await this.collectCpuMetrics(serverId, serverIp, serverPort);
      await this.collectDiskMetrics(serverId, serverIp, serverPort);
      await this.collectRamMetrics(serverId, serverIp, serverPort);
      await this.collectNetMetrics(serverId, serverIp, serverPort);
      
      console.log(`Successfully collected all metrics for server ${serverId}`);
      return true;
    } catch (error) {
      console.error(`Failed to collect metrics for server ${serverId}:`, error);
      return false;
    }
  }
}

// Экспортируемые функции
export async function startMetricsCollection(): Promise<void> {
  const collector = MetricsCollector.getInstance();
  await collector.startCollection();
}

export async function collectServerMetricsOnce(
  serverId: number, 
  serverIp: string, 
  serverPort: number
): Promise<boolean> {
  const collector = MetricsCollector.getInstance();
  return await collector.collectServerMetricsOnce(serverId, serverIp, serverPort);
}

export function setupServerMetricsCollection(server: Server): boolean {
  const collector = MetricsCollector.getInstance();
  return collector.setupServerCollection(server);
}