import * as net from 'net';

interface RequestHandler {
  resolve: (data: string) => void;
  reject: (error: Error) => void;
}

class AgentClient {
  private host: string;
  private port: number;
  private reqId: number;
  private requests: Map<number, RequestHandler>;
  private client: net.Socket;
  private connected: boolean;

  constructor(host: string = '127.0.0.1', port: number = 3444) {
    this.host = host;
    this.port = port;
    this.reqId = 0;
    this.requests = new Map();
    this.client = new net.Socket();
    this.connected = false;
    this.setup();
  }

  private setup(): void {
    this.client.on('data', (data: Buffer) => {
      try {
        const id = data.readInt32LE(0);
        const status = data.readInt32LE(4);
        const respData = data.slice(8).toString('utf-8').replace(/\0/g, '');

        console.log("<- data: id:", id, " status: ", status, " data: ", respData);
        if (this.requests.has(id)) {
          const { resolve, reject } = this.requests.get(id)!;
          if (status === 0) {
            resolve(respData);
          } else {
            reject(new Error(`Server error: ${this.getErrorByCode(status)}`));
          }
          this.requests.delete(id);
        }
      } catch (error) {
        console.error("Error processing server response:", error);
        // Если произошла ошибка обработки данных, закрываем все запросы с ошибкой
        this.rejectAllRequests(error instanceof Error ? error : new Error(String(error)));
      }
    });

    this.client.on('error', (err: NodeJS.ErrnoException) => {
      const errorMessage = `Network Error for server ${this.host}:${this.port}: ${err.message}`;
      
      if (err.code === 'ECONNREFUSED') {
        console.error("Agent is not running or server is unavailable");
      } else if (err.code === 'ECONNRESET') {
        console.error("Connection was reset by the server. The server might be overloaded or restarting.");
      } else if (err.code === 'ETIMEDOUT') {
        console.error("Connection timed out. The server might be unresponsive.");
      } else {
        console.error(`Socket error: ${err.code} - ${err.message}`);
      }

      this.rejectAllRequests(new Error(errorMessage));
      this.connected = false;
    });

    this.client.on('close', () => {
      this.connected = false;
      this.rejectAllRequests(new Error(`Connection to ${this.host}:${this.port} closed`));
    });

    this.client.on('end', () => {
      this.connected = false;
      console.log(`Server ${this.host}:${this.port} ended the connection`);
    });
  }

  private rejectAllRequests(error: Error): void {
    this.requests.forEach(({ reject }) => reject(error));
    this.requests.clear();
  }

  connect(): Promise<AgentClient> {
    return new Promise((resolve, reject) => {
      // Устанавливаем таймаут на подключение
      const connectTimeout = setTimeout(() => {
        this.client.removeListener('error', onError);
        reject(new Error(`Connection timeout to ${this.host}:${this.port}`));
      }, 10000); // 10 секунд таймаут

      const onConnect = () => {
        clearTimeout(connectTimeout);
        this.client.removeListener('error', onError);
        this.connected = true;
        resolve(this);
      };

      const onError = (err: Error) => {
        clearTimeout(connectTimeout);
        this.connected = false;
        reject(err);
      };

      this.client.once('connect', onConnect);
      this.client.once('error', onError);

      try {
        this.client.connect(this.port, this.host);
      } catch (err) {
        clearTimeout(connectTimeout);
        this.connected = false;
        reject(err);
      }
    });
  }

  sendRequest(path: string, data: string = ""): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(new Error(`Not connected to ${this.host}:${this.port}`));
      }

      try {
        const buffer = Buffer.alloc(1024);
        buffer.fill(0);
        const id = this.reqId++;
        buffer.writeInt32LE(id, 0);
        buffer.write(path, 4);
        buffer.write(data, 68);

        this.requests.set(id, { resolve, reject });
        
        // Установим таймаут для запроса
        const timeout = setTimeout(() => {
          if (this.requests.has(id)) {
            this.requests.delete(id);
            reject(new Error(`Request timeout for ${path} to ${this.host}:${this.port}`));
          }
        }, 30000); // 30 секунд таймаут на ответ

        // Обновим объект запроса, чтобы включить таймаут
        this.requests.set(id, { 
          resolve: (data: string) => {
            clearTimeout(timeout);
            resolve(data);
          }, 
          reject: (err: Error) => {
            clearTimeout(timeout);
            reject(err);
          } 
        });

        this.client.write(buffer);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private getErrorByCode(code: number): string {
    const errors: Record<number, string> = {
      0: "Success",
      1: "Bad request",
      2: "Path not found",
      3: "Access denied",
      4: "Data error"
    };
    return errors[code] || `Unknown error (${code})`;
  }

  close(): void {
    try {
      this.connected = false;
      this.rejectAllRequests(new Error("Connection closed by client"));
      this.client.end();
      this.client.destroy();
    } catch (error) {
      console.error("Error closing connection:", error);
    }
  }
}

export default AgentClient; 