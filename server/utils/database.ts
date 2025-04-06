import Database from 'better-sqlite3';
import { join } from 'path';

import { Server, CpuMetrics, DiskMetrics, RamMetrics, NetMetrics, IntervalType } from './database.types';

export const useDB = () => {
  return new Database('storage.db', {
    // verbose: console.log
  });
};

export function initializeDatabase() {
  const db = useDB();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      port INTEGER NOT NULL,
      hostname TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (ip, port)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS cpu_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      cpu_total INTEGER NOT NULL,
      cpu_idle INTEGER NOT NULL, 
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS disk_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      disk_total INTEGER NOT NULL,
      disk_free INTEGER NOT NULL,  
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS ram_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      ram_total INTEGER NOT NULL,    
      ram_usage INTEGER NOT NULL,    
      ram_available INTEGER NOT NULL,
      ram_cached INTEGER NOT NULL,   
      ram_free INTEGER NOT NULL,     
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS net_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      net_download INTEGER NOT NULL,  
      net_upload INTEGER NOT NULL,  
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS intervals (
      server_id INTEGER NOT NULL,
      cpu INTEGER DEFAULT 60000,
      disk INTEGER DEFAULT 300000,
      ram INTEGER DEFAULT 60000,
      net INTEGER DEFAULT 60000,
      PRIMARY KEY (server_id),
      FOREIGN KEY (server_id) REFERENCES servers(id)
    )
  `);
  
  return db;
}

/**
 * Gets list of all servers from the database
 * @returns Array of server objects
 */
export function getServerList(): Server[] {
  const db = useDB();
  return db.prepare('SELECT * FROM servers').all() as Server[];
}

/**
 * Gets CPU metrics for the specified server
 * @param serverId Server ID
 * @returns CPU metrics object or null if metrics not found
 */
export function getServerCpuMetrics(serverId: number): CpuMetrics | null {
  const db = useDB();
  return db.prepare(`
    SELECT cpu_total, cpu_idle 
    FROM cpu_metrics 
    WHERE server_id = ? 
    ORDER BY timestamp DESC 
    LIMIT 1
  `).get(serverId) as CpuMetrics | null;
}

/**
 * Gets disk metrics for the specified server
 * @param serverId Server ID
 * @returns Disk metrics object or null if metrics not found
 */
export function getServerDiskMetrics(serverId: number): DiskMetrics | null {
  const db = useDB();
  return db.prepare(`
    SELECT disk_total, disk_free 
    FROM disk_metrics 
    WHERE server_id = ? 
    ORDER BY timestamp DESC 
    LIMIT 1
  `).get(serverId) as DiskMetrics | null;
}

/**
 * Gets RAM metrics for the specified server
 * @param serverId Server ID
 * @returns RAM metrics object or null if metrics not found
 */
export function getServerRamMetrics(serverId: number): RamMetrics | null {
  const db = useDB();
  return db.prepare(`
    SELECT ram_total, ram_usage, ram_available, ram_cached, ram_free 
    FROM ram_metrics 
    WHERE server_id = ? 
    ORDER BY timestamp DESC 
    LIMIT 1
  `).get(serverId) as RamMetrics | null;
}

/**
 * Gets network metrics for the specified server
 * @param serverId Server ID
 * @returns Network metrics object or null if metrics not found
 */
export function getServerNetMetrics(serverId: number): NetMetrics | null {
  const db = useDB();
  return db.prepare(`
    SELECT net_download, net_upload 
    FROM net_metrics 
    WHERE server_id = ? 
    ORDER BY timestamp DESC 
    LIMIT 1
  `).get(serverId) as NetMetrics | null;
}

/**
 * Gets update interval for the specified server and metric type
 * @param serverId Server ID
 * @param intervalType Metric type (cpu, disk, ram, net)
 * @returns Update interval in milliseconds
 */
export function getUpdateInterval(serverId: number, intervalType: IntervalType): number {
  const db = useDB();
  const result = db.prepare(`
    SELECT ${intervalType} as interval_value
    FROM intervals
    WHERE server_id = ?
  `).get(serverId);
  
  if (!result) {
    const defaultIntervals: Record<IntervalType, number> = {
      cpu: 60000,
      disk: 300000,
      ram: 60000,
      net: 60000
    };
    return defaultIntervals[intervalType];
  }

  return result.interval_value;
}

export function fillTestData() {
  const db = useDB();
  
  const serverCount = db.prepare('SELECT COUNT(*) as count FROM servers').get() as { count: number };
  
  if (serverCount.count === 0) {
    console.log('Filling servers table with test data...');
    
    const servers = [
      { ip: '192.168.1.10', port: 22, hostname: 'server1.local', active: 1 },
      { ip: '192.168.1.11', port: 22, hostname: 'server2.local', active: 1 },
      { ip: '192.168.1.12', port: 22, hostname: 'server3.local', active: 0 },
      { ip: '10.0.0.1', port: 22, hostname: 'production1.example.com', active: 1 },
      { ip: '10.0.0.2', port: 8022, hostname: 'production2.example.com', active: 1 }
    ];
    
    const insertServer = db.prepare(
      'INSERT INTO servers (ip, port, hostname, active) VALUES (?, ?, ?, ?)'
    );
    
    for (const server of servers) {
      try {
        insertServer.run(server.ip, server.port, server.hostname, server.active);
      } catch (error) {
        console.error(`Error adding server ${server.hostname}:`, error);
      }
    }
    
    const insertedServers = db.prepare('SELECT id FROM servers').all() as Array<{ id: number }>;
    
    const insertIntervals = db.prepare(
      'INSERT INTO intervals (server_id, cpu, disk, ram, net) VALUES (?, ?, ?, ?, ?)'
    );
    
    for (const server of insertedServers) {
      try {
        const cpuInterval = Math.floor(Math.random() * 30000) + 30000; // 30-60 seconds
        const diskInterval = Math.floor(Math.random() * 300000) + 300000; // 5-10 minutes
        const ramInterval = Math.floor(Math.random() * 30000) + 30000; // 30-60 seconds
        const netInterval = Math.floor(Math.random() * 30000) + 30000; // 30-60 seconds
        
        insertIntervals.run(server.id, cpuInterval, diskInterval, ramInterval, netInterval);
      } catch (error) {
        console.error(`Error adding intervals for server ID ${server.id}:`, error);
      }
    }
    
    const insertCpuMetrics = db.prepare(
      'INSERT INTO cpu_metrics (server_id, cpu_total, cpu_idle) VALUES (?, ?, ?)'
    );
    
    const insertDiskMetrics = db.prepare(
      'INSERT INTO disk_metrics (server_id, disk_total, disk_free) VALUES (?, ?, ?)'
    );
    
    const insertRamMetrics = db.prepare(
      'INSERT INTO ram_metrics (server_id, ram_total, ram_usage, ram_available, ram_cached, ram_free) VALUES (?, ?, ?, ?, ?, ?)'
    );
    
    const insertNetMetrics = db.prepare(
      'INSERT INTO net_metrics (server_id, net_download, net_upload) VALUES (?, ?, ?)'
    );
    
    for (const server of insertedServers) {
      const numberOfEntries = Math.floor(Math.random() * 5) + 5;
      
      for (let i = 0; i < numberOfEntries; i++) {
        try {
          const cpuTotal = Math.floor(Math.random() * 1000000) + 1000000;
          const cpuIdle = Math.floor(Math.random() * cpuTotal);
          insertCpuMetrics.run(server.id, cpuTotal, cpuIdle);
          
          const diskTotal = Math.floor(Math.random() * 1000000000) + 100000000000; // ~100-200 GB
          const diskFree = Math.floor(Math.random() * diskTotal);
          insertDiskMetrics.run(server.id, diskTotal, diskFree);
          
          const ramTotal = Math.floor(Math.random() * 10000000000) + 5000000000; // ~5-15 GB
          const ramFree = Math.floor(Math.random() * ramTotal * 0.5);
          const ramCached = Math.floor(Math.random() * ramTotal * 0.3);
          const ramAvailable = ramFree + ramCached;
          const ramUsage = ramTotal - ramAvailable;
          insertRamMetrics.run(server.id, ramTotal, ramUsage, ramAvailable, ramCached, ramFree);
          
          const netDownload = Math.floor(Math.random() * 100000000);
          const netUpload = Math.floor(Math.random() * 10000000);
          insertNetMetrics.run(server.id, netDownload, netUpload);
        } catch (error) {
          console.error(`Error adding metrics for server ID ${server.id}:`, error);
        }
      }
    }
    
    console.log('Database filled with test data');
  } else {
    console.log('Database already contains data, filling not required');
  }
}

/**
 * Saves CPU metrics for the specified server
 * @param serverId Server ID
 * @param cpuTotal Total CPU time
 * @param cpuIdle CPU idle time
 * @returns ID of the new record or null in case of error
 */
export function saveCpuMetrics(serverId: number, cpuTotal: number, cpuIdle: number): number | null {
  try {
    const db = useDB();
    const result = db.prepare(
      'INSERT INTO cpu_metrics (server_id, cpu_total, cpu_idle) VALUES (?, ?, ?)'
    ).run(serverId, cpuTotal, cpuIdle);
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error(`Error saving CPU metrics for server ID ${serverId}:`, error);
    return null;
  }
}

/**
 * Saves disk metrics for the specified server
 * @param serverId Server ID
 * @param diskTotal Total disk size in bytes
 * @param diskFree Free disk space in bytes
 * @returns ID of the new record or null in case of error
 */
export function saveDiskMetrics(serverId: number, diskTotal: number, diskFree: number): number | null {
  try {
    const db = useDB();
    const result = db.prepare(
      'INSERT INTO disk_metrics (server_id, disk_total, disk_free) VALUES (?, ?, ?)'
    ).run(serverId, diskTotal, diskFree);
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error(`Error saving Disk metrics for server ID ${serverId}:`, error);
    return null;
  }
}

/**
 * Saves RAM metrics for the specified server
 * @param serverId Server ID
 * @param metrics RAM metrics object
 * @returns ID of the new record or null in case of error
 */
export function saveRamMetrics(
  serverId: number, 
  metrics: { 
    ramTotal: number;
    ramUsage: number;
    ramAvailable: number;
    ramCached: number;
    ramFree: number;
  }
): number | null {
  try {
    const db = useDB();
    const result = db.prepare(
      'INSERT INTO ram_metrics (server_id, ram_total, ram_usage, ram_available, ram_cached, ram_free) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      serverId,
      metrics.ramTotal,
      metrics.ramUsage,
      metrics.ramAvailable,
      metrics.ramCached,
      metrics.ramFree
    );
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error(`Error saving RAM metrics for server ID ${serverId}:`, error);
    return null;
  }
}

/**
 * Saves network metrics for the specified server
 * @param serverId Server ID
 * @param netDownload Download speed in bytes
 * @param netUpload Upload speed in bytes
 * @returns ID of the new record or null in case of error
 */
export function saveNetMetrics(serverId: number, netDownload: number, netUpload: number): number | null {
  try {
    const db = useDB();
    const result = db.prepare(
      'INSERT INTO net_metrics (server_id, net_download, net_upload) VALUES (?, ?, ?)'
    ).run(serverId, netDownload, netUpload);
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error(`Error saving Net metrics for server ID ${serverId}:`, error);
    return null;
  }
}

/**
 * Updates interval for the specified server and metric type
 * @param serverId Server ID
 * @param intervalType Interval type (cpu, disk, ram, net)
 * @param value Interval value in milliseconds
 * @returns true on success, false on error
 */
export function updateInterval(serverId: number, intervalType: IntervalType, value: number): boolean {
  try {
    const db = useDB();
    
    const exists = db.prepare('SELECT 1 FROM intervals WHERE server_id = ?').get(serverId);
    
    if (exists) {
      db.prepare(`UPDATE intervals SET ${intervalType} = ? WHERE server_id = ?`).run(value, serverId);
    } else {
      const defaultIntervals: Record<IntervalType, number> = {
        cpu: 60000,
        disk: 300000,
        ram: 60000,
        net: 60000
      };
      
      defaultIntervals[intervalType] = value;
      
      db.prepare(
        'INSERT INTO intervals (server_id, cpu, disk, ram, net) VALUES (?, ?, ?, ?, ?)'
      ).run(
        serverId, 
        defaultIntervals.cpu, 
        defaultIntervals.disk, 
        defaultIntervals.ram, 
        defaultIntervals.net
      );
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating ${intervalType} interval for server ID ${serverId}:`, error);
    return false;
  }
}

/**
 * Adds a new server to the database
 * @param ip Server IP address
 * @param port Server port
 * @param hostname Server hostname (optional)
 * @returns ID of the new server or null in case of error
 */
export function addServer(ip: string, port: number, hostname?: string): number | null {
  try {
    const db = useDB();
    const result = db.prepare(
      'INSERT INTO servers (ip, port, hostname, active) VALUES (?, ?, ?, 1)'
    ).run(ip, port, hostname || null);
    
    const serverId = result.lastInsertRowid as number;
    
    db.prepare(
      'INSERT INTO intervals (server_id, cpu, disk, ram, net) VALUES (?, ?, ?, ?, ?)'
    ).run(serverId, 60000, 300000, 60000, 60000);
    
    return serverId;
  } catch (error) {
    console.error(`Error adding server ${ip}:${port}:`, error);
    return null;
  }
} 