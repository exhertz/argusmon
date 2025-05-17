// updateInterval(serverId: number, intervalType: IntervalType, value: number): boolean {


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    
    console.log('Получены данные интервала:', body);
  
    if (!body.intervalType || !body.value ) {
      throw createError({
        statusCode: 400,
        message: 'Не все обязательные поля заполнены'
      });
    }
  
}) 