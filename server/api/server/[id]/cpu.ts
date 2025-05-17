import { getServerCpuMetrics } from '~/server/utils/database';

export default defineEventHandler(async (event) => {
  const serverId = parseInt(event.context.params?.id || '0');

  if (!serverId) {
    throw createError({
      statusCode: 400,
      message: 'ID сервера не указан'
    });
  }

  const metrics = getServerCpuMetrics(serverId);

  if (!metrics || metrics.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Метрики CPU не найдены для указанного сервера'
    });
  }

  return {
    success: true,
    data: metrics
  };
}); 