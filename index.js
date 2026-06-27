import { create } from 'smbls'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import app from './app.js'
import context from './context.js'

create(app, context)

const setupHouseModelSection = () => {
  const sections = document.querySelectorAll('[data-maketi-house-model]:not([data-maketi-house-ready])')

  sections.forEach((section) => {
    const canvas = section.querySelector('[data-maketi-house-canvas]')
    const controls = section.parentElement?.querySelectorAll('[data-maketi-variant-category]')
    const priceValue = section.parentElement?.querySelector('[data-maketi-price-value]')

    if (!canvas) return

    section.dataset.maketiHouseReady = 'true'

    const state = {
      roof: 'modernGable',
      facade: 'whitePlaster',
      roofMaterial: 'metalStandingSeam',
      stories: 'one',
      blocks: 'three',
      design: 'linear',
      area: '120',
      floor: 'stone',
      windows: 'standard',
      entrance: 'simpleDoor',
      garage: 'noGarage',
      terrace: 'none',
      balcony: 'none',
      addon: 'none',
      houseStyle: 'modern'
    }
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xfdffd4)

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100)
    camera.position.set(5.05, 3.4, 7.25)
    camera.lookAt(-0.15, 0.82, 0)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08

    const root = new THREE.Group()
    root.position.x = -0.42
    root.scale.setScalar(0.72)
    root.rotation.y = -0.52
    scene.add(root)
    const baseScale = 0.72

    const ambient = new THREE.HemisphereLight(0xfff6d4, 0x3e474c, 1.15)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xfff7ea, 3.2)
    keyLight.position.set(4.8, 7.6, 4.2)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xaec8ff, 0.72)
    fillLight.position.set(-5, 2.6, -3.5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9)
    rimLight.position.set(-2.5, 4.2, -5.5)
    scene.add(rimLight)

    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 18
    keyLight.shadow.camera.left = -6
    keyLight.shadow.camera.right = 6
    keyLight.shadow.camera.top = 6
    keyLight.shadow.camera.bottom = -6

    const shadowTexture = (() => {
      const size = 256
      const shadowCanvas = document.createElement('canvas')
      shadowCanvas.width = size
      shadowCanvas.height = size
      const ctx = shadowCanvas.getContext('2d')
      const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.5)

      gradient.addColorStop(0, 'rgba(0, 0, 0, .34)')
      gradient.addColorStop(0.46, 'rgba(0, 0, 0, .18)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      return new THREE.CanvasTexture(shadowCanvas)
    })()
    const softShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(5.9, 4.25),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false
      })
    )

    softShadow.name = 'soft-ground-shadow'
    softShadow.position.set(-0.35, -0.16, 0.12)
    softShadow.rotation.x = -Math.PI / 2
    scene.add(softShadow)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 10),
      new THREE.MeshStandardMaterial({ color: 0xfdffd4, roughness: 0.94 })
    )
    ground.name = 'matte-ground-plane'
    ground.position.set(0, -0.19, 0)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const makeTexture = (base, accent, size = 256, lines = false) => {
      const textureCanvas = document.createElement('canvas')
      textureCanvas.width = size
      textureCanvas.height = size
      const ctx = textureCanvas.getContext('2d')

      ctx.fillStyle = base
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 1400; i++) {
        const alpha = Math.random() * 0.055
        ctx.fillStyle = `rgba(${accent}, ${alpha})`
        ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5)
      }
      if (lines) {
        ctx.strokeStyle = `rgba(${accent}, .16)`
        ctx.lineWidth = 1
        for (let y = 18; y < size; y += 24) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(size, y + Math.sin(y) * 2)
          ctx.stroke()
        }
      }

      const texture = new THREE.CanvasTexture(textureCanvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(2.2, 2.2)
      return texture
    }

    const makeGridTexture = (base, line, size = 256, xStep = 48, yStep = 28) => {
      const textureCanvas = document.createElement('canvas')
      textureCanvas.width = size
      textureCanvas.height = size
      const ctx = textureCanvas.getContext('2d')

      ctx.fillStyle = base
      ctx.fillRect(0, 0, size, size)
      ctx.strokeStyle = line
      ctx.lineWidth = 2
      for (let x = 0; x <= size; x += xStep) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, size)
        ctx.stroke()
      }
      for (let y = 0; y <= size; y += yStep) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(size, y)
        ctx.stroke()
      }

      const texture = new THREE.CanvasTexture(textureCanvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1.9, 1.9)
      return texture
    }

    const textures = {
      plaster: makeTexture('#d8d3c5', '20, 22, 20'),
      darkPlaster: makeTexture('#24292b', '255, 255, 255'),
      concrete: makeTexture('#8d8a80', '20, 22, 20'),
      brick: makeGridTexture('#8f4937', 'rgba(54, 24, 18, .38)', 256, 54, 28),
      whiteBrick: makeGridTexture('#ddd8ca', 'rgba(70, 66, 58, .25)', 256, 54, 28),
      stone: makeTexture('#77746a', '20, 20, 18'),
      wood: makeTexture('#765036', '40, 24, 12', 256, true),
      panels: makeGridTexture('#3f4749', 'rgba(255, 255, 255, .18)', 256, 64, 64),
      roofMetal: makeGridTexture('#252b2e', 'rgba(255, 255, 255, .18)', 256, 22, 256),
      roofShingle: makeGridTexture('#303033', 'rgba(0, 0, 0, .26)', 256, 48, 18),
      roofTile: makeGridTexture('#9b4f35', 'rgba(45, 18, 12, .32)', 256, 42, 22)
    }

    const applyMaterialFinish = (material, { color, map, roughness, metalness }) => {
      if (color) material.color.setHex(color)
      material.map = map || null
      if (roughness !== undefined) material.roughness = roughness
      if (metalness !== undefined) material.metalness = metalness
      material.needsUpdate = true
    }

    const materials = {
      wall: new THREE.MeshStandardMaterial({ color: 0xd8d3c5, map: textures.plaster, roughness: 0.9, metalness: 0.01 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x111416, roughness: 0.64, metalness: 0.08 }),
      roofGable: new THREE.MeshStandardMaterial({ color: 0x2b3032, map: textures.roofMetal, roughness: 0.74, metalness: 0.12 }),
      roofFlat: new THREE.MeshStandardMaterial({ color: 0x252b2e, map: textures.roofMetal, roughness: 0.72, metalness: 0.12 }),
      roofSlope: new THREE.MeshStandardMaterial({ color: 0x343a3c, map: textures.roofMetal, roughness: 0.76, metalness: 0.1 }),
      roofButterfly: new THREE.MeshStandardMaterial({ color: 0x252a2d, map: textures.roofMetal, roughness: 0.76, metalness: 0.1 }),
      roofTerrace: new THREE.MeshStandardMaterial({ color: 0x505552, roughness: 0.78 }),
      floorStone: new THREE.MeshStandardMaterial({ color: 0x5e625a, map: textures.stone, roughness: 0.88 }),
      floorWood: new THREE.MeshStandardMaterial({ color: 0x7b4a2f, map: textures.wood, roughness: 0.58 }),
      floorTile: new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: 0.48 }),
      windowClear: new THREE.MeshPhysicalMaterial({ color: 0xa8d7e6, roughness: 0.04, metalness: 0.02, transmission: 0.28, transparent: true, opacity: 0.48, reflectivity: 0.6 }),
      windowDark: new THREE.MeshPhysicalMaterial({ color: 0x05090d, roughness: 0.1, metalness: 0.18, transparent: true, opacity: 0.78, reflectivity: 0.72 }),
      windowWarm: new THREE.MeshPhysicalMaterial({ color: 0xffb15c, emissive: 0xff7b2f, emissiveIntensity: 0.22, roughness: 0.2, transparent: true, opacity: 0.68 })
    }

    let roofMesh
    let floorMesh
    const windowMeshes = []
    const priceConfig = {
      basePerM2: 920,
      stories: { one: 0, two: 28000 },
      blocks: { one: 0, two: 9500, three: 18000, four: 26500, five: 34000 },
      design: { linear: 0, courtyard: 14500, stacked: 22000 },
      roof: {
        standardFlat: 9000, flatParapet: 10800, flatTerrace: 20500, flatPergola: 18800, flatOverhang: 13500,
        standardGable: 12000, modernGable: 14800, openGable: 15200, asymGable: 15600, crossGable: 18200,
        standardHip: 16000, lowPitchHip: 14800, modernHip: 17200, hipWideEaves: 18800,
        singlePitch: 11000, reverseShed: 11800, doubleShed: 16800,
        butterflyRoof: 19000, aFrameRoof: 21000, chaletRoof: 22500, dutchGable: 21800, clerestoryRoof: 24000
      },
      facade: {
        whitePlaster: 0, grayPlaster: 1200, blackPlaster: 1800, redBrick: 7200, whiteBrick: 7600,
        stone: 9800, woodCladding: 8600, compositePanels: 9400, concreteFinish: 5200, mixedMaterials: 11800
      },
      roofMaterial: {
        metalStandingSeam: 0, asphaltShingles: -1800, clayTiles: 6200, concreteTiles: 3800, woodShingles: 7600
      },
      floor: { stone: 7000, wood: 11200, tile: 9800 },
      windows: {
        standard: 6500, floorToCeiling: 14800, cornerGlass: 17200, panoramic: 21000,
        blackFrame: 8200, whiteFrame: 7600, frameless: 19500
      },
      entrance: { simpleDoor: 0, modernDoor: 2200, glassDoor: 4200, woodDoor: 3600, coveredEntry: 7600, porchEntry: 9800 },
      garage: { noGarage: 0, singleGarage: 18000, doubleGarage: 32000, sideGarage: 24000, detachedGarage: 36000 },
      terrace: { none: 0, frontTerrace: 7600, rearTerrace: 8200, wraparoundTerrace: 18000, coveredTerrace: 14200 },
      balcony: { none: 0, glassBalcony: 7800, metalBalcony: 5200, floatingBalcony: 9800, woodenBalcony: 6200 },
      addon: { none: 0, pergola: 6500, chimney: 4200, solarPanels: 12500, skylights: 7800, decorativeColumns: 5400, outdoorKitchen: 16800, firePit: 3600 },
      houseStyle: { modern: 0, scandinavian: 7200, contemporary: 9400, farmhouse: 8800, mediterranean: 11200, industrial: 7800 }
    }

    const formatPrice = (price) => `₾${Math.round(price).toLocaleString('en-US')}`

    const updatePrice = () => {
      const area = Number(state.area) || 80
      const price = area * priceConfig.basePerM2 +
        (priceConfig.stories[state.stories] || 0) +
        (priceConfig.blocks[state.blocks] || 0) +
        (priceConfig.design[state.design] || 0) +
        (priceConfig.roof[state.roof] || 0) +
        (priceConfig.facade[state.facade] || 0) +
        (priceConfig.roofMaterial[state.roofMaterial] || 0) +
        (priceConfig.floor[state.floor] || 0) +
        (priceConfig.windows[state.windows] || 0) +
        (priceConfig.entrance[state.entrance] || 0) +
        (priceConfig.garage[state.garage] || 0) +
        (priceConfig.terrace[state.terrace] || 0) +
        (priceConfig.balcony[state.balcony] || 0) +
        (priceConfig.addon[state.addon] || 0) +
        (priceConfig.houseStyle[state.houseStyle] || 0)

      section.dataset.maketiHousePrice = String(Math.round(price))
      if (priceValue) priceValue.textContent = formatPrice(price)
    }

    const makeArchitecturalGeometry = (name, size) => {
      const radius = name.includes('window') || name.includes('solar') || name.includes('skylight')
        ? 0.006
        : name.includes('roof')
          ? 0.012
          : 0.022

      return new RoundedBoxGeometry(size[0], size[1], size[2], 2, radius)
    }

    const makeBox = (name, size, position, material, parent = root) => {
      const mesh = new THREE.Mesh(makeArchitecturalGeometry(name, size), material)
      mesh.name = name
      mesh.position.set(...position)
      mesh.castShadow = true
      mesh.receiveShadow = true
      parent.add(mesh)

      return mesh
    }

    const makeMesh = (name, geometry, material, parent = root) => {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = name
      mesh.castShadow = true
      mesh.receiveShadow = true
      parent.add(mesh)
      return mesh
    }

    const makeTriangularPrismGeometry = (width, height, depth) => {
      const halfWidth = width / 2
      const halfDepth = depth / 2
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        -halfWidth, 0, halfDepth, halfWidth, 0, halfDepth, 0, height, halfDepth,
        -halfWidth, 0, -halfDepth, halfWidth, 0, -halfDepth, 0, height, -halfDepth
      ])
      const indices = [
        0, 1, 2,
        4, 3, 5,
        3, 0, 2, 3, 2, 5,
        1, 4, 5, 1, 5, 2,
        3, 4, 1, 3, 1, 0
      ]
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()
      return geometry
    }

    const makeHipRoofGeometry = (width, height, depth, ridgeLength = 0.9) => {
      const halfWidth = width / 2
      const halfDepth = depth / 2
      const halfRidge = ridgeLength / 2
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        -halfWidth, 0, halfDepth, halfWidth, 0, halfDepth, halfWidth, 0, -halfDepth, -halfWidth, 0, -halfDepth,
        0, height, halfRidge, 0, height, -halfRidge
      ])
      const indices = [
        0, 1, 4,
        1, 2, 5, 1, 5, 4,
        2, 3, 5,
        3, 0, 4, 3, 4, 5,
        3, 2, 1, 3, 1, 0
      ]
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()
      return geometry
    }

    const makeShedRoofGeometry = (width, lowHeight, highHeight, depth) => {
      const halfWidth = width / 2
      const halfDepth = depth / 2
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        -halfWidth, lowHeight, halfDepth, halfWidth, highHeight, halfDepth, halfWidth, highHeight, -halfDepth, -halfWidth, lowHeight, -halfDepth,
        -halfWidth, 0, halfDepth, halfWidth, 0, halfDepth, halfWidth, 0, -halfDepth, -halfWidth, 0, -halfDepth
      ])
      const indices = [
        0, 1, 2, 0, 2, 3,
        4, 7, 6, 4, 6, 5,
        4, 5, 1, 4, 1, 0,
        5, 6, 2, 5, 2, 1,
        6, 7, 3, 6, 3, 2,
        7, 4, 0, 7, 0, 3
      ]
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()
      return geometry
    }

    const makeWindow = (position, rotationY = 0, size = [0.78, 0.78, 0.035], parent = root) => {
      const frame = makeBox('window-frame', [size[0] + 0.16, size[1] + 0.16, size[2]], position, materials.trim, parent)
      const glass = makeBox('window-glass', size, [position[0], position[1], position[2] + Math.cos(rotationY) * 0.012], materials.windowClear, parent)
      const mullionV = makeBox('window-mullion-v', [0.04, size[1] + 0.08, size[2] + 0.018], [position[0], position[1], position[2] + Math.cos(rotationY) * 0.026], materials.trim, parent)
      const mullionH = makeBox('window-mullion-h', [size[0] + 0.08, 0.04, size[2] + 0.018], [position[0], position[1], position[2] + Math.cos(rotationY) * 0.028], materials.trim, parent)
      const sill = makeBox('window-sill', [size[0] + 0.24, 0.055, 0.16], [position[0], position[1] - size[1] / 2 - 0.095, position[2] + Math.cos(rotationY) * 0.06], materials.trim, parent)
      frame.userData.windowOffset = [0, 0, 0]
      glass.userData.windowOffset = [0, 0, Math.cos(rotationY) * 0.012]
      mullionV.userData.windowOffset = [0, 0, Math.cos(rotationY) * 0.026]
      mullionH.userData.windowOffset = [0, 0, Math.cos(rotationY) * 0.028]
      sill.userData.windowOffset = [0, -size[1] / 2 - 0.095, Math.cos(rotationY) * 0.06]
      frame.rotation.y = rotationY
      glass.rotation.y = rotationY
      mullionV.rotation.y = rotationY
      mullionH.rotation.y = rotationY
      sill.rotation.y = rotationY
      windowMeshes.push(glass)
      return [frame, glass, mullionV, mullionH, sill]
    }

    makeBox('body', [2.65, 1.9, 2.35], [0, 1.05, 0], materials.wall)
    makeBox('body-plinth', [2.82, 0.16, 2.5], [0, 0.09, 0], materials.trim)
    makeBox('front-header-trim', [2.82, 0.08, 0.08], [0, 1.98, 1.22], materials.trim)
    makeBox('side-header-trim', [0.08, 0.08, 2.42], [1.36, 1.98, 0], materials.trim)
    const sideWing = makeBox('side-wing', [1.35, 1.45, 1.65], [-1.7, 0.86, 0.18], materials.wall)
    const terraceCut = makeBox('terrace-cut', [1.05, 0.14, 1.35], [-1.78, 1.62, 0.22], materials.trim)
    const rearBlock = makeBox('rear-block', [1.45, 1.35, 1.3], [1.45, 0.78, -1.26], materials.wall)
    const studioBlock = makeBox('studio-block', [1.18, 1.18, 1.72], [2.1, 0.68, 0.86], materials.wall)
    const entryBlock = makeBox('entry-block', [1.25, 1.05, 1.05], [-0.2, 0.62, 1.88], materials.wall)

    makeWindow([-0.56, 1.35, 1.19])
    makeWindow([0.82, 1.35, 1.19])
    makeWindow([0.82, 0.52, 1.19], 0, [0.78, 0.58, 0.035])
    const sideWindow = makeWindow([-1.7, 0.88, 1.02], 0, [0.78, 0.62, 0.035])
    const rearWindow = makeWindow([1.45, 0.84, -1.93], Math.PI, [0.72, 0.58, 0.035])
    const studioWindow = makeWindow([2.1, 0.76, 1.73], 0, [0.64, 0.56, 0.035])
    const entryWindow = makeWindow([-0.2, 0.66, 2.42], 0, [0.56, 0.52, 0.035])
    const doorMesh = makeBox('entry-door', [0.42, 0.86, 0.06], [-0.72, 0.42, 1.2], materials.trim)
    const entranceCanopy = makeBox('entry-canopy', [1.12, 0.12, 0.62], [-0.72, 1.05, 1.52], materials.roofFlat)
    const porchDeck = makeBox('porch-deck', [1.35, 0.12, 0.82], [-0.72, 0.03, 1.72], materials.floorWood)
    const garageMesh = makeBox('garage', [1.55, 1.08, 1.62], [2.42, 0.6, 0.02], materials.wall)
    const detachedGarageMesh = makeBox('detached-garage', [1.55, 1.08, 1.62], [3.25, 0.6, -1.85], materials.wall)
    const garageDoor = makeBox('garage-door', [1.08, 0.68, 0.05], [2.42, 0.47, 0.86], materials.trim)
    const frontTerrace = makeBox('front-terrace', [2.9, 0.11, 0.82], [0, 0.02, 1.78], materials.floorStone)
    const rearTerrace = makeBox('rear-terrace', [2.9, 0.11, 0.82], [0, 0.02, -1.78], materials.floorStone)
    const leftTerrace = makeBox('left-terrace', [0.82, 0.11, 2.9], [-1.86, 0.02, 0], materials.floorStone)
    const terraceCover = makeBox('terrace-cover', [2.9, 0.12, 0.82], [0, 1.58, 1.78], materials.roofFlat)
    const balconyDeck = makeBox('balcony-deck', [1.55, 0.12, 0.62], [0.7, 1.72, 1.5], materials.floorStone)
    const balconyRail = makeBox('balcony-rail', [1.55, 0.46, 0.06], [0.7, 1.98, 1.83], materials.trim)
    const chimney = makeBox('chimney', [0.22, 0.78, 0.22], [1.0, 2.65, -0.7], materials.trim)
    const pergolaA = makeBox('pergola-a', [1.7, 0.1, 0.08], [-0.25, 1.58, 1.86], materials.floorWood)
    const pergolaB = makeBox('pergola-b', [0.08, 0.1, 0.95], [-1.05, 1.58, 1.86], materials.floorWood)
    const solarPanel = makeBox('solar-panel', [1.15, 0.04, 0.72], [0.3, 2.42, -0.45], materials.windowDark)
    const skylight = makeBox('skylight', [0.62, 0.035, 0.42], [-0.55, 2.43, -0.35], materials.windowClear)
    const columnLeft = makeBox('column-left', [0.12, 1.22, 0.12], [-1.18, 0.62, 1.7], materials.trim)
    const columnRight = makeBox('column-right', [0.12, 1.22, 0.12], [-0.26, 0.62, 1.7], materials.trim)
    const outdoorKitchen = makeBox('outdoor-kitchen', [1.05, 0.58, 0.38], [-1.25, 0.32, -1.75], materials.floorTile)
    const firePit = makeBox('fire-pit', [0.55, 0.18, 0.55], [1.7, 0.12, 1.78], materials.trim)

    const upperStory = new THREE.Group()
    upperStory.name = 'upper-story'
    root.add(upperStory)
    makeBox('upper-body', [2.65, 0.95, 2.35], [0, 2.08, 0], materials.wall, upperStory)
    const upperSideWing = makeBox('upper-side-wing', [1.35, 0.82, 1.65], [-1.7, 1.94, 0.18], materials.wall, upperStory)
    const upperRearBlock = makeBox('upper-rear-block', [1.45, 0.76, 1.3], [1.45, 1.84, -1.26], materials.wall, upperStory)
    const upperStudioBlock = makeBox('upper-studio-block', [1.18, 0.7, 1.72], [2.1, 1.72, 0.86], materials.wall, upperStory)
    const upperEntryBlock = makeBox('upper-entry-block', [1.25, 0.62, 1.05], [-0.2, 1.55, 1.88], materials.wall, upperStory)
    makeWindow([-0.56, 2.1, 1.19], 0, [0.78, 0.54, 0.035], upperStory)
    makeWindow([0.82, 2.1, 1.19], 0, [0.78, 0.54, 0.035], upperStory)
    const upperSideWindow = makeWindow([-1.7, 1.92, 1.02], 0, [0.78, 0.5, 0.035], upperStory)
    const upperRearWindow = makeWindow([1.45, 1.84, -1.93], Math.PI, [0.72, 0.46, 0.035], upperStory)
    const upperStudioWindow = makeWindow([2.1, 1.7, 1.73], 0, [0.64, 0.44, 0.035], upperStory)
    const upperEntryWindow = makeWindow([-0.2, 1.54, 2.42], 0, [0.56, 0.38, 0.035], upperStory)
    upperStory.visible = false

    const getRoofBaseY = () => state.stories === 'two' ? 2.58 : 2.02

    const blockDefinitions = [
      { base: sideWing, upper: upperSideWing, windows: [sideWindow, upperSideWindow] },
      { base: rearBlock, upper: upperRearBlock, windows: [rearWindow, upperRearWindow] },
      { base: studioBlock, upper: upperStudioBlock, windows: [studioWindow, upperStudioWindow] },
      { base: entryBlock, upper: upperEntryBlock, windows: [entryWindow, upperEntryWindow] }
    ]

    const makeGableRoof = () => {
      const group = new THREE.Group()
      const baseY = getRoofBaseY()
      const roof = makeMesh('gable-roof-solid', makeTriangularPrismGeometry(3.38, 0.72, 2.9), materials.roofGable, group)
      const frontFascia = makeBox('gable-front-fascia', [3.42, 0.13, 0.1], [0, baseY + 0.02, 1.5], materials.trim, group)
      const rearFascia = makeBox('gable-rear-fascia', [3.42, 0.13, 0.1], [0, baseY + 0.02, -1.5], materials.trim, group)
      const ridgeCap = makeBox('gable-ridge-cap', [0.14, 0.12, 2.95], [0, baseY + 0.72, 0], materials.trim, group)

      roof.position.set(0, baseY, 0)
      frontFascia.rotation.z = -0.2
      rearFascia.rotation.z = -0.2
      return group
    }

    const makeFlatRoof = () => {
      const group = new THREE.Group()
      const baseY = getRoofBaseY()
      const slab = makeBox('flat-roof-slab', [3.22, 0.18, 2.86], [0, baseY + 0.08, 0], materials.roofFlat, group)
      const parapetFront = makeBox('flat-parapet-front', [3.34, 0.28, 0.12], [0, baseY + 0.28, 1.45], materials.trim, group)
      const parapetRear = makeBox('flat-parapet-rear', [3.34, 0.28, 0.12], [0, baseY + 0.28, -1.45], materials.trim, group)
      const parapetLeft = makeBox('flat-parapet-left', [0.12, 0.28, 2.7], [-1.67, baseY + 0.28, 0], materials.trim, group)
      const parapetRight = makeBox('flat-parapet-right', [0.12, 0.28, 2.7], [1.67, baseY + 0.28, 0], materials.trim, group)
      const frontFascia = makeBox('flat-front-fascia', [3.42, 0.11, 0.1], [0, baseY + 0.02, 1.52], materials.trim, group)
      const rearFascia = makeBox('flat-rear-fascia', [3.42, 0.11, 0.1], [0, baseY + 0.02, -1.52], materials.trim, group)

      slab.receiveShadow = true
      ;[parapetFront, parapetRear, parapetLeft, parapetRight, frontFascia, rearFascia].forEach((mesh) => {
        mesh.castShadow = true
      })
      return group
    }

    const makeSlopeRoof = () => {
      const group = new THREE.Group()
      const baseY = getRoofBaseY()
      const panel = makeMesh('shed-roof-solid', makeShedRoofGeometry(3.35, 0.1, 0.62, 2.9), materials.roofSlope, group)
      const lowFascia = makeBox('shed-low-fascia', [0.12, 0.18, 2.96], [-1.72, baseY + 0.1, 0], materials.trim, group)
      const highFascia = makeBox('shed-high-fascia', [0.12, 0.18, 2.96], [1.72, baseY + 0.62, 0], materials.trim, group)
      const frontLip = makeBox('shed-front-lip', [3.45, 0.12, 0.1], [0, baseY + 0.28, 1.5], materials.trim, group)

      panel.position.set(0, baseY, 0)
      lowFascia.rotation.z = -0.16
      highFascia.rotation.z = -0.16
      frontLip.rotation.z = 0.16
      return group
    }

    const makeButterflyRoof = () => {
      const group = new THREE.Group()
      const baseY = getRoofBaseY()
      const left = makeMesh('butterfly-left-roof', makeShedRoofGeometry(1.82, 0.48, 0.12, 2.9), materials.roofButterfly, group)
      const right = makeMesh('butterfly-right-roof', makeShedRoofGeometry(1.82, 0.12, 0.48, 2.9), materials.roofButterfly, group)
      const gutter = makeBox('butterfly-center-gutter', [0.18, 0.14, 2.94], [0, baseY + 0.14, 0], materials.trim, group)

      left.position.set(-0.91, baseY, 0)
      right.position.set(0.91, baseY, 0)
      gutter.receiveShadow = true
      return group
    }

    const makeHipRoof = () => {
      const group = new THREE.Group()
      const baseY = getRoofBaseY()
      const roof = makeMesh('hip-roof-solid', makeHipRoofGeometry(3.42, 0.62, 2.96, 0.86), materials.roofSlope, group)
      const frontFascia = makeBox('hip-front-fascia', [3.45, 0.12, 0.1], [0, baseY + 0.03, 1.52], materials.trim, group)
      const rearFascia = makeBox('hip-rear-fascia', [3.45, 0.12, 0.1], [0, baseY + 0.03, -1.52], materials.trim, group)

      roof.position.set(0, baseY, 0)
      frontFascia.rotation.z = -0.1
      rearFascia.rotation.z = -0.1
      return group
    }

    const makeTerraceRoof = () => {
      const group = new THREE.Group()
      const baseY = getRoofBaseY()
      const deck = new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.18, 2.65), materials.roofTerrace)
      deck.position.set(0, baseY + 0.08, 0)
      deck.castShadow = true
      deck.receiveShadow = true
      group.add(deck)

      const railMaterial = materials.trim
      ;[
        [0, baseY + 0.34, -1.28, 2.86, 0.12, 0.08],
        [0, baseY + 0.34, 1.28, 2.86, 0.12, 0.08],
        [-1.42, baseY + 0.34, 0, 0.08, 0.12, 2.48],
        [1.42, baseY + 0.34, 0, 0.08, 0.12, 2.48]
      ].forEach(([x, y, z, width, height, depth]) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), railMaterial)
        rail.position.set(x, y, z)
        rail.castShadow = true
        group.add(rail)
      })
      return group
    }

    const setRoof = (variant) => {
      if (roofMesh) root.remove(roofMesh)

      const roofType = ({
        standardFlat: 'flat',
        flatParapet: 'flat',
        flatTerrace: 'terrace',
        flatPergola: 'terrace',
        flatOverhang: 'flat',
        standardGable: 'gable',
        modernGable: 'gable',
        openGable: 'gable',
        asymGable: 'slope',
        crossGable: 'gable',
        standardHip: 'hip',
        lowPitchHip: 'hip',
        modernHip: 'hip',
        hipWideEaves: 'hip',
        singlePitch: 'slope',
        reverseShed: 'slope',
        doubleShed: 'butterfly',
        butterflyRoof: 'butterfly',
        aFrameRoof: 'gable',
        chaletRoof: 'gable',
        dutchGable: 'gable',
        clerestoryRoof: 'slope'
      })[variant] || variant

      roofMesh = roofType === 'flat'
        ? makeFlatRoof()
        : roofType === 'slope'
          ? makeSlopeRoof()
          : roofType === 'butterfly'
            ? makeButterflyRoof()
            : roofType === 'terrace'
              ? makeTerraceRoof()
              : roofType === 'hip'
                ? makeHipRoof()
              : makeGableRoof()
      roofMesh.name = `${variant}-roof`
      if (roofType === 'flat') {
        const showParapet = variant === 'flatParapet'
        ;['flat-parapet-front', 'flat-parapet-rear', 'flat-parapet-left', 'flat-parapet-right'].forEach((name) => {
          const mesh = roofMesh.getObjectByName(name)
          if (mesh) mesh.visible = showParapet
        })

        if (variant === 'flatOverhang') {
          const slab = roofMesh.getObjectByName('flat-roof-slab')
          if (slab) slab.scale.set(1.16, 1, 1.14)
        }
      }

      if (variant === 'modernGable' || variant === 'openGable') {
        const ridge = roofMesh.getObjectByName('gable-ridge-cap')
        if (ridge) ridge.scale.z = variant === 'openGable' ? 1.1 : 1
      }

      if (variant === 'aFrameRoof' || variant === 'chaletRoof') {
        const roof = roofMesh.getObjectByName('gable-roof-solid')
        if (roof) roof.scale.set(variant === 'aFrameRoof' ? 0.9 : 1.12, variant === 'aFrameRoof' ? 1.42 : 1.14, variant === 'chaletRoof' ? 1.18 : 1)
      }

      if (variant === 'hipWideEaves' || variant === 'lowPitchHip') {
        const roof = roofMesh.getObjectByName('hip-roof-solid')
        if (roof) roof.scale.set(variant === 'hipWideEaves' ? 1.16 : 1, variant === 'lowPitchHip' ? 0.72 : 1, variant === 'hipWideEaves' ? 1.12 : 1)
      }

      if (variant === 'reverseShed') {
        roofMesh.rotation.y = Math.PI
      }

      roofMesh.traverse?.((mesh) => {
        if (!mesh.isMesh) return
        mesh.castShadow = true
        mesh.receiveShadow = true
      })
      roofMesh.castShadow = true
      roofMesh.receiveShadow = true
      root.add(roofMesh)
    }

    const setStories = (variant) => {
      upperStory.visible = variant === 'two'
      setBlocks(state.blocks)
      setRoof(state.roof)
    }

    const setBlocks = (variant) => {
      const countByVariant = { one: 1, two: 2, three: 3, four: 4, five: 5 }
      const visibleExtraBlocks = (countByVariant[variant] || 1) - 1

      terraceCut.visible = visibleExtraBlocks >= 1
      blockDefinitions.forEach((definition, index) => {
        const visible = index < visibleExtraBlocks
        definition.base.visible = visible
        definition.upper.visible = visible
        definition.windows.flat().forEach((mesh) => { mesh.visible = visible })
      })
    }

    const setDesign = (variant) => {
      const setPairPosition = (pair, position) => {
        pair.forEach((mesh) => {
          const offset = mesh.userData.windowOffset || [0, 0, 0]
          mesh.position.set(position[0] + offset[0], position[1] + offset[1], position[2] + offset[2])
        })
      }
      const layouts = {
        linear: {
          rootX: -0.82,
          side: [-1.7, 0.86, 0.18],
          rear: [1.45, 0.78, -1.26],
          studio: [2.1, 0.68, 0.86],
          entry: [-0.2, 0.62, 1.88],
          upperSide: [-1.7, 1.94, 0.18],
          upperRear: [1.45, 1.84, -1.26],
          upperStudio: [2.1, 1.72, 0.86],
          upperEntry: [-0.2, 1.55, 1.88],
          sideWindow: [-1.7, 0.88, 1.02],
          rearWindow: [1.45, 0.84, -1.93],
          studioWindow: [2.1, 0.76, 1.73],
          entryWindow: [-0.2, 0.66, 2.42],
          upperSideWindow: [-1.7, 1.92, 1.02],
          upperRearWindow: [1.45, 1.84, -1.93],
          upperStudioWindow: [2.1, 1.7, 1.73],
          upperEntryWindow: [-0.2, 1.54, 2.42],
          wall: 0x171c20
        },
        courtyard: {
          rootX: -0.7,
          side: [-1.8, 0.86, 0.92],
          rear: [0.2, 0.78, -1.78],
          studio: [1.8, 0.68, 0.92],
          entry: [0.2, 0.62, 1.92],
          upperSide: [-1.8, 1.94, 0.92],
          upperRear: [0.2, 1.84, -1.78],
          upperStudio: [1.8, 1.72, 0.92],
          upperEntry: [0.2, 1.55, 1.92],
          sideWindow: [-1.8, 0.88, 1.75],
          rearWindow: [0.2, 0.84, -2.43],
          studioWindow: [1.8, 0.76, 1.78],
          entryWindow: [0.2, 0.66, 2.47],
          upperSideWindow: [-1.8, 1.92, 1.75],
          upperRearWindow: [0.2, 1.84, -2.43],
          upperStudioWindow: [1.8, 1.7, 1.78],
          upperEntryWindow: [0.2, 1.54, 2.47],
          wall: 0x20262a
        },
        stacked: {
          rootX: -0.9,
          side: [-1.35, 1.18, 0.12],
          rear: [1.2, 1.1, -1.12],
          studio: [1.7, 1.02, 0.78],
          entry: [-0.28, 0.62, 1.98],
          upperSide: [-1.35, 2.24, 0.12],
          upperRear: [1.2, 2.1, -1.12],
          upperStudio: [1.7, 1.98, 0.78],
          upperEntry: [-0.28, 1.55, 1.98],
          sideWindow: [-1.35, 1.2, 1.02],
          rearWindow: [1.2, 1.14, -1.82],
          studioWindow: [1.7, 1.06, 1.73],
          entryWindow: [-0.28, 0.66, 2.47],
          upperSideWindow: [-1.35, 2.2, 1.02],
          upperRearWindow: [1.2, 2.1, -1.82],
          upperStudioWindow: [1.7, 1.96, 1.73],
          upperEntryWindow: [-0.28, 1.54, 2.47],
          wall: 0x111416
        }
      }
      const layout = layouts[variant] || layouts.linear

      root.position.x = layout.rootX
      sideWing.position.set(...layout.side)
      rearBlock.position.set(...layout.rear)
      studioBlock.position.set(...layout.studio)
      entryBlock.position.set(...layout.entry)
      upperSideWing.position.set(...layout.upperSide)
      upperRearBlock.position.set(...layout.upperRear)
      upperStudioBlock.position.set(...layout.upperStudio)
      upperEntryBlock.position.set(...layout.upperEntry)
      setPairPosition(sideWindow, layout.sideWindow)
      setPairPosition(rearWindow, layout.rearWindow)
      setPairPosition(studioWindow, layout.studioWindow)
      setPairPosition(entryWindow, layout.entryWindow)
      setPairPosition(upperSideWindow, layout.upperSideWindow)
      setPairPosition(upperRearWindow, layout.upperRearWindow)
      setPairPosition(upperStudioWindow, layout.upperStudioWindow)
      setPairPosition(upperEntryWindow, layout.upperEntryWindow)
      setFacade(state.facade)
    }

    const setArea = (variant) => {
      const footprintScale = variant === '160' ? 1.18 : variant === '120' ? 1.05 : 0.92

      root.scale.set(baseScale * footprintScale, baseScale, baseScale * footprintScale)
    }

    const setFloor = (variant) => {
      const material = variant === 'wood' ? materials.floorWood : variant === 'tile' ? materials.floorTile : materials.floorStone

      if (!floorMesh) {
        floorMesh = makeBox('floor', [4.4, 0.18, 3.65], [-0.52, -0.08, 0.12], material)
      }
      floorMesh.material = material
    }

    const setWindows = (variant) => {
      const material = ['blackFrame', 'cornerGlass'].includes(variant)
        ? materials.windowDark
        : ['whiteFrame', 'frameless', 'panoramic', 'floorToCeiling'].includes(variant)
          ? materials.windowClear
          : materials.windowClear
      const scale = variant === 'floorToCeiling' ? 1.28 : variant === 'panoramic' ? 1.42 : variant === 'cornerGlass' ? 1.18 : 1
      windowMeshes.forEach((mesh) => {
        mesh.material = material
        mesh.scale.set(scale, scale, 1)
      })
    }

    const setFacade = (variant) => {
      const finishes = {
        whitePlaster: { color: 0xe9e6da, map: textures.plaster, roughness: 0.88, metalness: 0.01 },
        grayPlaster: { color: 0x8d9290, map: textures.plaster, roughness: 0.9, metalness: 0.01 },
        blackPlaster: { color: 0x202529, map: textures.darkPlaster, roughness: 0.7, metalness: 0.02 },
        redBrick: { color: 0x8b3f2f, map: textures.brick, roughness: 0.92, metalness: 0 },
        whiteBrick: { color: 0xded8c8, map: textures.whiteBrick, roughness: 0.9, metalness: 0 },
        stone: { color: 0x77746a, map: textures.stone, roughness: 0.94, metalness: 0 },
        woodCladding: { color: 0x7a4f32, map: textures.wood, roughness: 0.68, metalness: 0 },
        compositePanels: { color: 0x3c4548, map: textures.panels, roughness: 0.52, metalness: 0.12 },
        concreteFinish: { color: 0x9a978c, map: textures.concrete, roughness: 0.9, metalness: 0.01 },
        mixedMaterials: { color: 0x5f615a, map: textures.panels, roughness: 0.74, metalness: 0.05 }
      }
      applyMaterialFinish(materials.wall, finishes[variant] || finishes.whitePlaster)
    }

    const setRoofMaterial = (variant) => {
      const finishes = {
        metalStandingSeam: { color: 0x262c2f, map: textures.roofMetal, roughness: 0.68, metalness: 0.18 },
        asphaltShingles: { color: 0x303033, map: textures.roofShingle, roughness: 0.9, metalness: 0.02 },
        clayTiles: { color: 0x9b4f35, map: textures.roofTile, roughness: 0.86, metalness: 0.01 },
        concreteTiles: { color: 0x777b76, map: textures.roofTile, roughness: 0.9, metalness: 0 },
        woodShingles: { color: 0x6b4b35, map: textures.wood, roughness: 0.82, metalness: 0 }
      }
      const finish = finishes[variant] || finishes.metalStandingSeam
      ;[materials.roofGable, materials.roofFlat, materials.roofSlope, materials.roofButterfly, materials.roofTerrace].forEach((material) => {
        applyMaterialFinish(material, finish)
      })
    }

    const setEntrance = (variant) => {
      doorMesh.material = variant === 'glassDoor' ? materials.windowClear : variant === 'woodDoor' || variant === 'porchEntry' ? materials.floorWood : materials.trim
      doorMesh.scale.set(variant === 'modernDoor' ? 1.24 : 1, variant === 'glassDoor' ? 1.18 : 1, 1)
      entranceCanopy.visible = variant === 'coveredEntry' || variant === 'porchEntry'
      porchDeck.visible = variant === 'porchEntry'
      columnLeft.visible = variant === 'porchEntry'
      columnRight.visible = variant === 'porchEntry'
    }

    const setGarage = (variant) => {
      const visibleAttached = variant !== 'noGarage' && variant !== 'detachedGarage'
      garageMesh.visible = visibleAttached
      garageDoor.visible = visibleAttached
      detachedGarageMesh.visible = variant === 'detachedGarage'
      garageMesh.scale.x = variant === 'doubleGarage' ? 1.65 : 1
      garageDoor.scale.x = variant === 'doubleGarage' ? 1.55 : 1
      garageMesh.position.x = variant === 'sideGarage' ? -2.65 : 2.42
      garageDoor.position.x = garageMesh.position.x
    }

    const setTerrace = (variant) => {
      frontTerrace.visible = variant === 'frontTerrace' || variant === 'wraparoundTerrace' || variant === 'coveredTerrace'
      rearTerrace.visible = variant === 'rearTerrace' || variant === 'wraparoundTerrace'
      leftTerrace.visible = variant === 'wraparoundTerrace'
      terraceCover.visible = variant === 'coveredTerrace'
    }

    const setBalcony = (variant) => {
      const visible = variant !== 'none'
      balconyDeck.visible = visible
      balconyRail.visible = visible
      balconyDeck.material = variant === 'woodenBalcony' ? materials.floorWood : materials.floorStone
      balconyRail.material = variant === 'glassBalcony' ? materials.windowClear : materials.trim
      balconyDeck.scale.x = variant === 'floatingBalcony' ? 1.25 : 1
    }

    const setAddon = (variant) => {
      chimney.visible = variant === 'chimney'
      pergolaA.visible = variant === 'pergola'
      pergolaB.visible = variant === 'pergola'
      solarPanel.visible = variant === 'solarPanels'
      skylight.visible = variant === 'skylights'
      columnLeft.visible = variant === 'decorativeColumns' || state.entrance === 'porchEntry'
      columnRight.visible = variant === 'decorativeColumns' || state.entrance === 'porchEntry'
      outdoorKitchen.visible = variant === 'outdoorKitchen'
      firePit.visible = variant === 'firePit'
    }

    const setHouseStyle = (variant) => {
      if (variant === 'scandinavian') {
        setFacade('whitePlaster')
        materials.trim.color.setHex(0x5b3f2d)
      } else if (variant === 'mediterranean') {
        setFacade('whitePlaster')
        setRoofMaterial('clayTiles')
      } else if (variant === 'industrial') {
        setFacade('blackPlaster')
        materials.trim.color.setHex(0x111111)
      } else if (variant === 'farmhouse') {
        setFacade('whiteBrick')
        materials.trim.color.setHex(0x26201d)
      } else if (variant === 'contemporary') {
        setFacade('mixedMaterials')
      } else {
        setFacade(state.facade)
        materials.trim.color.setHex(0x0d1011)
      }
    }

    const setActiveButton = (category, value) => {
      controls?.forEach((button) => {
        if (button.dataset.maketiVariantCategory !== category) return

        const active = button.dataset.maketiVariantValue === value
        button.style.background = active ? '#000000' : 'transparent'
        button.style.color = active ? '#FDFFD4' : '#000000'
        button.setAttribute('aria-pressed', active ? 'true' : 'false')
      })
    }

    const applyVariant = (category, value) => {
      state[category] = value
      section.dataset[`maketiHouse${category.charAt(0).toUpperCase()}${category.slice(1)}`] = value
      if (category === 'roof') setRoof(value)
      if (category === 'facade') setFacade(value)
      if (category === 'roofMaterial') setRoofMaterial(value)
      if (category === 'stories') setStories(value)
      if (category === 'blocks') setBlocks(value)
      if (category === 'design') setDesign(value)
      if (category === 'area') setArea(value)
      if (category === 'floor') setFloor(value)
      if (category === 'windows') setWindows(value)
      if (category === 'entrance') setEntrance(value)
      if (category === 'garage') setGarage(value)
      if (category === 'terrace') setTerrace(value)
      if (category === 'balcony') setBalcony(value)
      if (category === 'addon') setAddon(value)
      if (category === 'houseStyle') setHouseStyle(value)
      setActiveButton(category, value)
      updatePrice()
    }

    controls?.forEach((button) => {
      button.addEventListener('click', () => {
        applyVariant(button.dataset.maketiVariantCategory, button.dataset.maketiVariantValue)
      })
    })

    applyVariant('roof', state.roof)
    applyVariant('facade', state.facade)
    applyVariant('roofMaterial', state.roofMaterial)
    applyVariant('stories', state.stories)
    applyVariant('blocks', state.blocks)
    applyVariant('design', state.design)
    applyVariant('area', state.area)
    applyVariant('floor', state.floor)
    applyVariant('windows', state.windows)
    applyVariant('entrance', state.entrance)
    applyVariant('garage', state.garage)
    applyVariant('terrace', state.terrace)
    applyVariant('balcony', state.balcony)
    applyVariant('addon', state.addon)
    applyVariant('houseStyle', state.houseStyle)

    let dragging = false
    let previousX = 0

    canvas.addEventListener('pointerdown', (event) => {
      dragging = true
      previousX = event.clientX
      canvas.style.cursor = 'grabbing'
      canvas.setPointerCapture?.(event.pointerId)
    })

    canvas.addEventListener('pointermove', (event) => {
      if (!dragging) return

      const delta = event.clientX - previousX
      previousX = event.clientX
      root.rotation.y += delta * 0.01
    })

    const stopDragging = (event) => {
      dragging = false
      canvas.style.cursor = 'grab'
      if (event?.pointerId != null) canvas.releasePointerCapture?.(event.pointerId)
    }

    canvas.addEventListener('pointerup', stopDragging)
    canvas.addEventListener('pointerleave', stopDragging)

    const resize = () => {
      const width = Math.max(section.clientWidth, 320)
      const height = Math.max(section.clientHeight, 360)

      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(section)
    resize()

    const render = () => {
      if (!section.isConnected) {
        resizeObserver.disconnect()
        return
      }
      root.rotation.y += dragging ? 0 : 0.002
      renderer.render(scene, camera)
      window.requestAnimationFrame(render)
    }

    render()
  })
}

const requestHouseModelSetup = () => {
  if (document.querySelector('[data-maketi-house-model]:not([data-maketi-house-ready])')) {
    setupHouseModelSection()
    return
  }

  window.setTimeout(requestHouseModelSetup, 50)
}

requestHouseModelSetup()
