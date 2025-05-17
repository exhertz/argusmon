export default defineNitroPlugin(() => {
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // Certainly not to do so, but it will remain so
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
  });

  console.log('[server/plugins/error-handler]: Error handler registered');
}); 