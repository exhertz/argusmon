export default defineEventHandler((event) => {
  const id = parseInt(event.context.params.id)
  
  const servers = [
    {
      id: 1,
      name: 'Production Server',
      status: 'online',
      ip: '192.168.1.100'
    },
    {
      id: 2,
      name: 'Development Server',
      status: 'offline',
      ip: '192.168.1.101'
    },
    {
      id: 3,
      name: 'Testing Server',
      status: 'online',
      ip: '192.168.1.102'
    },
    {
      id: 4,
      name: 'Staging Server',
      status: 'maintenance',
      ip: '192.168.1.103'
    }
  ]

  const server = servers.find(s => s.id === id)
  
  if (!server) {
    throw createError({
      statusCode: 404,
      message: 'Сервер не найден'
    })
  }

  return server
}) 