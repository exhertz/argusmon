import { getServerList } from '~/server/utils/database';
import { Server } from '~/server/utils/database.types';

export default defineEventHandler((event) => {
  const id = parseInt(event.context.params?.id || '0');

  const servers: Server[] = getServerList();


  const server = servers.find(s => s.id === id);
  
  if (!server) {
    throw createError({
      statusCode: 404,
      message: 'Сервер не найден'
    })
  }

  return server;
}) 