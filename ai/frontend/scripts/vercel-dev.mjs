import { createServer } from 'vite'

const configuredPort = Number.parseInt(process.env.PORT ?? '', 10)
const port = Number.isInteger(configuredPort) ? configuredPort : 5173

const server = await createServer({
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
  },
})

await server.listen()
server.printUrls()
