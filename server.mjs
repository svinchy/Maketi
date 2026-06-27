import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const maketiRoot = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = maketiRoot
const port = Number(process.env.PORT || 4174)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
}

const server = createServer((request, response) => {
  const requestedPath = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname)
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '')
  const filePath = safePath === '/'
    ? join(maketiRoot, 'index.html')
    : safePath.startsWith('/node_modules/')
      ? join(projectRoot, safePath)
      : join(maketiRoot, safePath)

  if (!filePath.startsWith(projectRoot) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  })
  createReadStream(filePath).pipe(response)
})

server.listen(port, () => {
  console.log(`Maketi localhost: http://localhost:${port}`)
})
