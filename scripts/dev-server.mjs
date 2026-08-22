import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, watch } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, relative } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, 'dist')
const cacheFile = join(root, '.symbols-runner-cache', 'project.json')
const port = Number(process.env.PORT || 1234)
const clients = new Set()
let version = Date.now()

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
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
}

const reloadScript = `
<script>
(() => {
  let currentVersion = null
  const reload = () => window.location.reload()
  const checkVersion = async () => {
    try {
      const response = await fetch('/__maketi_version__', { cache: 'no-store' })
      const data = await response.json()
      if (currentVersion === null) {
        currentVersion = data.version
      } else if (currentVersion !== data.version) {
        reload()
      }
    } catch (error) {}
  }

  try {
    const events = new EventSource('/__maketi_reload__')
    events.addEventListener('reload', reload)
    events.onerror = () => setTimeout(checkVersion, 300)
  } catch (error) {}

  setInterval(checkVersion, 1000)
  checkVersion()
})()
</script>`

let building = false
let rebuildQueued = false
let buildTimer = 0

const notifyReload = () => {
  version = Date.now()
  for (const client of clients) {
    client.write(`event: reload\\ndata: ${version}\\n\\n`)
  }
}

const build = async ({ reload = false } = {}) => {
  if (building) {
    rebuildQueued = true
    return
  }

  building = true
  rmSync(cacheFile, { force: true })

  await new Promise((resolve) => {
    const child = spawn('npm', ['run', 'build'], {
      cwd: root,
      stdio: 'inherit'
    })

    child.on('close', (code) => {
      building = false
      if (code === 0) {
        if (reload) notifyReload()
      } else {
        console.error(`[dev] build failed with exit code ${code}`)
      }

      if (rebuildQueued) {
        rebuildQueued = false
        build({ reload: true }).then(resolve)
      } else {
        resolve()
      }
    })
  })
}

const shouldWatch = (filename) => {
  if (!filename) return false
  const normalized = filename.split('\\').join('/')
  if (
    normalized.startsWith('dist/') ||
    normalized.startsWith('node_modules/') ||
    normalized.startsWith('.git/') ||
    normalized.startsWith('.symbols-runner-cache/') ||
    normalized.includes('/.DS_Store') ||
    normalized.endsWith('.log')
  ) return false

  return /\.(js|mjs|json|html|css|svg|png|jpe?g|webp|ttf|woff2?|eot)$/i.test(normalized)
}

const scheduleBuild = (filename) => {
  if (!shouldWatch(filename)) return
  clearTimeout(buildTimer)
  buildTimer = setTimeout(() => {
    console.log(`[dev] changed ${filename}`)
    build({ reload: true })
  }, 180)
}

const sendIndex = (response) => {
  const indexPath = join(dist, 'index.html')
  if (!existsSync(indexPath)) {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Build is not ready yet')
    return
  }

  const html = readFileSync(indexPath, 'utf8')
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store'
  })
  const withReload = html.includes('</head>')
    ? html.replace('</head>', `${reloadScript}</head>`)
    : html.includes('</body>')
      ? html.replace('</body>', `${reloadScript}</body>`)
      : `${html}${reloadScript}`
  response.end(withReload)
}

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`)

  if (url.pathname === '/__maketi_reload__') {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive'
    })
    response.write('\\n')
    clients.add(response)
    request.on('close', () => clients.delete(response))
    return
  }

  if (url.pathname === '/__maketi_version__') {
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    })
    response.end(JSON.stringify({ version }))
    return
  }

  const requestedPath = decodeURIComponent(url.pathname)
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '')
  const filePath = join(dist, safePath)
  const rel = relative(dist, filePath)

  if (rel.startsWith('..') || rel === '' || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    sendIndex(response)
    return
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  })
  createReadStream(filePath).pipe(response)
})

mkdirSync(dist, { recursive: true })
await build()

watch(root, { recursive: true }, (event, filename) => scheduleBuild(filename))

server.listen(port, '0.0.0.0', () => {
  console.log(`Maketi dev server: http://localhost:${port}`)
  console.log('Auto-refresh is enabled after successful rebuilds.')
})
