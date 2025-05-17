import { getServerList } from '~/server/utils/database';

export default defineEventHandler(() => {
  return getServerList();
}) 