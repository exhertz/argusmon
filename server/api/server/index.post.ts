import { addServer, getServerList, getServerById } from '~/server/utils/database';
import { collectServerMetricsOnce, setupServerMetricsCollection } from '~/server/utils/metric-collector';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  console.log('Получены данные нового сервера:', body);

  if (!body.ip || !body.port || !body.name) {
    throw createError({
      statusCode: 400,
      message: 'Не все обязательные поля заполнены'
    });
  }

  if (body.ip.length > 15) {
    throw createError({
      statusCode: 400,
      message: 'IP адрес не может быть длиннее 15 символов'
    });
  } 
  
  if (body.port < 1 || body.port > 65535) {
    throw createError({
      statusCode: 400,
      message: 'Порт должен быть в диапазоне 1-65535'
    });
  }

  if (body.name.length > 255) {
    throw createError({
      statusCode: 400,
      message: 'Имя сервера не может быть длиннее 255 символов'
    });
  }

  const existingServers = getServerList();
  const serverExists = existingServers.some(server => 
    server.ip === body.ip && server.port === body.port
  );

  if (serverExists) {
    throw createError({
      statusCode: 400,
      message: 'Сервер с таким IP-адресом и портом уже существует'
    });
  }
  
  const serverId = addServer(body.ip, body.port, body.name);

  if (!serverId) {
    throw createError({
      statusCode: 500,
      message: 'Ошибка при добавлении сервера'
    });
  }

  // Получаем информацию о только что добавленном сервере
  const newServer = getServerById(serverId);

  // Флаг для отслеживания успешности сбора метрик
  let metricsCollected = false;
  let collectionError = null;

  // Пытаемся собрать метрики с сервера
  if (newServer) {
    try {
      // Собираем метрики с нового сервера
      metricsCollected = await collectServerMetricsOnce(serverId, newServer.ip, newServer.port);
      
      if (metricsCollected) {
        // Если метрики успешно собраны, настраиваем периодический сбор
        setupServerMetricsCollection(newServer);
      }
    } catch (error: any) {
      console.error(`Ошибка при настройке сбора метрик для нового сервера ${serverId}:`, error);
      collectionError = error.message || 'Ошибка при сборе метрик';
    }
  }

  return {
    success: true,
    message: 'Сервер успешно добавлен',
    serverId: serverId,
    metricsCollected: metricsCollected,
    collectionStatus: metricsCollected 
      ? 'Метрики успешно собраны и настроен периодический сбор' 
      : 'Не удалось собрать метрики, сервер может быть недоступен',
    collectionError: collectionError
  };
}) 