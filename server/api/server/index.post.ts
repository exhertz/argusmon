export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Выводим данные в консоль
  console.log('Получены данные нового сервера:', body)
  
  // В будущем здесь будет логика сохранения в базу данных
  return {
    success: true,
    message: 'Сервер успешно добавлен',
    data: body
  }
}) 