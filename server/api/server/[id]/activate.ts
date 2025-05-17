import { getServerById, activateServer } from '~/server/utils/database';
import { collectServerMetricsOnce } from '~/server/utils/metric-collector';

export default defineEventHandler(async (event) => {
  const serverId = parseInt(event.context.params?.id || '0');

  if (!serverId) {
    throw createError({
      statusCode: 400,
      message: 'ID сервера не указан'
    });
  }

  const server = getServerById(serverId);
  
  if (!server) {
    throw createError({
      statusCode: 404,
      message: 'Сервер не найден'
    });
  }
  
  try {
    // Пробуем собрать метрики сервера
    const success = await collectServerMetricsOnce(serverId, server.ip, server.port);

    if (success) {
      // Если сбор метрик успешен, активируем сервер
      await activateServer(serverId);
      setupServerMetricsCollection(server);
      return {
        success: true,
        message: 'Сервер успешно активирован'
      };
    } else {
      return {
        success: false,
        message: 'Не удалось собрать метрики, сервер остаётся неактивным'
      };
    }
  } catch (error) {
    console.error(`Ошибка при активации сервера ${serverId}:`, error);
    return {
      success: false,
      message: 'Произошла ошибка при активации сервера',
      error: String(error)
    };
  }
}); 