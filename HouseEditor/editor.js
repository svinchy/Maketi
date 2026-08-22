// Standalone House Editor — realistic configurable house exterior.
// Geometry is procedural; surfaces use real photo-scanned PBR textures
// (CC0, ambientCG) from ./assets plus an HDRI sky (CC0, Poly Haven) for
// ambient light. Kept as one exported setup function so it can later be
// wired into the HouseEditor DOMQL component's onInit like effects/.

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

// ---------------------------------------------------------------------------
// configuration + pricing
// ---------------------------------------------------------------------------

// base construction price is footprint area × rate
const RATE_PER_M2 = 950

const SIZE_PRESETS = [
  { id: 'compact', label: 'Compact', w: 8, d: 6 },
  { id: 'family', label: 'Family', w: 10, d: 8 },
  { id: 'large', label: 'Large', w: 12, d: 10 },
  { id: 'estate', label: 'Estate', w: 14, d: 12 }
]

const FLOOR_OPTIONS = [
  { id: 1, label: 'One' },
  { id: 2, label: 'Two' },
  { id: 3, label: 'Three' }
]

// toggleable building blocks — any combination; extension/terrace expand
// with per-storey sub-choices when enabled
const PRICE_GARAGE = 18500
const PRICE_EXT_STOREY = 16000
const PRICE_TERRACE = 6500
const PRICE_BALCONY = 5500

const ADDONS = [
  { id: 'garage', label: 'Garage', priceNote: '+ ₾ 18,500' },
  { id: 'extension', label: 'Side extension', priceNote: '+ ₾ 16,000 / storey' },
  { id: 'terrace', label: 'Terrace & balcony', priceNote: 'ground ₾ 6,500 · balcony ₾ 5,500' }
]

const SIZE_LIMITS = { w: [5, 18], d: [4, 14] }

// foundation / base styles — height (floor level), how far it oversails the
// walls, its material and an optional colour tint
const FOUNDATIONS = [
  { id: 'classic', label: 'სტანდარტული ცოკოლი', height: 0.3, over: 0.08, mat: 'concrete', color: null },
  { id: 'cottage', label: 'მაღალი ქვის ცოკოლი', height: 0.62, over: 0.16, mat: 'brick', color: 0x8f8880 },
  { id: 'modern', label: 'დაბალი ცოკოლი', height: 0.14, over: 0.03, mat: 'concrete', color: 0xd0ccc3 }
]

// wall / facade finishes — each is a genuinely distinct material.
// Professional facade-finish names.
const WALLS = [
  { id: 'plaster', label: 'შელესილი ფასადი', tex: 'plaster', color: null },
  { id: 'brick', label: 'აგურის მოპირკეთება', tex: 'brick', color: null },
  { id: 'stone', label: 'ბუნებრივი ქვა', tex: 'stone', color: null },
  { id: 'wood', label: 'ხის ფასადი', tex: 'wood', color: 0xcaa377 },
  { id: 'concrete', label: 'ღია ბეტონი', tex: 'concrete', color: null }
]

const CATALOG = [
  {
    key: 'roofType',
    title: 'Roof shape',
    options: [
      { id: 'gable', label: 'Gable', price: 8000 },
      { id: 'hip', label: 'Hip', price: 9500 },
      { id: 'flat', label: 'Flat', price: 7200 },
      { id: 'gambrel', label: 'Gambrel · classic', price: 9800 },
      { id: 'mansard', label: 'Mansard · classic', price: 11000 },
      { id: 'skillion', label: 'Mono-pitch · modern', price: 7800 }
    ]
  },
  {
    key: 'roofMaterial',
    title: 'Roof material',
    options: [
      { id: 'tile', label: 'Terracotta tile', price: 3600 },
      { id: 'metal', label: 'Metal seam', price: 2900 },
      { id: 'shingle', label: 'Slate shingle', price: 2300 }
    ]
  },
  {
    key: 'wallMaterial',
    title: 'Walls',
    options: [
      { id: 'plaster', label: 'Plaster', price: 3800 },
      { id: 'brick', label: 'Brick', price: 6400 },
      { id: 'wood', label: 'Wood board', price: 5100 }
    ]
  },
  {
    key: 'doorStyle',
    title: 'Front door',
    options: [
      { id: 'wood', label: 'Classic wood', price: 950 },
      { id: 'modern', label: 'Modern dark', price: 1450 }
    ]
  }
]

const config = {
  sizeId: 'compact',
  width: 8,
  depth: 6,
  floors: 1,
  roofType: 'gable',
  roofMaterial: 'tile',
  wallMaterial: 'plaster',
  doorStyle: 'wood',
  windowStyle: 'classic',
  foundation: 'classic',
  terrace: 'none',
  terraceDoor: 'french',
  addons: {
    garage: false,
    extension: { on: false, storeys: 1 },
    terrace: { on: false, levels: [1] } // 1 = ground terrace, 2/3 = balconies
  }
}

// base construction = total floor area (footprint × storeys) × rate
function basePrice () {
  return Math.round(config.width * config.depth * config.floors * RATE_PER_M2)
}

// ---------------------------------------------------------------------------
// surfaces: photo-scanned PBR maps from ./assets (+ procedural curtain)
// ---------------------------------------------------------------------------

const TEX = {}
const MAT_CACHE = new Map()
const ASSETS = new URL('./assets/', import.meta.url)

function makeCanvas (size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return c
}

function toTexture (canvas, srgb = true) {
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function normalFromHeight (heightCanvas, strength = 2.5) {
  const s = heightCanvas.width
  const src = heightCanvas.getContext('2d').getImageData(0, 0, s, s).data
  const out = makeCanvas(s)
  const octx = out.getContext('2d')
  const img = octx.createImageData(s, s)
  const hv = (x, y) => src[(((y + s) % s) * s + ((x + s) % s)) * 4] / 255
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const dx = (hv(x + 1, y) - hv(x - 1, y)) * strength
      const dy = (hv(x, y + 1) - hv(x, y - 1)) * strength
      const inv = 1 / Math.hypot(dx, dy, 1)
      const i = (y * s + x) * 4
      img.data[i] = (-dx * inv * 0.5 + 0.5) * 255
      img.data[i + 1] = (dy * inv * 0.5 + 0.5) * 255
      img.data[i + 2] = inv * 255
      img.data[i + 3] = 255
    }
  }
  octx.putImageData(img, 0, 0)
  return toTexture(out, false)
}

// soft fabric folds for the window curtains — stays procedural
function makeCurtain () {
  const size = 256
  const cc = makeCanvas(size)
  const hc = makeCanvas(size)
  const c = cc.getContext('2d')
  const h = hc.getContext('2d')
  for (let x = 0; x < size; x += 4) {
    const t = Math.sin((x / size) * Math.PI * 10)
    c.fillStyle = `hsl(40, 14%, ${74 + t * 5}%)`
    c.fillRect(x, 0, 4, size)
    const hv = 128 + t * 34
    h.fillStyle = `rgb(${hv},${hv},${hv})`
    h.fillRect(x, 0, 4, size)
  }
  TEX.curtain = { map: toTexture(cc), nrm: normalFromHeight(hc, 1.2) }
}

// photo-scanned surfaces; metal also ships a metalness map
const SURFACE_FILES = ['plaster', 'brick', 'wood', 'tile', 'metal', 'shingle', 'concrete', 'stone']

function loadSurfaces () {
  return new Promise(resolve => {
    const manager = new THREE.LoadingManager(() => resolve())
    const loader = new THREE.TextureLoader(manager)
    const load = (path, srgb) => {
      const t = loader.load(new URL(path, ASSETS).href)
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      if (srgb) t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      return t
    }
    for (const name of SURFACE_FILES) {
      TEX[name] = {
        map: load(`${name}/color.jpg`, true),
        nrm: load(`${name}/normal.jpg`),
        rough: load(`${name}/rough.jpg`)
      }
    }
    TEX.metal.metal = load('metal/metalness.jpg')
    makeCurtain()
  })
}

// normal-map emphasis + fallbacks (scalar roughness only used when no map)
const SURF_OPTS = {
  plaster: { ns: 1.0 },
  brick: { ns: 1.1 },
  wood: { ns: 1.0 },
  tile: { ns: 1.1 },
  metal: { ns: 1.0 },
  shingle: { ns: 1.1 },
  concrete: { ns: 0.8 },
  stone: { ns: 1.2 },
  curtain: { ns: 0.5, roughness: 0.9 }
}

function getMat (name, rx, ry, ox = 0, oy = 0) {
  const key = `${name}|${rx.toFixed(3)}|${ry.toFixed(3)}|${ox.toFixed(3)}|${oy.toFixed(3)}`
  if (MAT_CACHE.has(key)) return MAT_CACHE.get(key)
  const o = SURF_OPTS[name] || {}
  const t = TEX[name]
  const clone = (tex) => {
    if (!tex) return null
    const c = tex.clone()
    c.repeat.set(rx, ry)
    c.offset.set(ox, oy)
    c.needsUpdate = true
    return c
  }
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfff6ea, // slight warm tint to counter the HDRI's blue ambient
    map: clone(t.map),
    normalMap: clone(t.nrm),
    normalScale: new THREE.Vector2(o.ns || 1, o.ns || 1),
    roughnessMap: t.rough ? clone(t.rough) : null,
    roughness: t.rough ? 1 : (o.roughness !== undefined ? o.roughness : 0.9),
    metalnessMap: t.metal ? clone(t.metal) : null,
    metalness: t.metal ? 1 : 0
  })
  MAT_CACHE.set(key, mat)
  return mat
}

// world size (m) one texture tile covers, per material (photo textures ≈ 1m)
const WALL_TEX_SIZE = { plaster: 1.5, brick: 1.2, wood: 1.2, concrete: 1.5, stone: 1.4 }
const ROOF_TEX_SIZE = { tile: 1.2, metal: 1.0, shingle: 1.2 }

// ---------------------------------------------------------------------------
// shared simple materials
// ---------------------------------------------------------------------------

const trimMat = new THREE.MeshStandardMaterial({ color: 0xf1eee4, roughness: 0.55 })
const darkMat = new THREE.MeshStandardMaterial({ color: 0x0e1114, roughness: 0.9 })
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xcfe0e6,
  metalness: 0,
  roughness: 0.04,
  envMapIntensity: 2.2,
  transparent: true,
  opacity: 0.42
})
const brassMat = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.3 })
const steelMat = new THREE.MeshStandardMaterial({ color: 0x8a8f94, metalness: 0.85, roughness: 0.35 })
const zincMat = new THREE.MeshStandardMaterial({ color: 0xb9bcbe, metalness: 0.8, roughness: 0.35 })

// ---------------------------------------------------------------------------
// house construction
// ---------------------------------------------------------------------------

// house dimensions (meters) — W/D/FLOORS follow the configured footprint
let W = config.width
let D = config.depth
let FLOORS = config.floors
const H = 3.1 // height of one storey
let PLINTH = 0.3 // foundation height / floor level — set from config.foundation
const OVER = 0.5
let EAVE = PLINTH + H * FLOORS

function foundationDef () {
  return FOUNDATIONS.find(f => f.id === config.foundation) || FOUNDATIONS[0]
}

// clone a cached material so a base tint doesn't bleed into other concrete/brick
function tintedMat (name, rx, ry, color, ox = 0, oy = 0) {
  const base = getMat(name, rx, ry, ox, oy)
  if (color == null) return base
  const m = base.clone()
  m.color = new THREE.Color(color)
  return m
}

// resolve the chosen wall finish -> texture + tint + tile size
function wallDef (cfg) {
  return WALLS.find(w => w.id === cfg.wallMaterial) || WALLS[0]
}
function wallTexSize (cfg) {
  return WALL_TEX_SIZE[wallDef(cfg).tex]
}
function wallMat (cfg, rx, ry, ox = 0, oy = 0) {
  const d = wallDef(cfg)
  return tintedMat(d.tex, rx, ry, d.color, ox, oy)
}

function box (w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const winDarkMat = new THREE.MeshStandardMaterial({ color: 0x2b2e31, roughness: 0.5, metalness: 0.2 })

// window recessed into a real wall opening; group origin = outer wall surface,
// +z points out of the wall, internals sink inward (negative z).
// style: classic (white frame + cross muntins) | modern (slim dark, single
// pane) | panoramic (slim dark, one vertical mullion)
function windowUnit (w, h, inner = 'curtain', style = 'classic') {
  const g = new THREE.Group()
  const frameMat = style === 'classic' ? trimMat : winDarkMat
  const t = style === 'classic' ? 0.09 : 0.06 // slimmer frame on modern styles

  // curtains hang just inside the room
  if (inner === 'curtain') {
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.3, h + 0.4), getMat('curtain', (w + 0.3) / 0.8, 1))
    curtain.position.z = -0.34
    g.add(curtain)
  }

  // glass sits deep in the reveal
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.04), glassMat)
  glass.position.z = -0.13
  g.add(glass)

  // muntins / mullions by style
  if (style === 'classic') {
    const mv = box(0.042, h - 0.04, 0.03, frameMat)
    mv.position.z = -0.1
    const mh = box(w - 0.04, 0.042, 0.03, frameMat)
    mh.position.z = -0.1
    g.add(mv, mh)
  } else if (style === 'panoramic') {
    const mv = box(0.05, h - 0.04, 0.03, frameMat)
    mv.position.z = -0.1
    g.add(mv)
  } else if (style === 'large') {
    // one big fixed window split into three panes
    for (const fx of [-w / 6, w / 6]) {
      const mv = box(0.055, h - 0.04, 0.03, frameMat)
      mv.position.set(fx, 0, -0.1)
      g.add(mv)
    }
  } // modern: clean single pane, no bars

  // main frame filling the opening, set back from the facade
  const fd = 0.12
  const top = box(w + 2 * t, t, fd, frameMat)
  top.position.set(0, h / 2 + t / 2, -0.07)
  const bot = box(w + 2 * t, t, fd, frameMat)
  bot.position.set(0, -h / 2 - t / 2, -0.07)
  const left = box(t, h, fd, frameMat)
  left.position.set(-w / 2 - t / 2, 0, -0.07)
  const right = box(t, h, fd, frameMat)
  right.position.set(w / 2 + t / 2, 0, -0.07)
  g.add(top, bot, left, right)

  // sill protruding past the facade, with a drip edge (always light trim)
  const sill = box(w + 2 * t + 0.1, 0.06, 0.3, trimMat)
  sill.position.set(0, -h / 2 - t - 0.03, -0.03)
  const drip = box(w + 2 * t + 0.04, 0.03, 0.05, trimMat)
  drip.position.set(0, -h / 2 - t - 0.075, 0.1)
  g.add(sill, drip)
  return g
}

// floor-to-ceiling window wall (ვიტრაჟი) — slim dark curtain-wall frame,
// vertical mullions every ~1m, flush with the facade (no sill)
function glassWallUnit (w, h) {
  const g = new THREE.Group()
  const t = 0.06
  const fd = 0.12

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.04), glassMat)
  glass.position.z = -0.13
  g.add(glass)

  // perimeter frame
  const top = box(w + 2 * t, t, fd, winDarkMat)
  top.position.set(0, h / 2 + t / 2, -0.07)
  const bot = box(w + 2 * t, t, fd, winDarkMat)
  bot.position.set(0, -h / 2 - t / 2, -0.07)
  const left = box(t, h, fd, winDarkMat)
  left.position.set(-w / 2 - t / 2, 0, -0.07)
  const right = box(t, h, fd, winDarkMat)
  right.position.set(w / 2 + t / 2, 0, -0.07)
  g.add(top, bot, left, right)

  // vertical mullions
  const panes = Math.max(2, Math.round(w / 1.05))
  for (let i = 1; i < panes; i++) {
    const mv = box(0.055, h - 0.04, 0.03, winDarkMat)
    mv.position.set(-w / 2 + (w / panes) * i, 0, -0.1)
    g.add(mv)
  }
  // one horizontal transom for scale
  const mh = box(w - 0.04, 0.05, 0.03, winDarkMat)
  mh.position.set(0, h / 2 - 0.75, -0.1)
  g.add(mh)
  return g
}

// door recessed into a real wall opening; group origin = outer wall surface
function doorUnit (style) {
  const g = new THREE.Group()
  const w = 1.05
  const h = 2.15
  const t = 0.1
  const top = box(w + 2 * t, t, 0.16, trimMat)
  top.position.set(0, h + t / 2, -0.09)
  const left = box(t, h, 0.16, trimMat)
  left.position.set(-w / 2 - t / 2, h / 2, -0.09)
  const right = box(t, h, 0.16, trimMat)
  right.position.set(w / 2 + t / 2, h / 2, -0.09)
  g.add(top, left, right)

  if (style === 'wood') {
    const slab = box(w, h, 0.08, getMat('wood', 0.5, 1))
    slab.material.color.setHex(0xe8b87c) // warm oak tint over the gray planks scan
    slab.position.set(0, h / 2, -0.13)
    g.add(slab)
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x54391f, roughness: 0.75 })
    const p1 = box(w - 0.3, h * 0.36, 0.02, panelMat)
    p1.position.set(0, h * 0.66, -0.085)
    const p2 = box(w - 0.3, h * 0.36, 0.02, panelMat)
    p2.position.set(0, h * 0.24, -0.085)
    g.add(p1, p2)
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), brassMat)
    knob.position.set(w / 2 - 0.12, h * 0.47, -0.04)
    knob.castShadow = true
    g.add(knob)
  } else if (style === 'glass') {
    // mostly-glass modern entry: slim dark frame around a big glass pane
    const frame = box(w, h, 0.08, new THREE.MeshStandardMaterial({ color: 0x2b2e31, roughness: 0.4, metalness: 0.3 }))
    frame.position.set(0, h / 2, -0.13)
    g.add(frame)
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.16, h - 0.18), glassMat)
    pane.position.set(0, h / 2, -0.085)
    g.add(pane)
    const handle = box(0.04, 0.9, 0.05, steelMat)
    handle.position.set(w / 2 - 0.12, h / 2, -0.03)
    g.add(handle)
  } else {
    const slab = box(w, h, 0.08, new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: 0.4, metalness: 0.25 }))
    slab.position.set(0, h / 2, -0.13)
    g.add(slab)
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.16, h - 0.3), glassMat)
    strip.position.set(-w / 2 + 0.18, h / 2, -0.08)
    g.add(strip)
    const handle = box(0.035, 0.7, 0.05, steelMat)
    handle.position.set(w / 2 - 0.14, h / 2, -0.04)
    g.add(handle)
  }

  // canopy
  const canopy = box(w + 0.7, 0.09, 0.95, trimMat)
  canopy.position.set(0, h + t + 0.12, 0.3)
  g.add(canopy)

  // wall lamp beside the door
  const lampArm = box(0.05, 0.2, 0.06, steelMat)
  lampArm.position.set(w / 2 + 0.45, h * 0.82, 0.04)
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff3d8, emissive: 0xffc873, emissiveIntensity: 1.6, roughness: 0.4 })
  )
  bulb.position.set(w / 2 + 0.45, h * 0.82 - 0.14, 0.06)
  g.add(lampArm, bulb)

  // steps down to the ground — count adapts to the foundation height so a
  // raised cottage base gets a proper flight and a low modern base gets one
  const nSteps = Math.max(1, Math.round(PLINTH / 0.17))
  const stepH = PLINTH / nSteps
  for (let i = 0; i < nSteps; i++) {
    const s = box(w + 0.5 + i * 0.12, stepH + 0.015, 0.4 + i * 0.18, getMat('concrete', 1, 0.4))
    s.position.set(0, -(i + 0.5) * stepH, 0.22 + i * 0.09)
    g.add(s)
  }
  const doormat = box(0.85, 0.02, 0.5, new THREE.MeshStandardMaterial({ color: 0x3a352c, roughness: 1 }))
  doormat.position.set(0, 0.012, 0.28)
  g.add(doormat)
  g.traverse(o => { if (o.isMesh) o.userData.editGroup = 'doorStyle' })
  return g
}

// custom hip roof geometry (uvs in world meters, scaled by texture size)
function hipRoofGeo (hw, hd, y0, rh, texSize) {
  const rx = Math.max(0.4, hw - hd)
  const y1 = y0 + rh
  const slopeF = Math.hypot(hd, rh)
  const slopeH = Math.hypot(hw - rx, rh)
  const s = 1 / texSize
  const pos = []
  const uv = []
  const idx = []
  let vi = 0
  const quad = (a, b, c, d, us) => {
    pos.push(...a, ...b, ...c, ...d)
    uv.push(...us)
    idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3)
    vi += 4
  }
  const tri = (a, b, c, us) => {
    pos.push(...a, ...b, ...c)
    uv.push(...us)
    idx.push(vi, vi + 1, vi + 2)
    vi += 3
  }
  quad([-hw, y0, hd], [hw, y0, hd], [rx, y1, 0], [-rx, y1, 0],
    [-hw * s, 0, hw * s, 0, rx * s, slopeF * s, -rx * s, slopeF * s])
  quad([hw, y0, -hd], [-hw, y0, -hd], [-rx, y1, 0], [rx, y1, 0],
    [-hw * s, 0, hw * s, 0, rx * s, slopeF * s, -rx * s, slopeF * s])
  tri([-hw, y0, -hd], [-hw, y0, hd], [-rx, y1, 0],
    [-hd * s, 0, hd * s, 0, 0, slopeH * s])
  tri([hw, y0, hd], [hw, y0, -hd], [rx, y1, 0],
    [-hd * s, 0, hd * s, 0, 0, slopeH * s])
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return { geo, rx, y1 }
}

// steep four-sided lower band of a mansard roof (frustum; uvs in world meters)
function mansardRoofGeo (hw, hd, y0, h1, inset, texSize) {
  const iw = hw - inset
  const id = hd - inset
  const y1 = y0 + h1
  const slant = Math.hypot(inset, h1)
  const s = 1 / texSize
  const pos = []
  const uv = []
  const idx = []
  let vi = 0
  const quad = (a, b, c, d, us) => {
    pos.push(...a, ...b, ...c, ...d)
    uv.push(...us)
    idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3)
    vi += 4
  }
  quad([-hw, y0, hd], [hw, y0, hd], [iw, y1, id], [-iw, y1, id],
    [-hw * s, 0, hw * s, 0, iw * s, slant * s, -iw * s, slant * s])
  quad([hw, y0, -hd], [-hw, y0, -hd], [-iw, y1, -id], [iw, y1, -id],
    [-hw * s, 0, hw * s, 0, iw * s, slant * s, -iw * s, slant * s])
  quad([-hw, y0, -hd], [-hw, y0, hd], [-iw, y1, id], [-iw, y1, -id],
    [-hd * s, 0, hd * s, 0, id * s, slant * s, -id * s, slant * s])
  quad([hw, y0, hd], [hw, y0, -hd], [iw, y1, -id], [iw, y1, id],
    [-hd * s, 0, hd * s, 0, id * s, slant * s, -id * s, slant * s])
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return { geo, iw, id, y1 }
}

// rounded ridge cap; the flat cylinder ends get a solid matching color —
// a textured end cap renders as an ugly stretched star
const RIDGE_END_COLOR = { tile: 0x6d3419, metal: 0x6f7477, shingle: 0x2f2f2d }

function ridgeCap (cfg, length, texSize) {
  const endMat = new THREE.MeshStandardMaterial({
    color: RIDGE_END_COLOR[cfg.roofMaterial] || 0x555250,
    roughness: 0.85,
    metalness: cfg.roofMaterial === 'metal' ? 0.6 : 0
  })
  // slight overhang past the roof ends — real ridge tiles do, and coplanar
  // ends would z-fight with the slope slabs
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, length + 0.04, 12),
    [getMat(cfg.roofMaterial, 1, length / texSize), endMat, endMat]
  )
  cap.castShadow = true
  return cap
}

function gutterRun (length) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, length, 12), zincMat)
  m.castShadow = true
  return m
}

function downspout (x, z) {
  const g = new THREE.Group()
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, EAVE - 0.1, 10), zincMat)
  pipe.position.set(x, (EAVE - 0.1) / 2, z)
  pipe.castShadow = true
  g.add(pipe)
  return g
}

function buildRoof (cfg) {
  const g = new THREE.Group()
  const texSize = ROOF_TEX_SIZE[cfg.roofMaterial]
  const hw = W / 2 + OVER
  const hd = D / 2 + OVER
  const chX = W * 0.27
  const chZ = -D * 0.19
  let chPeak = 0 // roof height above EAVE at the chimney spot

  // slope slab used by gable/gambrel/skillion — box with roof material on top
  const slopeSlab = (len, depth, ang, midX, midY) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.13, depth),
      [trimMat, trimMat, getMat(cfg.roofMaterial, len / texSize, depth / texSize), trimMat, trimMat, trimMat]
    )
    m.castShadow = true
    m.receiveShadow = true
    m.rotation.z = ang
    m.position.set(midX, midY, 0)
    return m
  }

  if (cfg.roofType === 'gable') {
    const rh = hw * 0.43
    const angle = Math.atan2(rh, hw)
    const slopeLen = Math.hypot(hw, rh) + 0.15
    const depth = D + 2 * OVER
    const topMat = getMat(cfg.roofMaterial, slopeLen / texSize, depth / texSize)
    const mats = [trimMat, trimMat, topMat, trimMat, trimMat, trimMat]
    const left = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.13, depth), mats)
    left.castShadow = true
    left.receiveShadow = true
    left.rotation.z = angle
    left.position.set(-hw / 2, EAVE + rh / 2, 0)
    const right = left.clone()
    right.rotation.z = -angle
    right.position.x = hw / 2
    g.add(left, right)
    const cap = ridgeCap(cfg, depth, texSize)
    cap.rotation.x = Math.PI / 2
    cap.position.set(0, EAVE + rh + 0.02, 0)
    g.add(cap)
    // gable-end wall triangles
    const shape = new THREE.Shape()
    shape.moveTo(-W / 2, 0)
    shape.lineTo(W / 2, 0)
    shape.lineTo(0, rh)
    shape.closePath()
    const wts = wallTexSize(cfg)
    const prism = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: D - 0.02, bevelEnabled: false }),
      wallMat(cfg, 1 / wts, 1 / wts)
    )
    prism.castShadow = true
    prism.receiveShadow = true
    prism.position.set(0, EAVE, -D / 2 + 0.01)
    prism.userData.editGroup = 'wallMaterial'
    g.add(prism)
    // gutters on the two eave sides + downspouts
    const g1 = gutterRun(depth - 0.1)
    g1.rotation.x = Math.PI / 2
    g1.position.set(hw + 0.03, EAVE - 0.01, 0)
    const g2 = g1.clone()
    g2.position.x = -hw - 0.03
    g.add(g1, g2)
    g.add(downspout(hw + 0.03, hd - 0.25))
    g.add(downspout(-hw - 0.03, -hd + 0.25))
    chPeak = rh * Math.max(0, 1 - Math.abs(chX) / hw)
  } else if (cfg.roofType === 'hip') {
    const rh = Math.max(1.2, hd * 0.5)
    const { geo, rx, y1 } = hipRoofGeo(hw, hd, EAVE, rh, texSize)
    const roof = new THREE.Mesh(geo, getMat(cfg.roofMaterial, 1, 1))
    roof.castShadow = true
    roof.receiveShadow = true
    g.add(roof)
    const cap = ridgeCap(cfg, rx * 2 + 0.3, texSize)
    cap.rotation.z = Math.PI / 2
    cap.position.set(0, y1 + 0.02, 0)
    g.add(cap)
    const fh = 0.17
    const f1 = box(W + 2 * OVER + 0.06, fh, 0.06, trimMat)
    f1.position.set(0, EAVE + 0.02, hd)
    const f2 = f1.clone()
    f2.position.z = -hd
    const f3 = box(0.06, fh, D + 2 * OVER + 0.06, trimMat)
    f3.position.set(hw, EAVE + 0.02, 0)
    const f4 = f3.clone()
    f4.position.x = -hw
    g.add(f1, f2, f3, f4)
    // gutters front/back + downspouts
    const g1 = gutterRun(W + 2 * OVER - 0.1)
    g1.rotation.z = Math.PI / 2
    g1.position.set(0, EAVE - 0.03, hd + 0.05)
    const g2 = g1.clone()
    g2.position.z = -hd - 0.05
    g.add(g1, g2)
    g.add(downspout(hw - 0.2, hd + 0.05))
    g.add(downspout(-hw + 0.2, -hd - 0.05))
    chPeak = rh * Math.max(0, Math.min((hd - Math.abs(chZ)) / hd, (hw - Math.abs(chX)) / hd, 1))
  } else if (cfg.roofType === 'gambrel') {
    // classic barn profile — steep lower slopes breaking into shallow upper ones
    const rh = hw * 0.78
    const bx = hw * 0.48 // break point x
    const bh = rh * 0.72 // break height
    const depth = D + 2 * OVER
    const lowLen = Math.hypot(hw - bx, bh) + 0.12
    const lowAng = Math.atan2(bh, hw - bx)
    const upLen = Math.hypot(bx, rh - bh) + 0.12
    const upAng = Math.atan2(rh - bh, bx)
    g.add(slopeSlab(lowLen, depth, lowAng, -(hw + bx) / 2, EAVE + bh / 2))
    g.add(slopeSlab(lowLen, depth, -lowAng, (hw + bx) / 2, EAVE + bh / 2))
    g.add(slopeSlab(upLen, depth, upAng, -bx / 2, EAVE + bh + (rh - bh) / 2))
    g.add(slopeSlab(upLen, depth, -upAng, bx / 2, EAVE + bh + (rh - bh) / 2))
    const cap = ridgeCap(cfg, depth, texSize)
    cap.rotation.x = Math.PI / 2
    cap.position.set(0, EAVE + rh + 0.02, 0)
    g.add(cap)
    const bt1 = box(0.16, 0.1, depth, trimMat)
    bt1.position.set(-bx, EAVE + bh + 0.04, 0)
    const bt2 = bt1.clone()
    bt2.position.x = bx
    g.add(bt1, bt2)
    // gambrel gable ends
    const shape = new THREE.Shape()
    shape.moveTo(-W / 2, 0)
    shape.lineTo(W / 2, 0)
    shape.lineTo(bx, bh)
    shape.lineTo(0, rh)
    shape.lineTo(-bx, bh)
    shape.closePath()
    const wts = wallTexSize(cfg)
    const prism = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: D - 0.02, bevelEnabled: false }),
      wallMat(cfg, 1 / wts, 1 / wts)
    )
    prism.castShadow = true
    prism.receiveShadow = true
    prism.position.set(0, EAVE, -D / 2 + 0.01)
    prism.userData.editGroup = 'wallMaterial'
    g.add(prism)
    const g1 = gutterRun(depth - 0.1)
    g1.rotation.x = Math.PI / 2
    g1.position.set(hw + 0.03, EAVE - 0.01, 0)
    const g2 = g1.clone()
    g2.position.x = -hw - 0.03
    g.add(g1, g2)
    g.add(downspout(hw + 0.03, hd - 0.25))
    g.add(downspout(-hw - 0.03, -hd + 0.25))
    chPeak = Math.abs(chX) < bx
      ? bh + (rh - bh) * (1 - Math.abs(chX) / bx)
      : bh * Math.max(0, (hw - Math.abs(chX)) / (hw - bx))
  } else if (cfg.roofType === 'mansard') {
    // classic mansard — steep band all around with a low deck on top
    const h1 = 1.7
    const inset = Math.min(1.15, hd - 1)
    const { geo, iw, id, y1 } = mansardRoofGeo(hw, hd, EAVE, h1, inset, texSize)
    const band = new THREE.Mesh(geo, getMat(cfg.roofMaterial, 1, 1))
    band.castShadow = true
    band.receiveShadow = true
    g.add(band)
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(iw * 2 + 0.24, 0.14, id * 2 + 0.24),
      [trimMat, trimMat, getMat(cfg.roofMaterial, iw * 2 / texSize, id * 2 / texSize), trimMat, trimMat, trimMat]
    )
    deck.castShadow = true
    deck.receiveShadow = true
    deck.position.set(0, y1 + 0.05, 0)
    g.add(deck)
    const fh = 0.17
    const f1 = box(W + 2 * OVER + 0.06, fh, 0.06, trimMat)
    f1.position.set(0, EAVE + 0.02, hd)
    const f2 = f1.clone()
    f2.position.z = -hd
    const f3 = box(0.06, fh, D + 2 * OVER + 0.06, trimMat)
    f3.position.set(hw, EAVE + 0.02, 0)
    const f4 = f3.clone()
    f4.position.x = -hw
    g.add(f1, f2, f3, f4)
    const g1 = gutterRun(W + 2 * OVER - 0.1)
    g1.rotation.z = Math.PI / 2
    g1.position.set(0, EAVE - 0.03, hd + 0.05)
    const g2 = g1.clone()
    g2.position.z = -hd - 0.05
    g.add(g1, g2)
    g.add(downspout(hw - 0.2, hd + 0.05))
    g.add(downspout(-hw + 0.2, -hd - 0.05))
    chPeak = h1 + 0.2
  } else if (cfg.roofType === 'skillion') {
    // modern mono-pitch — one plane rising to the right
    const span = 2 * hw
    const rise = span * 0.18
    const len = Math.hypot(span, rise) + 0.1
    const ang = Math.atan2(rise, span)
    const depth = D + 2 * OVER
    g.add(slopeSlab(len, depth, ang, 0, EAVE + rise / 2 + 0.04))
    // wedge filling the wall top under the slope
    const yAt = x => Math.max(0.02, rise * ((x + hw) / span) - 0.05)
    const shape = new THREE.Shape()
    shape.moveTo(-W / 2, 0)
    shape.lineTo(W / 2, 0)
    shape.lineTo(W / 2, yAt(W / 2))
    shape.lineTo(-W / 2, yAt(-W / 2))
    shape.closePath()
    const wts = wallTexSize(cfg)
    const wedge = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: D - 0.02, bevelEnabled: false }),
      wallMat(cfg, 1 / wts, 1 / wts)
    )
    wedge.castShadow = true
    wedge.receiveShadow = true
    wedge.position.set(0, EAVE, -D / 2 + 0.01)
    wedge.userData.editGroup = 'wallMaterial'
    g.add(wedge)
    // gutter on the low side only
    const g1 = gutterRun(depth - 0.1)
    g1.rotation.x = Math.PI / 2
    g1.position.set(-hw - 0.03, EAVE + 0.02, 0)
    g.add(g1)
    g.add(downspout(-hw - 0.03, -hd + 0.25))
    chPeak = rise * ((chX + hw) / span)
  } else {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(W + 0.4, 0.35, D + 0.4),
      [trimMat, trimMat, getMat(cfg.roofMaterial, W / texSize, D / texSize), trimMat, trimMat, trimMat]
    )
    slab.castShadow = true
    slab.receiveShadow = true
    slab.position.set(0, EAVE + 0.175, 0)
    g.add(slab)
    const ph = 0.28
    const p1 = box(W + 0.5, ph, 0.12, trimMat)
    p1.position.set(0, EAVE + 0.35 + ph / 2 - 0.08, D / 2 + 0.19)
    const p2 = p1.clone()
    p2.position.z = -(D / 2 + 0.19)
    const p3 = box(0.12, ph, D + 0.5, trimMat)
    p3.position.set(W / 2 + 0.19, EAVE + 0.35 + ph / 2 - 0.08, 0)
    const p4 = p3.clone()
    p4.position.x = -(W / 2 + 0.19)
    g.add(p1, p2, p3, p4)
  }

  if (cfg.roofType !== 'flat') {
    const chTop = EAVE + Math.max(2.35, chPeak + 0.5)
    const ch = box(0.55, chTop - EAVE + 0.6, 0.55, getMat('brick', 0.28, 1))
    ch.position.set(chX, EAVE + (chTop - EAVE + 0.6) / 2 - 0.6, chZ)
    const cap = box(0.72, 0.09, 0.72, getMat('concrete', 0.4, 0.4))
    cap.position.set(chX, chTop + 0.05, chZ)
    const hole = box(0.3, 0.1, 0.3, darkMat)
    hole.position.set(chX, chTop + 0.11, chZ)
    g.add(ch, cap, hole)
  }
  // anything not explicitly tagged (slopes, caps, gutters…) edits the roof material
  g.traverse(o => {
    if (o.isMesh && !o.userData.editGroup) o.userData.editGroup = 'roofMaterial'
  })
  return g
}

// ---------------------------------------------------------------------------
// add-on blocks: garage, side extension, terrace
// ---------------------------------------------------------------------------

const GARAGE_W = 3.4
const EXT_W = 3.0

function buildGarage (cfg) {
  const g = new THREE.Group()
  const gh = 2.7
  const gd = Math.min(5.6, D)
  const cx = W / 2 + GARAGE_W / 2 - 0.02
  const cz = D / 2 - gd / 2

  const plinth = box(GARAGE_W + 0.1, PLINTH + 0.1, gd + 0.1, getMat('concrete', GARAGE_W / 2, 0.3))
  plinth.position.set(cx, (PLINTH + 0.1) / 2 - 0.1, cz)
  g.add(plinth)

  const ts = wallTexSize(cfg)
  const walls = box(GARAGE_W, gh, gd, wallMat(cfg, GARAGE_W / ts, gh / ts))
  walls.position.set(cx, PLINTH + gh / 2, cz)
  g.add(walls)

  // flat roof slab with the house's roof material on top
  const texSize = ROOF_TEX_SIZE[cfg.roofMaterial]
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(GARAGE_W + 0.35, 0.16, gd + 0.35),
    [trimMat, trimMat, getMat(cfg.roofMaterial, GARAGE_W / texSize, gd / texSize), trimMat, trimMat, trimMat]
  )
  roof.castShadow = true
  roof.receiveShadow = true
  roof.position.set(cx, PLINTH + gh + 0.08, cz)
  g.add(roof)

  // sectional garage door — horizontal slats in a frame
  const dw = Math.min(2.6, GARAGE_W - 0.6)
  const dh = 2.1
  const doorZ = D / 2 + 0.02
  const frameT = 0.09
  const fTop = box(dw + 2 * frameT, frameT, 0.14, trimMat)
  fTop.position.set(cx, PLINTH + dh + frameT / 2, doorZ)
  const fL = box(frameT, dh, 0.14, trimMat)
  fL.position.set(cx - dw / 2 - frameT / 2, PLINTH + dh / 2, doorZ)
  const fR = box(frameT, dh, 0.14, trimMat)
  fR.position.set(cx + dw / 2 + frameT / 2, PLINTH + dh / 2, doorZ)
  g.add(fTop, fL, fR)
  const slatMat = new THREE.MeshStandardMaterial({ color: 0xd9d6cc, roughness: 0.55, metalness: 0.15 })
  const slats = 6
  const slatH = dh / slats
  for (let i = 0; i < slats; i++) {
    const slat = box(dw, slatH - 0.025, 0.06, slatMat)
    slat.position.set(cx, PLINTH + slatH * i + slatH / 2, doorZ)
    g.add(slat)
  }

  // driveway
  const drive = box(GARAGE_W - 0.2, 0.05, 3.6, getMat('concrete', 1, 1.2))
  drive.position.set(cx, 0.02, D / 2 + 1.8)
  g.add(drive)
  g.traverse(o => { if (o.isMesh) o.userData.editGroup = 'garage' })
  return g
}

function buildExtension (cfg) {
  const g = new THREE.Group()
  const storeys = cfg.addons.extension.storeys
  const eh = H * storeys - 0.35 // stays just below the main eave line
  const ed = Math.max(3, D * 0.65)
  const cx = -(W / 2 + EXT_W / 2) + 0.02
  const cz = D / 2 - ed / 2

  const plinth = box(EXT_W + 0.1, PLINTH + 0.1, ed + 0.1, getMat('concrete', EXT_W / 2, 0.3))
  plinth.position.set(cx, (PLINTH + 0.1) / 2 - 0.1, cz)
  g.add(plinth)

  const ts = wallTexSize(cfg)
  const walls = box(EXT_W, eh, ed, wallMat(cfg, EXT_W / ts, eh / ts))
  walls.position.set(cx, PLINTH + eh / 2, cz)
  g.add(walls)

  const texSize = ROOF_TEX_SIZE[cfg.roofMaterial]
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(EXT_W + 0.35, 0.16, ed + 0.35),
    [trimMat, trimMat, getMat(cfg.roofMaterial, EXT_W / texSize, ed / texSize), trimMat, trimMat, trimMat]
  )
  roof.castShadow = true
  roof.receiveShadow = true
  roof.position.set(cx, PLINTH + eh + 0.08, cz)
  g.add(roof)

  // one front window per storey + cornice bands between storeys
  for (let s = 0; s < storeys; s++) {
    const win = windowUnit(1.2, 1.3, 'curtain', cfg.windowStyle)
    win.position.set(cx, PLINTH + H * s + 1.55, D / 2 + 0.02)
    g.add(win)
    if (s > 0) {
      const band = box(EXT_W + 0.08, 0.12, ed + 0.08, trimMat)
      band.position.set(cx, PLINTH + H * s, cz)
      g.add(band)
    }
  }
  g.traverse(o => { if (o.isMesh) o.userData.editGroup = 'extension' })
  return g
}

// railing helper: top rail + posts along one edge (axis 'x' or 'z')
function railing (length, axis, cx, cz, yBase, height) {
  const g = new THREE.Group()
  const rail = box(axis === 'x' ? length : 0.06, 0.06, axis === 'x' ? 0.06 : length, trimMat)
  rail.position.set(cx, yBase + height, cz)
  g.add(rail)
  const posts = Math.max(2, Math.round(length / 1.1))
  for (let i = 0; i <= posts; i++) {
    const t = -length / 2 + (length / posts) * i
    const post = box(0.05, height, 0.05, trimMat)
    post.position.set(axis === 'x' ? cx + t : cx, yBase + height / 2, axis === 'x' ? cz : cz + t)
    g.add(post)
  }
  return g
}

// width of the terrace access door by type
const TERRACE_DOOR_W = { single: 1.0, french: 1.8, sliding: 2.6 }

// shared terrace footprint so the deck and its access door line up
function terraceGeom (cfg) {
  const dw = TERRACE_DOOR_W[cfg.terraceDoor] || 1.8
  const td = 2.5
  const tw = Math.max(dw + 1.4, Math.min(W * 0.55, 5))
  let cx = W * 0.27
  cx = Math.max(-W / 2 + tw / 2 + 0.2, Math.min(W / 2 - tw / 2 - 0.2, cx))
  const cz = D / 2 + td / 2 - 0.1
  const deckTop = Math.min(PLINTH, 0.32)
  return { dw, tw, td, cx, cz, deckTop }
}

// terrace access door set into the front wall; recessed like a window
function terraceDoorUnit (cfg) {
  const g = new THREE.Group()
  const dw = TERRACE_DOOR_W[cfg.terraceDoor] || 1.8
  const style = cfg.terraceDoor
  const h = 2.15
  const t = 0.07
  const zf = -0.07

  const top = box(dw + 2 * t, t, 0.12, winDarkMat)
  top.position.set(0, h + t / 2, zf)
  const left = box(t, h, 0.12, winDarkMat)
  left.position.set(-dw / 2 - t / 2, h / 2, zf)
  const right = box(t, h, 0.12, winDarkMat)
  right.position.set(dw / 2 + t / 2, h / 2, zf)
  const sill = box(dw + 2 * t + 0.08, 0.06, 0.18, trimMat)
  sill.position.set(0, 0.03, -0.01)
  g.add(top, left, right, sill)

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(dw - 0.05, h - 0.08), glassMat)
  glass.position.set(0, h / 2, -0.11)
  g.add(glass)

  if (style === 'single') {
    const handle = box(0.03, 0.5, 0.05, steelMat)
    handle.position.set(dw / 2 - 0.12, h * 0.5, -0.05)
    g.add(handle)
  } else {
    // french & sliding both read as two leaves split by a centre mullion
    const mull = box(0.06, h - 0.04, 0.05, winDarkMat)
    mull.position.set(0, h / 2, -0.09)
    g.add(mull)
    const hOff = style === 'sliding' ? dw * 0.26 : 0.16
    const hl = box(0.03, 0.42, 0.05, steelMat)
    hl.position.set(-hOff, h * 0.5, -0.05)
    const hr = box(0.03, 0.42, 0.05, steelMat)
    hr.position.set(hOff, h * 0.5, -0.05)
    g.add(hl, hr)
  }

  g.traverse(o => { if (o.isMesh) o.userData.editGroup = 'terrace' })
  return g
}

// ground terrace along the front, with variations: open deck, covered
// (deck + posts + roof), or glazed veranda (covered + glass walls)
function buildTerrace (cfg) {
  const kind = cfg.terrace
  if (!kind || kind === 'none') return null
  const g = new THREE.Group()

  const geom = terraceGeom(cfg)
  const tw = geom.tw
  const td = geom.td
  const cx = geom.cx
  const cz = geom.cz
  const deckTop = geom.deckTop
  const deckH = 0.16

  // deck slab
  const deck = box(tw, deckH, td, getMat('wood', tw / 1.4, td / 1.4))
  deck.position.set(cx, deckTop - deckH / 2, cz)
  g.add(deck)

  // a step down at the front edge
  const step = box(tw * 0.5, deckH, 0.4, getMat('concrete', 1, 0.5))
  step.position.set(cx, deckTop - deckH * 1.5, cz + td / 2 + 0.1)
  g.add(step)

  const railH = 0.9
  const fz = cz + td / 2 - 0.05 // front edge
  const lx = cx - tw / 2 + 0.05 // left edge
  const rx = cx + tw / 2 - 0.05 // right edge

  if (kind === 'open') {
    // railing on the three outer edges, open toward the house
    g.add(railing(tw, 'x', cx, fz, deckTop, railH))
    g.add(railing(td, 'z', rx, cz, deckTop, railH))
    g.add(railing(td, 'z', lx, cz, deckTop, railH))
  } else {
    // covered + glazed both get corner posts and a roof
    const postTop = deckTop + 2.5
    const postH = postTop - deckTop
    const corners = [[lx, fz], [rx, fz], [lx, cz - td / 2 + 0.05], [rx, cz - td / 2 + 0.05]]
    for (const [px, pz] of corners) {
      const post = box(0.12, postH, 0.12, trimMat)
      post.position.set(px, deckTop + postH / 2, pz)
      g.add(post)
    }
    // flat roof in the house roof material
    const texSize = ROOF_TEX_SIZE[cfg.roofMaterial]
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(tw + 0.3, 0.16, td + 0.3),
      [trimMat, trimMat, getMat(cfg.roofMaterial, tw / texSize, td / texSize), trimMat, trimMat, trimMat]
    )
    roof.position.set(cx, postTop + 0.08, cz)
    g.add(roof)

    if (kind === 'covered') {
      // low railing between the posts on the outer edges
      g.add(railing(tw, 'x', cx, fz, deckTop, railH))
      g.add(railing(td, 'z', rx, cz, deckTop, railH))
      g.add(railing(td, 'z', lx, cz, deckTop, railH))
    } else {
      // glazed: full-height glass on the three outer sides
      const glassPane = (w, axis, gx, gz) => {
        const geo = axis === 'x' ? new THREE.PlaneGeometry(w, postH - 0.1) : new THREE.PlaneGeometry(w, postH - 0.1)
        const pane = new THREE.Mesh(geo, glassMat)
        if (axis === 'z') pane.rotation.y = Math.PI / 2
        pane.position.set(gx, deckTop + postH / 2, gz)
        g.add(pane)
        // low wall base under the glass
        const base = box(axis === 'x' ? w : 0.1, 0.5, axis === 'x' ? 0.1 : w, trimMat)
        base.position.set(gx, deckTop + 0.25, gz)
        g.add(base)
      }
      glassPane(tw, 'x', cx, fz)
      glassPane(td, 'z', rx, cz)
      glassPane(td, 'z', lx, cz)
    }
  }

  g.traverse(o => { if (o.isMesh) o.userData.editGroup = 'terrace' })
  return g
}

// wall slab assembled from segments around real openings; local coords:
// u along the wall (-L/2..L/2), v up from 0, thickness WALL_T centered on z=0.
// Per-segment UV offsets keep the texture continuous across segments.
const WALL_T = 0.35
const interiorMat = new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 1, side: THREE.BackSide })

function wallWithOpenings (cfg, L, height, openings) {
  const ts = wallTexSize(cfg)
  const g = new THREE.Group()
  const seg = (u0, u1, v0, v1) => {
    if (u1 - u0 < 0.02 || v1 - v0 < 0.02) return
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(u1 - u0, v1 - v0, WALL_T),
      wallMat(cfg, (u1 - u0) / ts, (v1 - v0) / ts, (u0 + L / 2) / ts, v0 / ts)
    )
    m.position.set((u0 + u1) / 2, (v0 + v1) / 2, 0)
    m.castShadow = true
    m.receiveShadow = true
    m.userData.editGroup = 'wallMaterial'
    g.add(m)
  }
  const ops = [...openings].sort((a, b) => a.u0 - b.u0)
  let cursor = -L / 2
  for (const o of ops) {
    seg(cursor, o.u0, 0, height)
    seg(o.u0, o.u1, 0, o.v0)
    seg(o.u0, o.u1, o.v1, height)
    cursor = o.u1
  }
  seg(cursor, L / 2, 0, height)
  return g
}

function buildHouse (cfg) {
  const g = new THREE.Group()
  const wallH = H * FLOORS

  const fnd = foundationDef()
  const fMat = tintedMat(fnd.mat, W / 1.5, PLINTH / 1.5, fnd.color)
  const plinth = box(W + fnd.over * 2, PLINTH + 0.1, D + fnd.over * 2, fMat)
  plinth.position.y = (PLINTH + 0.1) / 2 - 0.1
  plinth.userData.editGroup = 'foundation'
  g.add(plinth)

  // dark interior shell seen through the window/door openings — must sit just
  // inside the wall cavity, or rays through a window hit lit wall backs instead
  const interior = new THREE.Mesh(
    new THREE.BoxGeometry(W - 2 * WALL_T - 0.02, wallH - 0.04, D - 2 * WALL_T - 0.02),
    interiorMat
  )
  interior.position.y = PLINTH + wallH / 2
  g.add(interior)

  // collect openings per wall + the units that fill them
  const units = new THREE.Group()
  const frontOps = []
  const backOps = []
  const leftOps = []
  const rightOps = []
  const opening = (list, u, v, w, h) => list.push({
    u0: u - (w + 0.18) / 2,
    u1: u + (w + 0.18) / 2,
    v0: v - (h + 0.18) / 2,
    v1: v + (h + 0.18) / 2
  })

  // front door
  const doorX = -W * 0.3
  frontOps.push({ u0: doorX - 0.63, u1: doorX + 0.63, v0: 0, v1: 2.26 })
  const door = doorUnit(cfg.doorStyle)
  door.position.set(doorX, PLINTH, D / 2)
  units.add(door)

  // terrace access door in the front wall, aligned with the terrace deck
  let terraceDoorSpan = null
  if (cfg.terrace !== 'none') {
    const tg = terraceGeom(cfg)
    terraceDoorSpan = [tg.cx - tg.dw / 2 - 0.4, tg.cx + tg.dw / 2 + 0.4]
    frontOps.push({ u0: tg.cx - tg.dw / 2 - 0.09, u1: tg.cx + tg.dw / 2 + 0.09, v0: 0, v1: 2.32 })
    const td = terraceDoorUnit(cfg)
    td.position.set(tg.cx, PLINTH, D / 2)
    units.add(td)
  }

  for (let f = 0; f < FLOORS; f++) {
    const yOff = PLINTH + H * f

    // front row — above the door only on upper storeys
    let fronts = []
    if (f > 0) fronts.push([-W * 0.3, 'curtain'])
    if (W >= 7) fronts.push([W * 0.07, 'dark'])
    fronts.push([W * 0.33, 'curtain'])
    // on the ground floor, drop any window the terrace door would overlap
    if (f === 0 && terraceDoorSpan) {
      fronts = fronts.filter(([x]) => x < terraceDoorSpan[0] || x > terraceDoorSpan[1])
    }
    for (const [x, inner] of fronts) {
      opening(frontOps, x, H * f + 1.65, 1.5, 1.5)
      const win = windowUnit(1.5, 1.5, inner, cfg.windowStyle)
      win.position.set(x, yOff + 1.65, D / 2)
      units.add(win)
    }

    // side windows — skipped on storeys where a garage/extension attaches
    if (!(f === 0 && cfg.addons.garage)) {
      opening(rightOps, 0, H * f + 1.7, 1.3, 1.4)
      const sw1 = windowUnit(1.3, 1.4, 'curtain', cfg.windowStyle)
      sw1.rotation.y = Math.PI / 2
      sw1.position.set(W / 2, yOff + 1.7, 0)
      units.add(sw1)
    }
    if (!(cfg.addons.extension.on && f < cfg.addons.extension.storeys)) {
      opening(leftOps, 0, H * f + 1.7, 1.3, 1.4)
      const sw2 = windowUnit(1.3, 1.4, 'dark', cfg.windowStyle)
      sw2.rotation.y = -Math.PI / 2
      sw2.position.set(-W / 2, yOff + 1.7, 0)
      units.add(sw2)
    }

    for (const [x, inner] of [[-W * 0.19, 'curtain'], [W * 0.19, 'dark']]) {
      opening(backOps, -x, H * f + 1.7, 1.5, 1.4) // back wall u mirrors world x
      const bw = windowUnit(1.5, 1.4, inner, cfg.windowStyle)
      bw.rotation.y = Math.PI
      bw.position.set(x, yOff + 1.7, -D / 2)
      units.add(bw)
    }

    // cornice band between storeys
    if (f > 0) {
      const band = box(W + 0.1, 0.14, D + 0.1, trimMat)
      band.position.y = yOff
      g.add(band)
    }
  }

  // four wall slabs with the openings cut out
  const front = wallWithOpenings(cfg, W, wallH, frontOps)
  front.position.set(0, PLINTH, D / 2 - WALL_T / 2)
  const back = wallWithOpenings(cfg, W, wallH, backOps)
  back.rotation.y = Math.PI
  back.position.set(0, PLINTH, -(D / 2 - WALL_T / 2))
  const right = wallWithOpenings(cfg, D - 2 * WALL_T, wallH, rightOps)
  right.rotation.y = -Math.PI / 2
  right.position.set(W / 2 - WALL_T / 2, PLINTH, 0)
  const left = wallWithOpenings(cfg, D - 2 * WALL_T, wallH, leftOps)
  left.rotation.y = Math.PI / 2
  left.position.set(-(W / 2 - WALL_T / 2), PLINTH, 0)
  g.add(front, back, right, left, units)

  g.add(buildRoof(cfg))

  // terrace variation (open / covered / glazed)
  const terrace = buildTerrace(cfg)
  if (terrace) g.add(terrace)

  // soft contact shadow sized with the footprint
  g.add(contactShadow())

  return g
}

// ---------------------------------------------------------------------------
// studio floor: invisible shadow catcher + soft contact shadow under the house
// ---------------------------------------------------------------------------

function buildFloor (scene) {
  // no ground catcher — the only shadow is the contact shadow under the house
}

// soft radial gradient hugging the house footprint — grounds it like a product shot
let contactTex = null
function contactShadow () {
  if (!contactTex) {
    const c = makeCanvas(256)
    const ctx = c.getContext('2d')
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128)
    grad.addColorStop(0, 'rgba(30,30,20,0.30)')
    grad.addColorStop(0.55, 'rgba(30,30,20,0.12)')
    grad.addColorStop(1, 'rgba(30,30,20,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 256)
    contactTex = new THREE.CanvasTexture(c)
    contactTex.colorSpace = THREE.SRGBColorSpace
  }
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 2.6, D * 2.6),
    new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false })
  )
  contact.rotation.x = -Math.PI / 2
  contact.position.y = 0.002
  return contact
}

// ---------------------------------------------------------------------------
// configurator panel
// ---------------------------------------------------------------------------

function fmt (n) {
  return '₾ ' + n.toLocaleString('en-US')
}

function currentTotal () {
  let total = basePrice()
  for (const group of CATALOG) {
    const opt = group.options.find(x => x.id === config[group.key])
    total += opt.price
  }
  if (config.addons.garage) total += PRICE_GARAGE
  if (config.addons.extension.on) total += PRICE_EXT_STOREY * config.addons.extension.storeys
  if (config.addons.terrace.on) {
    for (const lvl of config.addons.terrace.levels) {
      total += lvl === 1 ? PRICE_TERRACE : PRICE_BALCONY
    }
  }
  return total
}

// clean right-side editor bar — controls added step by step.
// onChange() fires after any size edit so the caller can rebuild + reframe.
function buildCleanPanel (onChange) {
  const panel = document.createElement('div')
  panel.className = 'panel'
  const body = document.createElement('div')
  body.className = 'panel-body'
  const title = document.createElement('h2')
  title.className = 'panel-title'
  title.textContent = 'სახლის რედაქტირება'
  body.appendChild(title)

  // --- house size: 4 preset footprints + manual width/length ---
  const presets = SIZE_PRESETS.slice(0, 4)
  const sizeWrap = document.createElement('div')
  sizeWrap.className = 'group'
  const sizeTitle = document.createElement('div')
  sizeTitle.className = 'group-title'
  sizeTitle.textContent = 'ფართი'
  sizeWrap.appendChild(sizeTitle)

  const sizeOpts = document.createElement('div')
  sizeOpts.className = 'options'

  const custom = document.createElement('div')
  custom.className = 'size-inputs'
  custom.innerHTML =
    `<label>სიგრძე<input type="number" min="${SIZE_LIMITS.d[0]}" max="${SIZE_LIMITS.d[1]}" step="0.5" data-size-d></label>` +
    `<label>სიგანე<input type="number" min="${SIZE_LIMITS.w[0]}" max="${SIZE_LIMITS.w[1]}" step="0.5" data-size-w></label>`
  const wIn = custom.querySelector('[data-size-w]')
  const dIn = custom.querySelector('[data-size-d]')

  const syncUI = () => {
    sizeOpts.querySelectorAll('.opt').forEach(b => b.classList.toggle('active', b.dataset.opt === config.sizeId))
    wIn.value = config.width
    dIn.value = config.depth
  }

  for (const p of presets) {
    const btn = document.createElement('button')
    btn.className = 'opt'
    btn.dataset.opt = p.id
    btn.innerHTML = `${p.w} × ${p.d}<span class="price">${p.w * p.d} მ²</span>`
    btn.addEventListener('click', () => {
      if (config.sizeId === p.id) return
      config.sizeId = p.id
      config.width = p.w
      config.depth = p.d
      syncUI()
      onChange()
    })
    sizeOpts.appendChild(btn)
  }

  const clamp = (v, [lo, hi], fb) => {
    const n = parseFloat(v)
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fb
  }
  const onCustom = () => {
    config.width = clamp(wIn.value, SIZE_LIMITS.w, config.width)
    config.depth = clamp(dIn.value, SIZE_LIMITS.d, config.depth)
    const pre = presets.find(p => p.w === config.width && p.d === config.depth)
    config.sizeId = pre ? pre.id : 'custom'
    syncUI()
    onChange()
  }
  wIn.addEventListener('change', onCustom)
  dIn.addEventListener('change', onCustom)

  sizeWrap.appendChild(sizeOpts)
  sizeWrap.appendChild(custom)
  body.appendChild(sizeWrap)
  syncUI()

  // --- foundation / base type ---
  const fWrap = document.createElement('div')
  fWrap.className = 'group'
  const fTitle = document.createElement('div')
  fTitle.className = 'group-title'
  fTitle.textContent = 'საძირკველი'
  fWrap.appendChild(fTitle)
  const fOpts = document.createElement('div')
  fOpts.className = 'options stack'
  for (const f of FOUNDATIONS) {
    const btn = document.createElement('button')
    btn.className = 'opt' + (config.foundation === f.id ? ' active' : '')
    btn.dataset.opt = f.id
    btn.textContent = f.label
    btn.addEventListener('click', () => {
      if (config.foundation === f.id) return
      config.foundation = f.id
      fOpts.querySelectorAll('.opt').forEach(b => b.classList.toggle('active', b === btn))
      onChange()
    })
    fOpts.appendChild(btn)
  }
  fWrap.appendChild(fOpts)
  body.appendChild(fWrap)

  // (terrace section temporarily removed — will return later)

  // --- reusable single-select group builder ---
  const selectGroup = (titleText, key, items) => {
    const wrap = document.createElement('div')
    wrap.className = 'group'
    const gt = document.createElement('div')
    gt.className = 'group-title'
    gt.textContent = titleText
    wrap.appendChild(gt)
    const opts = document.createElement('div')
    opts.className = 'options stack'
    for (const it of items) {
      const btn = document.createElement('button')
      btn.className = 'opt' + (config[key] === it.id ? ' active' : '')
      btn.dataset.opt = it.id
      btn.textContent = it.label
      btn.addEventListener('click', () => {
        if (config[key] === it.id) return
        config[key] = it.id
        opts.querySelectorAll('.opt').forEach(b => b.classList.toggle('active', b === btn))
        onChange()
      })
      opts.appendChild(btn)
    }
    wrap.appendChild(opts)
    body.appendChild(wrap)
  }

  // --- walls / facade finish ---
  selectGroup('კედლები', 'wallMaterial', WALLS.map(w => ({ id: w.id, label: w.label })))

  // --- windows ---
  selectGroup('ფანჯრები', 'windowStyle', [
    { id: 'classic', label: 'კლასიკური' },
    { id: 'modern', label: 'თანამედროვე' },
    { id: 'panoramic', label: 'პანორამული' }
  ])

  // --- entrance door ---
  selectGroup('შესასვლელი კარი', 'doorStyle', [
    { id: 'wood', label: 'ხის' },
    { id: 'modern', label: 'მუქი' },
    { id: 'glass', label: 'მინის' }
  ])

  panel.appendChild(body)
  document.body.appendChild(panel)
  return { panel, body }
}

function buildPanel (onChange) {
  const focusTargets = {} // editGroup key -> panel element (for click-to-edit)
  const panel = document.createElement('div')
  panel.className = 'panel'

  const body = document.createElement('div')
  body.className = 'panel-body'
  const h = document.createElement('h2')
  h.textContent = 'Customize'
  body.appendChild(h)

  // --- house size (footprint) — presets + custom width/depth ---
  const sizeWrap = document.createElement('div')
  sizeWrap.className = 'group'
  const sizeTitle = document.createElement('div')
  sizeTitle.className = 'group-title'
  sizeTitle.textContent = 'House size'
  sizeWrap.appendChild(sizeTitle)
  const sizeOpts = document.createElement('div')
  sizeOpts.className = 'options'
  const custom = document.createElement('div')
  custom.className = 'size-inputs'
  custom.innerHTML = `
    <label>Width (m)<input type="number" min="${SIZE_LIMITS.w[0]}" max="${SIZE_LIMITS.w[1]}" step="0.5" data-size-w></label>
    <label>Depth (m)<input type="number" min="${SIZE_LIMITS.d[0]}" max="${SIZE_LIMITS.d[1]}" step="0.5" data-size-d></label>`
  const wIn = custom.querySelector('[data-size-w]')
  const dIn = custom.querySelector('[data-size-d]')
  const syncSizeUI = () => {
    sizeOpts.querySelectorAll('.opt').forEach(b => b.classList.toggle('active', b.dataset.opt === config.sizeId))
    wIn.value = config.width
    dIn.value = config.depth
  }
  for (const p of SIZE_PRESETS) {
    const btn = document.createElement('button')
    btn.className = 'opt'
    btn.dataset.group = 'size'
    btn.dataset.opt = p.id
    btn.innerHTML = `${p.label}<span class="price">${p.w} × ${p.d} m — ${p.w * p.d} m²</span>`
    btn.addEventListener('click', () => {
      if (config.sizeId === p.id) return
      config.sizeId = p.id
      config.width = p.w
      config.depth = p.d
      syncSizeUI()
      onChange('size')
    })
    sizeOpts.appendChild(btn)
  }
  const clamp = (v, [lo, hi], fallback) => {
    const n = parseFloat(v)
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
  }
  const onCustom = () => {
    config.width = clamp(wIn.value, SIZE_LIMITS.w, config.width)
    config.depth = clamp(dIn.value, SIZE_LIMITS.d, config.depth)
    const preset = SIZE_PRESETS.find(p => p.w === config.width && p.d === config.depth)
    config.sizeId = preset ? preset.id : 'custom'
    syncSizeUI()
    onChange('size')
  }
  wIn.addEventListener('change', onCustom)
  dIn.addEventListener('change', onCustom)
  sizeWrap.appendChild(sizeOpts)
  sizeWrap.appendChild(custom)
  body.appendChild(sizeWrap)
  syncSizeUI()
  focusTargets.size = sizeWrap

  // --- storeys ---
  const floorsWrap = document.createElement('div')
  floorsWrap.className = 'group'
  const floorsTitle = document.createElement('div')
  floorsTitle.className = 'group-title'
  floorsTitle.textContent = 'Storeys'
  floorsWrap.appendChild(floorsTitle)
  const floorsOpts = document.createElement('div')
  floorsOpts.className = 'options'
  for (const fo of FLOOR_OPTIONS) {
    const btn = document.createElement('button')
    btn.className = 'opt' + (config.floors === fo.id ? ' active' : '')
    btn.dataset.group = 'floors'
    btn.dataset.opt = String(fo.id)
    btn.innerHTML = `${fo.label}<span class="price">${fo.id} × footprint area</span>`
    btn.addEventListener('click', () => {
      if (config.floors === fo.id) return
      config.floors = fo.id
      floorsOpts.querySelectorAll('.opt').forEach(b => b.classList.toggle('active', b === btn))
      onChange('size')
    })
    floorsOpts.appendChild(btn)
  }
  floorsWrap.appendChild(floorsOpts)
  body.appendChild(floorsWrap)
  focusTargets.floors = floorsWrap

  for (const group of CATALOG) {
    const wrap = document.createElement('div')
    wrap.className = 'group'
    const title = document.createElement('div')
    title.className = 'group-title'
    title.textContent = group.title
    wrap.appendChild(title)
    const opts = document.createElement('div')
    opts.className = 'options'
    for (const opt of group.options) {
      const btn = document.createElement('button')
      btn.className = 'opt' + (config[group.key] === opt.id ? ' active' : '')
      btn.dataset.group = group.key
      btn.dataset.opt = opt.id
      btn.innerHTML = `${opt.label}<span class="price">+ ${fmt(opt.price)}</span>`
      btn.addEventListener('click', () => {
        if (config[group.key] === opt.id) return
        config[group.key] = opt.id
        opts.querySelectorAll('.opt').forEach(b => b.classList.toggle('active', b === btn))
        onChange(group.key)
      })
      opts.appendChild(btn)
    }
    wrap.appendChild(opts)
    body.appendChild(wrap)
    focusTargets[group.key] = wrap
  }

  // --- additions: toggles that expand with per-storey sub-choices ---
  const addWrap = document.createElement('div')
  addWrap.className = 'group'
  const addTitle = document.createElement('div')
  addTitle.className = 'group-title'
  addTitle.textContent = 'Additions'
  addWrap.appendChild(addTitle)
  const addOpts = document.createElement('div')
  addOpts.className = 'options stack'

  const isAddonOn = id => id === 'garage' ? config.addons.garage : config.addons[id].on

  for (const a of ADDONS) {
    const btn = document.createElement('button')
    btn.className = 'opt'
    btn.dataset.group = 'addons'
    btn.dataset.opt = a.id
    btn.innerHTML = `${a.label}<span class="price">${a.priceNote}</span>`
    btn.addEventListener('click', () => {
      if (a.id === 'garage') {
        config.addons.garage = !config.addons.garage
      } else {
        config.addons[a.id].on = !config.addons[a.id].on
        if (a.id === 'terrace' && config.addons.terrace.on && !config.addons.terrace.levels.length) {
          config.addons.terrace.levels = [1]
        }
      }
      onChange('addons')
    })
    addOpts.appendChild(btn)
    focusTargets[a.id] = btn

    if (a.id === 'extension') {
      const sub = document.createElement('div')
      sub.className = 'sub-chips'
      sub.dataset.sub = 'extension'
      for (const s of [1, 2, 3]) {
        const chip = document.createElement('button')
        chip.className = 'chip'
        chip.dataset.val = String(s)
        chip.textContent = s === 1 ? '1 storey' : `${s} storeys`
        chip.addEventListener('click', () => {
          config.addons.extension.storeys = s
          onChange('addons')
        })
        sub.appendChild(chip)
      }
      addOpts.appendChild(sub)
    }

    if (a.id === 'terrace') {
      const sub = document.createElement('div')
      sub.className = 'sub-chips'
      sub.dataset.sub = 'terrace'
      const levels = [[1, 'Ground'], [2, '2nd floor'], [3, '3rd floor']]
      for (const [lvl, label] of levels) {
        const chip = document.createElement('button')
        chip.className = 'chip'
        chip.dataset.val = String(lvl)
        chip.textContent = label
        chip.addEventListener('click', () => {
          const t = config.addons.terrace
          if (t.levels.includes(lvl)) t.levels = t.levels.filter(x => x !== lvl)
          else t.levels = [...t.levels, lvl].sort()
          if (!t.levels.length) t.on = false
          onChange('addons')
        })
        sub.appendChild(chip)
      }
      addOpts.appendChild(sub)
    }
  }
  addWrap.appendChild(addOpts)
  body.appendChild(addWrap)

  // sync toggle/chip states from config (also re-run after storey changes)
  const refreshAddonUI = () => {
    addOpts.querySelectorAll('.opt[data-group="addons"]').forEach(b => {
      b.classList.toggle('active', isAddonOn(b.dataset.opt))
    })
    const extSub = addOpts.querySelector('[data-sub="extension"]')
    extSub.style.display = config.addons.extension.on ? '' : 'none'
    extSub.querySelectorAll('.chip').forEach(c => {
      const v = Number(c.dataset.val)
      c.classList.toggle('active', config.addons.extension.storeys === v)
      c.classList.toggle('disabled', v > config.floors)
    })
    const terSub = addOpts.querySelector('[data-sub="terrace"]')
    terSub.style.display = config.addons.terrace.on ? '' : 'none'
    terSub.querySelectorAll('.chip').forEach(c => {
      const v = Number(c.dataset.val)
      c.classList.toggle('active', config.addons.terrace.levels.includes(v))
      c.classList.toggle('disabled', v > config.floors)
    })
  }
  refreshAddonUI()

  const totalWrap = document.createElement('div')
  totalWrap.className = 'panel-total'
  totalWrap.innerHTML = `
    <div class="row"><span>Base construction <span data-area></span></span><span data-base></span></div>
    <div class="total"><span>Total</span><strong data-total></strong></div>
    <div class="hint">Approximate estimate — final price depends on the project.</div>`
  panel.appendChild(body)
  panel.appendChild(totalWrap)
  document.body.appendChild(panel)

  const totalEl = totalWrap.querySelector('[data-total]')
  const baseEl = totalWrap.querySelector('[data-base]')
  const areaEl = totalWrap.querySelector('[data-area]')
  const updateTotal = () => {
    const area = Math.round(config.width * config.depth * config.floors * 10) / 10
    areaEl.textContent = `(${area} m²${config.floors > 1 ? ` / ${config.floors} fl` : ''})`
    baseEl.textContent = fmt(basePrice())
    totalEl.textContent = fmt(currentTotal())
    refreshAddonUI()
  }
  updateTotal()

  // scroll to + flash the group that matches a clicked 3D part
  const focusGroup = key => {
    const el = focusTargets[key]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('flash')
    void el.offsetWidth // restart the animation
    el.classList.add('flash')
    setTimeout(() => el.classList.remove('flash'), 1300)
  }

  return { updateTotal, focusGroup }
}

// ---------------------------------------------------------------------------
// scene setup
// ---------------------------------------------------------------------------

export function setupHouseEditor (container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  // no shadow mapping — the only shadow is the contact shadow mesh under the house
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  // transparent canvas — the page's design-system cream (#FDFFD4) shows
  // through, so the background can't be shifted by tone mapping

  const sunDir = new THREE.Vector3().setFromSphericalCoords(
    1,
    THREE.MathUtils.degToRad(90 - 35), // elevation 35°
    THREE.MathUtils.degToRad(118) // azimuth — raking light from the right, shadows sweep toward the camera
  )

  // real HDRI sky for ambient light + reflections
  const pmrem = new THREE.PMREMGenerator(renderer)
  new RGBELoader().load(new URL('./sky_1k.hdr', ASSETS).href, hdr => {
    scene.environment = pmrem.fromEquirectangular(hdr).texture
    hdr.dispose()
  })
  scene.environmentIntensity = 0.55

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 3000)
  camera.position.set(13.5, 4.6, 16)

  // product-customizer turntable: free 360° spin, no panning (house can't
  // drift off-centre), gentle auto-rotate while idle that pauses on drag
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 2.1, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = false
  controls.rotateSpeed = 0.7
  // full vertical freedom — orbit over the top and all the way under the house
  controls.minPolarAngle = 0.05
  controls.maxPolarAngle = Math.PI - 0.05
  controls.minDistance = 6
  controls.maxDistance = 60
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.9

  // stop the idle spin the moment the user grabs it; resume after a pause
  let idleTimer = null
  const pauseAutoRotate = () => {
    controls.autoRotate = false
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => { controls.autoRotate = true }, 4000)
  }
  renderer.domElement.addEventListener('pointerdown', pauseAutoRotate)
  renderer.domElement.addEventListener('wheel', pauseAutoRotate, { passive: true })

  // sun lights the house but casts no scene shadow — the only shadow is the
  // soft contact shadow directly under the house (a product-shot drop shadow)
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.7)
  sun.position.copy(sunDir).multiplyScalar(50)
  scene.add(sun)

  // house appears once the photo textures are in (local files — near-instant)
  let house = null

  // --- click-to-edit: hover highlights a part, click opens its panel group ---
  const raycaster = new THREE.Raycaster()
  const pointerV = new THREE.Vector2()
  let hoverState = null

  function highlightClone (m) {
    const one = mm => {
      const c = mm.clone()
      if (c.emissive) c.emissive.setHex(0x5a3316)
      return c
    }
    return Array.isArray(m) ? m.map(one) : one(m)
  }

  function clearHover () {
    if (!hoverState) return
    for (const [mesh, orig] of hoverState.saved) {
      const cur = mesh.material
      mesh.material = orig
      if (Array.isArray(cur)) cur.forEach(c => c.dispose())
      else cur.dispose()
    }
    hoverState = null
  }

  function setHover (key) {
    if (hoverState && hoverState.key === key) return
    clearHover()
    if (!key || !house) return
    const saved = []
    house.traverse(o => {
      if (o.isMesh && o.userData.editGroup === key) {
        saved.push([o, o.material])
        o.material = highlightClone(o.material)
      }
    })
    hoverState = { key, saved }
  }

  function pickPart (ev) {
    if (!house) return null
    const r = renderer.domElement.getBoundingClientRect()
    pointerV.x = ((ev.clientX - r.left) / r.width) * 2 - 1
    pointerV.y = -((ev.clientY - r.top) / r.height) * 2 + 1
    raycaster.setFromCamera(pointerV, camera)
    for (const h of raycaster.intersectObject(house, true)) {
      if (h.object.userData.editGroup) return h.object.userData.editGroup
    }
    return null
  }

  const rebuild = () => {
    clearHover()
    W = config.width
    D = config.depth
    FLOORS = config.floors
    PLINTH = foundationDef().height
    EAVE = PLINTH + H * FLOORS
    // add-ons can't reference storeys the house no longer has
    const ext = config.addons.extension
    ext.storeys = Math.min(ext.storeys, FLOORS)
    const ter = config.addons.terrace
    ter.levels = ter.levels.filter(l => l <= FLOORS)
    if (ter.on && !ter.levels.length) ter.levels = [1]
    if (house) {
      scene.remove(house)
      house.traverse(o => { if (o.geometry) o.geometry.dispose() })
    }
    house = buildHouse(config)
    scene.add(house)
  }

  // adaptive framing: the camera stays where the user left it and only glides
  // (smoothly, in the render loop) when the house stops fitting the view —
  // so a bigger house looks bigger instead of the camera jumping back
  let camGoal = null
  const requiredDistance = () => {
    const hw = config.width / 2 + OVER
    const hd = config.depth / 2 + OVER
    const roofHByType = {
      gable: hw * 0.43,
      hip: Math.max(1.2, hd * 0.5),
      flat: 0.7,
      gambrel: hw * 0.78,
      mansard: 1.9,
      skillion: hw * 2 * 0.18
    }
    const roofH = Math.max(2, (roofHByType[config.roofType] || 2) + 0.3)
    const totalH = PLINTH + H * config.floors + roofH
    const extraW = (config.addons.garage ? GARAGE_W + 0.4 : 0) + (config.addons.extension.on ? EXT_W + 0.4 : 0)
    const halfV = THREE.MathUtils.degToRad(camera.fov / 2)
    const halfH = Math.atan(Math.tan(halfV) * camera.aspect)
    const distV = (totalH * 0.55 + 1) / Math.tan(halfV)
    const distH = (Math.hypot((config.width + extraW) / 2 + 1, config.depth / 2 + 1)) / Math.tan(halfH)
    return { dist: Math.max(distV, distH), totalH }
  }
  const frameHouse = (initial) => {
    const { dist: required, totalH } = requiredDistance()
    const targetY = Math.max(2.1, totalH * 0.42)
    if (initial) {
      controls.target.y = targetY
      camera.position.sub(controls.target).setLength(required * 1.15).add(controls.target)
      return
    }
    const current = camera.position.distanceTo(controls.target)
    let dist = current
    if (current < required * 1.02) dist = required * 1.1 // grew out of frame → glide out
    else if (current > required * 1.9) dist = required * 1.35 // shrunk to a speck → glide in
    if (dist !== current || Math.abs(targetY - controls.target.y) > 0.05) {
      camGoal = { dist, targetY }
    }
  }
  const updateCamera = () => {
    if (!camGoal) return
    const t = 0.08
    controls.target.y += (camGoal.targetY - controls.target.y) * t
    const dir = camera.position.clone().sub(controls.target)
    const next = dir.length() + (camGoal.dist - dir.length()) * t
    camera.position.copy(controls.target).add(dir.setLength(next))
    if (Math.abs(next - camGoal.dist) < 0.05 && Math.abs(controls.target.y - camGoal.targetY) < 0.02) {
      camGoal = null
    }
  }

  loadSurfaces().then(() => {
    buildFloor(scene)
    rebuild()
    frameHouse(true)
  })

  // clean editor bar on the right — controls get added step by step.
  // (the full configurator lives in buildPanel; click-to-edit wiring returns
  // together with it once the bar has content again)
  const cleanPanel = buildCleanPanel(() => {
    rebuild()
    frameHouse(false)
  })

  function onResize () {
    const w = container.clientWidth
    const h = container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    renderer.render(scene, camera)
  }
  window.addEventListener('resize', onResize)

  renderer.setAnimationLoop(() => {
    updateCamera()
    controls.update()
    renderer.render(scene, camera)
  })

  return { scene, camera, renderer, controls, config, rebuild, updateCamera }
}
