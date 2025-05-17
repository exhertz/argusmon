import { getUpdateInterval } from '~/server/utils/database';

export default defineEventHandler(async (event) => {
  const serverId = parseInt(event.context.params?.id || '0');

  if (!serverId) {
    throw createError({
      statusCode: 400,
      message: 'ID сервера не указан'
    });
  }

  const intervals = {
    cpu: getUpdateInterval(serverId, 'cpu'),
    disk: getUpdateInterval(serverId, 'disk'),
    ram: getUpdateInterval(serverId, 'ram'),
    net: getUpdateInterval(serverId, 'net')
  };

  return {
    success: true,
    data: intervals
  };
}); 