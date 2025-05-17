import { fillTestData, initializeDatabase } from '../utils/database';

export default defineNitroPlugin(() => {
  try {
    console.log('[server/plugins/database]: Initializing database...');
    const db = initializeDatabase();
    fillTestData(); // test
    console.log('[server/plugins/database]: ✔ Database initialized successfully');
  } catch (error) {
    console.error('[server/plugins/database]: Error initializing database:', error);
  }
}); 