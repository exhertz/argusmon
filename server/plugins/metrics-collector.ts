import { startMetricsCollection } from '../utils/metric-collector';

export default defineNitroPlugin((nitroApp) => {
  console.log('[server/plugins/metrics-collector]: Starting metrics collection...');
  
  // Запускаем сбор метрик с небольшой задержкой для полной инициализации сервера
  setTimeout(() => {
    startMetricsCollection().catch(err => {
      console.error('[server/plugins/metrics-collector]: Failed to start metrics collection:', err);
    });
  }, 1000);
  
  console.log('[server/plugins/metrics-collector]: Metrics collector plugin registered');
}); 