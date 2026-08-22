// On-enter intro: the black house outlines then fills, the orange rectangle
// grows top -> bottom, the "მაკეტი" title clips in top -> bottom, the tagline
// rises, and finally the chrome (navbar, logo, lang switcher, chat) fades in.
//
// All hiding happens here at runtime — components render in their normal,
// fully visible state — so if this effect ever fails to run the page simply
// appears without the animation. It can never be left blank.

// IMPORTANT: this function must stay fully self-contained (all helpers and
// constants defined INSIDE it, like setupServicesEffect) — smbls serializes it
// and evals it without the module scope, so anything defined at module level
// is a ReferenceError at runtime.
export const setupIntroEffect = () => {
  // already initialised — report done so the poller stops retrying
  if (document.body.dataset.maketiIntroReady) {
    if (document.documentElement.dataset.maketiIntroActive !== 'true') {
      Array.from(document.querySelectorAll('[data-maketi-line-v], [data-maketi-line-h]')).forEach((el) => {
        el.style.clipPath = 'inset(0 0 0 0)'
        el.style.webkitClipPath = 'inset(0 0 0 0)'
      })
    }
    return true
  }

  const root = document.documentElement
  const setIntroActive = (active) => {
    if (active) root.dataset.maketiIntroActive = 'true'
    else delete root.dataset.maketiIntroActive
  }
  const isIntroActive = () => root.dataset.maketiIntroActive === 'true'

  // awwwards-style pair: OUT for expansions/draws, INOUT for clip reveals
  const EASE = 'cubic-bezier(.19, 1, .22, 1)'
  const INOUT = 'cubic-bezier(.77, 0, .18, 1)'

  const setClip = (el, v) => {
    el.style.clipPath = v
    el.style.webkitClipPath = v
  }

  // SVG filter that turns the house webp's alpha into a hollow outline stroke:
  // dilate the alpha, subtract the original -> a ring, then flood it black.
  const ensureOutlineFilter = () => {
    if (document.getElementById('maketi-house-outline-filter')) return
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.position = 'absolute'
    svg.innerHTML =
      '<filter id="maketi-house-outline-filter" x="-15%" y="-15%" width="130%" height="130%">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="1" result="d"/>' +
      '<feComposite in="d" in2="SourceAlpha" operator="out" result="ring"/>' +
      '<feFlood flood-color="#000000"/>' +
      '<feComposite in2="ring" operator="in"/>' +
      '</filter>'
    document.body.appendChild(svg)
  }

  const house = document.querySelector('[data-maketi-house]')
  const shadow = document.querySelector('[data-maketi-house-shadow]')
  const rectangle = document.querySelector('[data-maketi-orange-rectangle]')
  const title = document.querySelector('[data-maketi-title]')
  const tagline = document.querySelector('[data-maketi-tagline]')
  if (!house || !rectangle || !title || !tagline) return false

  // structural lines: vertical grows top -> bottom, horizontal left -> right
  const vLines = Array.from(document.querySelectorAll('[data-maketi-line-v]'))
  const hLines = Array.from(document.querySelectorAll('[data-maketi-line-h]'))
  if (!vLines.length || !hLines.length) return false

  document.body.dataset.maketiIntroReady = 'true'

  // chrome is fixed/absolute page furniture — reveal it last, opacity only
  // (navbar and lang switcher rely on their own transforms)
  const chrome = ['[data-maketi-navbar]', '[data-maketi-logo]', '[data-maketi-lang]', '[data-maketi-chat]', '[data-maketi-scrollbar]']
    .map((sel) => document.querySelector(sel))
    .filter(Boolean)

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    vLines.concat(hLines).forEach((el) => { setClip(el, 'inset(0 0 0 0)') })
    return true // leave the page exactly as rendered
  }

  // ── hide everything (runtime only — never baked into components) ──────────
  setIntroActive(true)
  root.style.overflow = 'hidden' // lock scroll during intro

  // crash-safe unlock: registered BEFORE any DOM work below, so even if a
  // livesync re-render detaches nodes mid-setup and something throws, the
  // page can never be left unscrollable (finish() normally no-ops this)
  const unlockTimer = window.setTimeout(() => {
    if (isIntroActive()) {
      setIntroActive(false)
      root.style.overflow = ''
    }
  }, 6500)

  // house starts slightly zoomed in and settles to scale 1 as it fills —
  // anchored to the ground so it reads as landing; the shadow grows with it
  house.style.opacity = '0'
  house.style.transform = 'scale(1.14)'
  house.style.transformOrigin = '50% 100%'
  house.style.willChange = 'opacity, transform'
  if (shadow) {
    shadow.style.opacity = '0'
    shadow.style.transform = 'scale(.8, .4)'
  }

  vLines.forEach((el) => {
    setClip(el, 'inset(0 0 100% 0)')
    el.style.willChange = 'clip-path'
  })
  hLines.forEach((el) => {
    setClip(el, 'inset(0 100% 0 0)')
    el.style.willChange = 'clip-path'
  })

  rectangle.style.transform = 'scale(1, 0)'
  rectangle.style.transformOrigin = 'top center'
  rectangle.style.willChange = 'transform'

  // title: hollow stroke, split into letters so they can write in one by one;
  // the solid fill fades in afterwards
  const titleText = title.textContent
  const letters = []
  title.textContent = ''
  Array.from(titleText).forEach((ch) => {
    const span = document.createElement('span')
    span.textContent = ch
    span.style.display = 'inline-block'
    setClip(span, 'inset(100% 0 0 0)')
    title.appendChild(span)
    letters.push(span)
  })
  title.style.webkitTextStroke = '1px #000000'
  title.style.webkitTextFillColor = 'transparent'

  const restoreTitle = () => {
    title.textContent = titleText
    title.style.webkitTextStroke = ''
    title.style.webkitTextFillColor = ''
    title.style.transition = ''
  }

  let revealTimer = 0

  tagline.style.opacity = '0'
  tagline.style.transform = 'translate3d(0, 0.6em, 0)'
  tagline.style.willChange = 'opacity, transform'

  chrome.forEach((el) => { el.style.opacity = '0' })

  // outline layer: a clone of the house img with the ring filter applied,
  // clipped shut so it can draw in top -> bottom
  ensureOutlineFilter()
  const outline = house.cloneNode(false)
  delete outline.dataset.maketiHouse
  outline.alt = ''
  outline.setAttribute('aria-hidden', 'true')
  outline.style.position = 'absolute'
  outline.style.left = '0'
  outline.style.top = '0'
  outline.style.width = '100%'
  outline.style.height = 'auto'
  outline.style.display = 'block'
  outline.style.zIndex = '2'
  outline.style.opacity = '1'
  outline.style.pointerEvents = 'none'
  outline.style.filter = 'url(#maketi-house-outline-filter)'
  outline.style.webkitFilter = 'url(#maketi-house-outline-filter)'
  outline.style.transform = 'scale(1.14)'
  outline.style.transformOrigin = '50% 100%'
  outline.style.willChange = 'clip-path, opacity, transform'
  setClip(outline, 'inset(0 100% 0 0)')
  house.parentNode.insertBefore(outline, house.nextSibling)

  const finish = () => {
    if (!isIntroActive()) return
    setIntroActive(false)
    root.style.overflow = ''
    window.clearTimeout(unlockTimer)
    window.clearTimeout(revealTimer)
    chrome.forEach((el) => { el.style.opacity = '1' })
    if (outline.parentNode) outline.parentNode.removeChild(outline)
    // once the chrome fade is done, drop the inline transitions so elements
    // (navbar hide/show, logo) go back to their own class-defined behavior
    window.setTimeout(() => {
      chrome.forEach((el) => { el.style.transition = '' })
      // hand the title back to its class-defined styling (plain text, no spans)
      restoreTitle()
      // hand the house/shadow back to their class-defined transforms
      house.style.transform = ''
      house.style.transformOrigin = ''
      house.style.willChange = ''
      house.style.transition = ''
      if (shadow) {
        shadow.style.transform = ''
        shadow.style.transition = ''
      }
      vLines.concat(hLines).forEach((el) => {
        setClip(el, 'inset(0 0 0 0)')
        el.style.transition = ''
        el.style.willChange = ''
      })
    }, 900)
  }

  // failsafe: whatever happens, everything is fully visible after ~6s
  revealTimer = window.setTimeout(() => {
    if (!isIntroActive()) return
    house.style.opacity = '1'
    house.style.transform = 'scale(1)'
    if (shadow) {
      shadow.style.opacity = '1'
      shadow.style.transform = 'scale(1, .5)'
    }
    vLines.concat(hLines).forEach((el) => { setClip(el, 'inset(0 0 0 0)') })
    rectangle.style.transform = 'scale(1, 1)'
    restoreTitle()
    tagline.style.opacity = '1'
    tagline.style.transform = 'translate3d(0, 0, 0)'
    finish()
  }, 6000)

  const play = () => {
    // transitions go on AFTER the hidden state has painted
    // steady guide draw, then the house and typography continue the sequence
    vLines.forEach((el) => { el.style.transition = 'clip-path 2400ms cubic-bezier(.45, .05, .55, .95)' })
    hLines.forEach((el) => { el.style.transition = 'clip-path 2400ms cubic-bezier(.45, .05, .55, .95)' })
    outline.style.transition = `clip-path 1200ms ${INOUT}, opacity 650ms ease, transform 1800ms ${EASE}`
    house.style.transition = `opacity 950ms ease, transform 1800ms ${EASE}`
    if (shadow) shadow.style.transition = `opacity 1300ms ease, transform 1800ms ${EASE}`
    rectangle.style.transition = `transform 900ms ${INOUT}`
    title.style.transition = '-webkit-text-fill-color 1200ms ease'
    letters.forEach((span) => { span.style.transition = `clip-path 650ms ${EASE}` })
    tagline.style.transition = `opacity 750ms ease, transform 750ms ${EASE}`
    chrome.forEach((el) => {
      // keep each element's own (class-defined) transitions alongside the fade
      const base = getComputedStyle(el).transition
      el.style.transition = (base && base !== 'all 0s ease 0s' ? base + ', ' : '') + 'opacity 620ms ease'
    })

    // choreography: house outline leads, page lines join 50ms in, then fill,
    // typography and chrome — each step starts while the previous is settling
    // 1) house outline draws in, left -> right
    setClip(outline, 'inset(0 0 0 0)')

    // 2) page lines draw in shortly after the outline starts
    window.setTimeout(() => {
      vLines.concat(hLines).forEach((el) => { setClip(el, 'inset(0 0 0 0)') })
    }, 600)

    // 3) the photo fills in as the outline fades away; its ground shadow
    //    settles underneath for the 3d feel
    window.setTimeout(() => {
      house.style.opacity = '1'
      house.style.transform = 'scale(1)'
      outline.style.opacity = '0'
      outline.style.transform = 'scale(1)'
      if (shadow) {
        shadow.style.opacity = '1'
        shadow.style.transform = 'scale(1, .5)'
      }
    }, 1050)

    // 4) orange rectangle grows top -> bottom (rides the fill)
    window.setTimeout(() => { rectangle.style.transform = 'scale(1, 1)' }, 1400)

    // 5) letters write in one by one, each stroking left -> right
    window.setTimeout(() => {
      letters.forEach((span, i) => window.setTimeout(() => {
        setClip(span, 'inset(0 0 0 0)')
      }, i * 140))
    }, 1950)

    // 6) the hollow letters fill with solid color, slow and smooth
    const fillAt = 1950 + letters.length * 140 + 450
    window.setTimeout(() => {
      title.style.webkitTextFillColor = '#000000'
    }, fillAt)

    // 7) tagline rises into place
    window.setTimeout(() => {
      tagline.style.opacity = '1'
      tagline.style.transform = 'translate3d(0, 0, 0)'
    }, fillAt + 400)

    // 8) navbar, logo, lang switcher, chat, scrollbar — early, softly staggered
    window.setTimeout(() => {
      chrome.forEach((el, i) => window.setTimeout(() => { el.style.opacity = '1' }, i * 120))
    }, 1800)
    window.setTimeout(finish, fillAt + 1500)
  }

  // Commit the hidden state with a forced synchronous reflow, then run the
  // timeline on plain timers. Deliberately NOT gated on requestAnimationFrame
  // or image load events: rAF is throttled/suspended in background tabs and
  // iframes, and load events for inlined data-URL images fire before any
  // listener can attach — both silently kill the timeline and leave only the
  // failsafe (verified in a live probe).
  void house.offsetHeight
  window.setTimeout(play, 80)

  return true
}
