import { fillTestData, initializeDatabase } from '../utils/database';

export default defineNitroPlugin(() => {
  try {
    console.log('Initializing database...');
    const db = initializeDatabase();
    fillTestData(); // test
    console.log('✔ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}); 