const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const port = Number(process.env.PORT || 3001)
const clients = new Set()
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

const liveReloadScript = `
<script>
  (() => {
    const events = new EventSource('/__maketi_live_reload')
    events.onmessage = (event) => {
      if (event.data === 'reload') window.location.reload()
    }
  })()
</script>`

const sendReload = (() => {
  let timer

  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      clients.forEach((response) => response.write('data: reload\\n\\n'))
    }, 80)
  }
})()

const resolveRequestPath = (requestPath) => {
  let pathname = decodeURIComponent(requestPath)

  if (pathname === '/maketi') {
    pathname = '/index.html'
  }

  if (pathname === '/maketi/' || pathname.startsWith('/maketi/')) {
    pathname = `/${pathname.slice('/maketi/'.length)}`
  }

  return path.resolve(root, `.${pathname}`)
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`)

  if (url.pathname === '/__maketi_live_reload') {
    response.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store',
      connection: 'keep-alive'
    })
    response.write('\\n')
    clients.add(response)
    request.on('close', () => clients.delete(response))
    return
  }

  let file = resolveRequestPath(url.pathname)

  if (!file.startsWith(root)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  fs.stat(file, (statError, stat) => {
    if (!statError && stat.isDirectory()) {
      file = path.join(file, 'index.html')
    }

    fs.readFile(file, 'utf8', (readTextError, text) => {
      if (!readTextError && path.extname(file) === '.html') {
        response.writeHead(200, {
          'content-type': types['.html'],
          'cache-control': 'no-store'
        })
        response.end(text.replace('</body>', `${liveReloadScript}</body>`))
        return
      }

      fs.readFile(file, (readBufferError, data) => {
        if (readBufferError) {
          response.writeHead(404)
          response.end('Not found')
          return
        }

        response.writeHead(200, {
          'content-type': types[path.extname(file)] || 'application/octet-stream',
          'cache-control': 'no-store'
        })
        response.end(data)
      })
    })
  })
})

;[
  'app.js',
  'index.html',
  'index.js',
  'components',
  'designSystem',
  'files',
  'functions',
  'methods',
  'pages',
  'sections',
  'snippets',
  'state.js'
].forEach((target) => {
  const targetPath = path.join(root, target)
  const watchOptions = fs.statSync(targetPath).isDirectory() ? { recursive: true } : {}

  fs.watch(targetPath, watchOptions, sendReload)
})

server.listen(port, () => {
  console.log(`Maketi preview with live reload: http://localhost:${port}/`)
})
