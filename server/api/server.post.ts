export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  console.log('Получены данные нового сервера:', body)
  
  // в будущем здесь будет сохранения в базу данных
  return {
    success: true,
    message: 'Сервер успешно добавлен'
  }
}) 