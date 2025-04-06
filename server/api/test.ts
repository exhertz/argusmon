import { getServerDiskMetrics } from '../utils/database';

export default defineEventHandler(async (event) => {
  const diskMetrics = await getServerDiskMetrics(1);
  
  // Проверяем, получены ли метрики
  if (!diskMetrics) {
    return {
      success: false,
      error: 'Метрики диска не найдены для указанного сервера'
    };
  }
  
  // Если метрики получены, извлекаем нужные данные
  const { disk_total, disk_free } = diskMetrics;
  
  // Рассчитываем процент использования
  const usagePercent = ((disk_total - disk_free) / disk_total) * 100;
  
  return {
    success: true,
    data: {
      disk_total,
      disk_free,
      disk_used: disk_total - disk_free,
      usage_percent: usagePercent.toFixed(2)
    }
  };
});

/*
// Добавление сервера
const newServerId = addServer('192.168.1.100', 22, 'new-server.local');
if (newServerId) {
  console.log(`Новый сервер добавлен с ID: ${newServerId}`);
  
  // Сохранение метрик
  saveCpuMetrics(newServerId, 1000000, 500000);
  saveDiskMetrics(newServerId, 1000000000000, 500000000000);
  saveRamMetrics(newServerId, {
    ramTotal: 16000000000,
    ramUsage: 8000000000,
    ramAvailable: 8000000000,
    ramCached: 2000000000,
    ramFree: 6000000000
  });
  saveNetMetrics(newServerId, 1000000, 500000);
  
  // Изменение интервала обновления
  updateInterval(newServerId, 'cpu', 30000); // Каждые 30 секунд
}
*/