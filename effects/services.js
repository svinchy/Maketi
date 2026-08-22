export const setupServicesEffect = () => {
  // already initialised — report done so any pollers stop retrying
  if (document.querySelector('[data-maketi-services][data-maketi-services-ready]')) return true

  const section = document.querySelector('[data-maketi-services]:not([data-maketi-services-ready])')
  if (!section) return false

  if (!section.querySelector('[data-maketi-service-item]')) return false

  // livesync-safe: a re-render can wipe an open modal while its scroll lock
  // (<html> overflow:hidden, set on modal-open below) stays stuck on the
  // document. Since we only reach here on a FRESH init (the ready-guard above
  // returns early otherwise), clear any orphaned lock so the page can scroll.
  document.documentElement.style.overflow = ''
  document.documentElement.removeAttribute('data-maketi-service-modal-open')

  section.dataset.maketiServicesReady = 'true'

  // the background title is pinned via CSS position:sticky; the effect only
  // switches its text + pops it when the active service changes
  const title = section.querySelector('[data-maketi-services-title]')
  const titleWrap = section.querySelector('[data-maketi-services-title-wrap]')

  // the title is revealed by the page's horizontal line (clip computed per
  // frame in update) — start fully clipped so it can't flash before the first
  // pass, and clear leftovers older effect variants may have left inline
  if (title) {
    title.style.transition = ''
    title.style.transform = ''
    title.style.opacity = ''
    title.style.clipPath = 'inset(100% 0 0 0)'
    title.style.webkitClipPath = 'inset(100% 0 0 0)'
  }
  if (titleWrap) titleWrap.style.willChange = 'transform'

  // exit-curtain cover: an opaque page-background overlay whose TOP EDGE is
  // the mask line — during the exit the section sinks under it. Pure
  // transform + paint order: animating clip-path on a viewport-tall section
  // repaints every frame and janks the scroll.
  const parent = section.parentNode
  if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative'
  const cover = document.createElement('div')
  cover.setAttribute('aria-hidden', 'true')
  cover.style.position = 'absolute'
  cover.style.left = '0'
  cover.style.right = '0'
  cover.style.display = 'none'
  cover.style.pointerEvents = 'none'
  const opaque = (c) => c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)'
  let bg = getComputedStyle(document.body).backgroundColor
  if (!opaque(bg)) bg = getComputedStyle(document.documentElement).backgroundColor
  if (!opaque(bg) && document.body.firstElementChild) {
    bg = getComputedStyle(document.body.firstElementChild).backgroundColor
  }
  cover.style.backgroundColor = opaque(bg) ? bg : '#ffffff'
  // redraw the page lines it covers: the vertical PageLines line (31.5%) and
  // the horizontal 43.75rem rhythm (700px at the 1440 reference width; rem so
  // it tracks the vw-scaled root font-size) — the cover's top edge sits
  // exactly on a PageLines line, so everything stays aligned
  cover.style.backgroundImage =
    'linear-gradient(rgba(0, 0, 0, .15), rgba(0, 0, 0, .15)), ' +
    'repeating-linear-gradient(to bottom, rgba(0, 0, 0, .15) 0, rgba(0, 0, 0, .15) 1px, transparent 1px, transparent 43.75rem)'
  cover.style.backgroundSize = '1px 100%, auto'
  cover.style.backgroundPosition = '31.5% 0, 0 0'
  cover.style.backgroundRepeat = 'no-repeat, repeat'
  parent.insertBefore(cover, section.nextSibling)
  // everything after the cover must paint above it: positioned elements with
  // the same (auto) z-index paint in DOM order
  let sib = cover.nextElementSibling
  while (sib) {
    if (getComputedStyle(sib).position === 'static') sib.style.position = 'relative'
    sib = sib.nextElementSibling
  }

  // layout/stagger lives in CSS (sections/Services.js); the effect only handles
  // parallax + active state
  let cards = []
  const refreshCards = () => {
    const items = Array.from(section.querySelectorAll('[data-maketi-service-item]'))
    cards = items.map((item) => ({ item }))
    cards.forEach((card) => {
      if (card.item.dataset.maketiServiceClickReady) return
      card.item.dataset.maketiServiceClickReady = 'true'
      card.item.addEventListener('click', () => openContent(card))
    })
  }

  // nodes are queried fresh (not cached): the arrow may not exist yet at setup,
  // and domql re-renders replace these elements.
  const labelOf = (card) =>
    card.item.dataset.maketiServiceTitle || (card.item.querySelector('img') || {}).alt || ''

  // service content modal — clicking the ACTIVE card opens it with that
  // card's photo on the left and its title over the placeholder article
  const modal = document.querySelector('[data-maketi-service-content]')
  let openedCard = null
  let openedMirrored = false
  let closeTimer = 0
  let currentIndex = -1
  const isCompact = () =>
    window.matchMedia && window.matchMedia('(max-width: 48em)').matches

  // article copy comes from state (state.js services.items → data attributes on
  // each card): intro string + newline-joined bullet list
  const fillContent = (card) => {
    if (!modal) return
    const introText = card.item.dataset.maketiServiceIntro || 'დეტალური ინფორმაცია მალე დაემატება.'
    const listRaw = card.item.dataset.maketiServiceList || ''
    const bullets = listRaw ? listRaw.split('\n') : []
    const intro = modal.querySelector('[data-maketi-service-content-intro]')
    const list = modal.querySelector('[data-maketi-service-content-list]')
    if (intro) intro.textContent = introText
    if (list) {
      list.textContent = ''
      list.style.display = bullets.length ? '' : 'none'
      const created = []
      bullets.forEach((text, i) => {
        const li = document.createElement('li')
        li.style.display = 'flex'
        li.style.gap = '0.9em'
        li.style.alignItems = 'baseline'
        li.style.padding = '0.7em 0'
        li.style.borderBottom = '1px dashed rgba(0, 0, 0, .4)'
        if (i === 0) li.style.borderTop = '1px dashed rgba(0, 0, 0, .4)'
        // start hidden + nudged, revealed with a per-row stagger below
        li.style.opacity = '0'
        li.style.transform = 'translate3d(0, 12px, 0)'
        li.style.transition =
          `opacity 420ms ease ${i * 55}ms, transform 560ms cubic-bezier(.19, 1, .22, 1) ${i * 55}ms`
        const num = document.createElement('span')
        num.textContent = String(i + 1).padStart(2, '0')
        num.style.color = 'var(--color-coralDark)'
        num.style.flexShrink = '0'
        // fixed width so every row's text starts at the same x (digits aren't
        // monospaced, otherwise the text column comes out jagged)
        num.style.width = '1.8em'
        const body = document.createElement('span')
        body.textContent = text
        body.style.opacity = '.65'
        li.appendChild(num)
        li.appendChild(body)
        list.appendChild(li)
        created.push(li)
      })
      window.requestAnimationFrame(() => {
        created.forEach((li) => { li.style.opacity = '1'; li.style.transform = 'none' })
      })
    }
  }

  // square-dot navigator — switch services from within the open modal; a single
  // coralDark square slides from the old dot to the new one
  const nav = modal && modal.querySelector('[data-maketi-service-content-nav]')
  let navSquares = []
  let navIndicator = null

  // inner square stays centered even when mobile CSS shrinks the dots
  const markNav = (index, animate) => {
    navSquares.forEach((sq, i) => {
      if (i === index) sq.classList.add('is-active')
      else sq.classList.remove('is-active')
    })
    window.requestAnimationFrame(() => {
      const dot = navSquares[index]
      if (!navIndicator || !dot) return
      if (!animate) navIndicator.style.transition = 'none'
      const insetX = Math.max(0, (dot.offsetWidth - navIndicator.offsetWidth) / 2)
      const insetY = Math.max(0, (dot.offsetHeight - navIndicator.offsetHeight) / 2)
      navIndicator.style.transform =
        `translate(${(dot.offsetLeft + insetX).toFixed(1)}px, ${(dot.offsetTop + insetY).toFixed(1)}px)`
      if (!animate) {
        navIndicator.getBoundingClientRect()
        navIndicator.style.transition = ''
      }
    })
  }

  // swap the modal to another service in place (no full re-open zoom): a
  // directional push — photo, title and intro slide out toward the travel
  // direction and the new ones slide in from the opposite side; list re-staggers
  const switchTo = (index) => {
    const card = cards[index]
    if (!card || !modal || index === currentIndex) return
    const dir = currentIndex < 0 || index > currentIndex ? 1 : -1
    currentIndex = index
    openedCard = card
    markNav(index, true)

    const media = modal.querySelector('[data-maketi-service-content-media]')
    const plate = modal.querySelector('[data-maketi-service-content-plate]')
    const photo = card.item.querySelector('[data-maketi-service-photo]')
    const compact = isCompact()
    const photoUrl = photo ? (photo.currentSrc || photo.src) : ''
    const intro = modal.querySelector('[data-maketi-service-content-intro]')
    const heading = modal.querySelector('[data-maketi-service-content-title]')

    // the photo's width collapses/reveals from its OWN outer edge: image on the
    // left wipes from the left, image on the right wipes from the right
    const collapsed = openedMirrored ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'

    // phase 1 — collapse the current photo's width toward its edge; title +
    // intro slide out toward the travel direction
    if (media) {
      media.style.transition = 'clip-path 300ms cubic-bezier(.4, 0, .2, 1)'
      media.style.clipPath = collapsed
    }
    if (heading) {
      heading.style.transition = 'opacity 200ms ease, transform 240ms ease'
      heading.style.opacity = '0'
      heading.style.transform = `translateX(${dir * 46}px)`
    }
    if (intro) {
      intro.style.transition = 'opacity 200ms ease, transform 240ms ease'
      intro.style.opacity = '0'
      intro.style.transform = `translateX(${dir * 32}px)`
    }

    // phase 2 — swap, then glide/expand back into place
    const slideIn = (el, fromX, resetOpacity) => {
      if (!el) return
      el.style.transition = 'none'
      el.style.transform = `translateX(${fromX}px)`
      el.getBoundingClientRect()
      el.style.transition = 'opacity 460ms ease, transform 600ms cubic-bezier(.19, 1, .22, 1)'
      el.style.opacity = resetOpacity
      el.style.transform = 'none'
    }
    window.setTimeout(() => {
      fillContent(card)
      // swap the image, then let the photo's width grow back in from the left
      if (plate && photoUrl) plate.style.backgroundImage = `url("${photoUrl}")`
      if (media) {
        media.style.transition = 'none'
        media.style.clipPath = collapsed
        media.getBoundingClientRect()
        media.style.transition = 'clip-path 620ms cubic-bezier(.19, 1, .22, 1)'
        media.style.clipPath = 'inset(0 0 0 0)'
      }
      if (heading) heading.textContent = labelOf(card).split(' ').join('\n')
      slideIn(heading, -dir * 46, '')
      slideIn(intro, -dir * 32, '')
    }, 220)
  }

  // (re)build the thumbnail dots — called on every open so a domql re-render
  // (language switch / HMR) that wipes the nav can't leave it empty
  const buildNav = () => {
    const navEl = modal && modal.querySelector('[data-maketi-service-content-nav]')
    navSquares = []
    if (!navEl) return
    navEl.textContent = ''
    cards.forEach((card, i) => {
      const sq = document.createElement('button')
      sq.type = 'button'
      sq.className = 'maketi-svc-dot'
      sq.setAttribute('aria-label', labelOf(card))
      sq.addEventListener('click', () => switchTo(i))
      navEl.appendChild(sq)
      navSquares.push(sq)
    })
    // one shared square that slides between dots
    navIndicator = document.createElement('span')
    navIndicator.className = 'maketi-svc-indicator'
    navEl.appendChild(navIndicator)
  }

  // the ✕ offset from the edge, captured before any inline side-swapping
  // overrides it (the class sets `right`)
  const closeEdgeOffset = (() => {
    const btn = modal && modal.querySelector('[data-maketi-service-content-close]')
    const v = btn ? getComputedStyle(btn).right : ''
    return v && v !== 'auto' ? v : '26px'
  })()

  // the nav's edge offset (from its class `left`), so it can hug either side
  const navEdgeOffset = (() => {
    const v = nav ? getComputedStyle(nav).left : ''
    return v && v !== 'auto' ? v : '42px'
  })()

  // the Services section is its own stacking context below the fixed page
  // chrome (logo, navbar, mobile menu, lang, chat, scrollbar line) — fade out while
  // the modal is open so nothing floats above it
  const CHROME =
    '[data-maketi-logo], [data-maketi-navbar], [data-maketi-menu], [data-maketi-lang], [data-maketi-chat], [data-maketi-scrollbar]'
  const setChromeHidden = (hidden) => {
    document.querySelectorAll(CHROME).forEach((el) => {
      el.style.transition = 'opacity 240ms ease'
      el.style.opacity = hidden ? '0' : ''
      el.style.pointerEvents = hidden ? 'none' : ''
    })
  }

  const openContent = (card) => {
    if (!modal) return
    window.clearTimeout(closeTimer)
    openedCard = card
    currentIndex = cards.indexOf(card)
    buildNav()
    markNav(currentIndex, false)
    const media = modal.querySelector('[data-maketi-service-content-media]')
    const plate = modal.querySelector('[data-maketi-service-content-plate]')
    const panel = modal.querySelector('[data-maketi-service-content-panel]')
    const closeBtn = modal.querySelector('[data-maketi-service-content-close]')
    const photo = card.item.querySelector('[data-maketi-service-photo]')
    const compact = isCompact()
    // explicit full inset (not 'none') so the first width-wipe on switch can
    // interpolate — clip-path: none does not animate to an inset()
    if (media) { media.style.transition = 'none'; media.style.clipPath = 'inset(0 0 0 0)' }
    if (plate && photo) {
      plate.style.backgroundImage = `url("${photo.currentSrc || photo.src}")`
    }
    fillContent(card)
    const heading = modal.querySelector('[data-maketi-service-content-title]')
    const titleWrapEl = modal.querySelector('[data-maketi-service-content-title-wrap]')
    // multi-word titles break one word per line (whiteSpace: pre-line)
    if (heading) {
      heading.textContent = labelOf(card).split(' ').join('\n')
      // visible again in case a prior close faded it out
      heading.style.transition = ''
      heading.style.opacity = ''
    }

    // shared-element title: capture the big section background title's box now,
    // then fly the modal title from there. Hide the section title so the two
    // don't double up during the transition (restored on close).
    const bgTitleRect = title ? title.getBoundingClientRect() : null
    if (title) {
      title.style.transition = 'none'
      title.style.opacity = '0'
    }

    // shared-element zoom: measure the clicked card's visible frame, show the
    // modal, then fly the media from that frame into its final panel position
    const box = card.item.querySelector('[data-maketi-service-box]') || card.item
    const from = box.getBoundingClientRect()

    modal.style.transition = 'none'
    modal.style.opacity = '1'
    modal.style.display = 'block'
    modal.style.backgroundColor = 'transparent'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.setAttribute('data-maketi-service-modal-open', 'true')

    // mirror the layout to match the card's column: left card → image left /
    // content right; right card → image right / content left
    const mirrored = !compact && from.left + from.width / 2 > window.innerWidth / 2
    openedMirrored = mirrored
    setChromeHidden(true)
    if (media) {
      media.style.left = compact ? '' : mirrored ? 'auto' : '0'
      media.style.right = compact ? '' : mirrored ? '0' : 'auto'
      media.style.opacity = ''
    }
    if (panel) {
      panel.style.left = compact ? '' : mirrored ? '0' : 'auto'
      panel.style.right = compact ? '' : mirrored ? 'auto' : '0'
    }
    if (closeBtn) {
      // the ✕ lives on the content side: content right → top-right,
      // content left (mirrored) → top-left
      closeBtn.style.left = compact ? '' : mirrored ? closeEdgeOffset : 'auto'
      closeBtn.style.right = compact ? '' : mirrored ? 'auto' : closeEdgeOffset
    }
    const navEl = modal.querySelector('[data-maketi-service-content-nav]')
    if (navEl) {
      // visible again after a prior close faded it out
      navEl.style.transition = 'none'
      navEl.style.opacity = ''
      // the dots live on the IMAGE side's bottom corner
      navEl.style.left = compact ? '' : mirrored ? 'auto' : navEdgeOffset
      navEl.style.right = compact ? '' : mirrored ? navEdgeOffset : 'auto'
    }
    if (titleWrapEl) {
      // Desktop title is centred on the image/content seam so it sits across both halves.
      titleWrapEl.style.left = compact ? '' : mirrored ? 'auto' : '46%'
      titleWrapEl.style.right = compact ? '' : mirrored ? '46%' : 'auto'
      titleWrapEl.style.transform = compact ? '' : mirrored ? 'translateX(50%)' : 'translateX(-50%)'
    }

    if (media) {
      const to = media.getBoundingClientRect()
      const sx = to.width > 0 ? from.width / to.width : 1
      const sy = to.height > 0 ? from.height / to.height : 1
      media.style.transition = 'none'
      media.style.transformOrigin = 'top left'
      media.style.willChange = 'transform'
      media.style.backfaceVisibility = 'hidden'
      // translate3d forces its own compositor layer so the flight never repaints
      media.style.transform =
        `translate3d(${(from.left - to.left).toFixed(1)}px, ${(from.top - to.top).toFixed(1)}px, 0) ` +
        `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`
    }
    // title FLIP invert: place the modal title at the section title's box
    if (heading && bgTitleRect) {
      const to = heading.getBoundingClientRect()
      const dx = (bgTitleRect.left + bgTitleRect.width / 2) - (to.left + to.width / 2)
      const dy = (bgTitleRect.top + bgTitleRect.height / 2) - (to.top + to.height / 2)
      const s = to.height > 0 ? bgTitleRect.height / to.height : 1
      heading.style.transition = 'none'
      heading.style.transformOrigin = 'center center'
      heading.style.willChange = 'transform'
      heading.style.backfaceVisibility = 'hidden'
      heading.style.transform =
        `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})`
    }
    if (panel) {
      panel.style.transition = 'none'
      panel.style.opacity = '0'
      // slide in from the panel's own side
      panel.style.transform = mirrored ? 'translate3d(-48px, 0, 0)' : 'translate3d(48px, 0, 0)'
    }
    if (closeBtn) {
      closeBtn.style.transition = 'none'
      closeBtn.style.opacity = '0'
    }

    // commit the start state, then animate everything into place: the image
    // zooms in first, the article follows with a short delay
    modal.getBoundingClientRect()
    modal.style.transition = 'background-color 640ms ease'
    modal.style.backgroundColor = ''
    // image + title share the exact same curve/duration so they move as one
    const ZOOM = 'cubic-bezier(.22, .61, .36, 1)'
    if (media) {
      media.style.transition = `transform 680ms ${ZOOM}`
      media.style.transform = 'translate3d(0, 0, 0) scale(1, 1)'
    }
    if (panel) {
      panel.style.transition =
        `opacity 520ms ease 120ms, transform 680ms ${ZOOM} 120ms`
      panel.style.opacity = '1'
      panel.style.transform = 'translate3d(0, 0, 0)'
    }
    if (closeBtn) {
      closeBtn.style.transition = 'opacity 320ms ease 300ms'
      closeBtn.style.opacity = ''
    }
    if (heading) {
      // zoom the title down from the section-title box into its seam spot
      heading.style.transition = `transform 680ms ${ZOOM}`
      heading.style.transform = 'translate3d(0, 0, 0) scale(1)'
    }

    // hand transitions back to the classes once the entrance settles (keeps
    // the close button's hover animation working)
    window.setTimeout(() => {
      modal.style.transition = ''
      if (media) { media.style.transition = ''; media.style.willChange = '' }
      if (panel) panel.style.transition = ''
      if (closeBtn) closeBtn.style.transition = ''
      if (heading) { heading.style.transition = ''; heading.style.willChange = '' }
    }, 900)
  }

  const closeContent = () => {
    if (!modal || modal.style.display !== 'block') return
    const media = modal.querySelector('[data-maketi-service-content-media]')
    const panel = modal.querySelector('[data-maketi-service-content-panel]')
    const closeBtn = modal.querySelector('[data-maketi-service-content-close]')
    // the dots vanish at once (they're not part of the fly-back)
    const navEl = modal.querySelector('[data-maketi-service-content-nav]')
    if (navEl) { navEl.style.transition = 'opacity 120ms ease'; navEl.style.opacity = '0' }

    // fly the image back into the card it came from — target computed from
    // transform-free offset geometry (the modal is fixed at 0,0), so closing
    // mid-flight interpolates smoothly from wherever the image currently is
    if (media && openedCard) {
      const box = openedCard.item.querySelector('[data-maketi-service-box]') || openedCard.item
      const from = box.getBoundingClientRect()
      const toLeft = media.offsetLeft
      const toTop = media.offsetTop
      const toW = media.offsetWidth
      const toH = media.offsetHeight
      const sx = toW > 0 ? from.width / toW : 1
      const sy = toH > 0 ? from.height / toH : 1
      media.style.transformOrigin = 'top left'
      media.style.willChange = 'transform'
      media.style.backfaceVisibility = 'hidden'
      // fade the flying image away over the last stretch: it lands on the
      // card's own photo (different crop/parallax), so a hard swap reads as a
      // jump — the crossfade morphs them instead
      media.style.transition =
        'transform 620ms cubic-bezier(.4, 0, .2, 1), opacity 240ms ease 340ms'
      media.style.transform =
        `translate3d(${(from.left - toLeft).toFixed(1)}px, ${(from.top - toTop).toFixed(1)}px, 0) ` +
        `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`
      media.style.opacity = '0'
    }

    // the article slips back out to its side while the backdrop melts away
    if (panel) {
      panel.style.transition = 'opacity 300ms ease, transform 500ms cubic-bezier(.4, 0, .2, 1)'
      panel.style.opacity = '0'
      panel.style.transform = openedMirrored ? 'translate3d(-48px, 0, 0)' : 'translate3d(48px, 0, 0)'
    }
    // title flies back into the section background title's box (reverse FLIP),
    // and the section title fades back in there so they crossfade into one
    const heading = modal.querySelector('[data-maketi-service-content-title]')
    if (heading && title) {
      const from = title.getBoundingClientRect()
      const to = heading.getBoundingClientRect()
      const dx = (from.left + from.width / 2) - (to.left + to.width / 2)
      const dy = (from.top + from.height / 2) - (to.top + to.height / 2)
      const s = to.height > 0 ? from.height / to.height : 1
      heading.style.transformOrigin = 'center center'
      heading.style.willChange = 'transform'
      heading.style.backfaceVisibility = 'hidden'
      heading.style.transition = 'transform 620ms cubic-bezier(.4, 0, .2, 1), opacity 240ms ease 320ms'
      heading.style.transform =
        `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})`
      heading.style.opacity = '0'
    }
    if (title) {
      title.style.transition = 'opacity 360ms ease 200ms'
      title.style.opacity = ''
    }
    if (closeBtn) {
      closeBtn.style.transition = 'opacity 200ms ease'
      closeBtn.style.opacity = '0'
    }
    modal.style.transition = 'background-color 460ms ease 60ms'
    modal.style.backgroundColor = 'transparent'
    document.documentElement.style.overflow = ''
    setChromeHidden(false)

    closeTimer = window.setTimeout(() => {
      modal.style.display = 'none'
      modal.style.backgroundColor = ''
      modal.style.transition = ''
      document.documentElement.removeAttribute('data-maketi-service-modal-open')
      if (media) { media.style.transition = ''; media.style.transform = 'none'; media.style.opacity = ''; media.style.willChange = '' }
      if (panel) { panel.style.transition = '' }
      if (closeBtn) { closeBtn.style.transition = ''; closeBtn.style.opacity = '' }
      if (heading) { heading.style.transition = ''; heading.style.transform = ''; heading.style.opacity = ''; heading.style.willChange = '' }
      if (title) { title.style.transition = ''; title.style.opacity = '' }
    }, 660)
  }

  if (modal) {
    const closeBtn = modal.querySelector('[data-maketi-service-content-close]')
    if (closeBtn) closeBtn.addEventListener('click', closeContent)
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeContent()
    })
  }

  refreshCards()
  const cardsObserver = new MutationObserver(() => refreshCards())
  cardsObserver.observe(section, { childList: true, subtree: true })

  // image overage (matches Img top:-8.75rem / height: calc(100% + 17.5rem) —
  // 140px/280px at the 1440 reference width; scaled by R per frame)
  const OVER = 140

  // exit-sink state: last frame's applied sink (to strip our own transform
  // out of measurements), plus the sticky title's captured position and last
  // written transform during the sink
  let prevSink = 0
  let wrapPin = null
  let wrapPrevY = 0

  // show the arrow on the active card only (re-asserted each frame so domql
  // re-renders can't leave it stuck)
  const applyActive = (index) => {
    cards.forEach((card, i) => {
      const isActive = i === index
      card.item.style.cursor = 'pointer'
      // dim inactive cards slightly so the active one stands out
      const photo = card.item.querySelector('[data-maketi-service-photo]')
      if (photo) photo.style.filter = isActive ? 'none' : 'brightness(.62)'
      const arrow = card.item.querySelector('[data-maketi-service-arrow]')
      if (arrow) {
        arrow.style.opacity = isActive ? '1' : '0'
        arrow.style.pointerEvents = isActive ? 'auto' : 'none'
        arrow.style.transform = isActive
          ? 'translate3d(0, 0, 0) scale(1)'
          : 'translate3d(.625rem, .625rem, 0) scale(.88)'
      }
    })
  }

  // shrink the font just enough that a long label never gets cut at the
  // viewport edges — short labels keep the design size (the class fontSize is
  // the cap). Text is centered, so it overflows both sides: the real needed
  // width is clientWidth + 2x the (right-side) scroll overflow.
  const fitTitle = () => {
    if (!title) return
    title.style.fontSize = ''
    const avail = title.clientWidth
    const over = title.scrollWidth - avail
    if (over > 0 && avail > 0) {
      const need = avail + over * 2
      const fs = parseFloat(getComputedStyle(title).fontSize)
      title.style.fontSize = `${(fs * avail / need * 0.96).toFixed(1)}px`
    }
  }
  fitTitle()

  // switch the background title in sync with the active card — the text changes
  // immediately (stays visible, no fade-out gap) with a subtle slide for smoothness
  const switchTitle = (index) => {
    if (!title || index < 0) return
    const label = labelOf(cards[index])
    if (title.textContent === label) return
    title.textContent = label
    fitTitle()
    title.style.transform = 'translate3d(0, 1rem, 0)'
    window.requestAnimationFrame(() => {
      title.style.transform = 'translate3d(0, 0, 0)'
    })
  }

  const update = () => {
    const vh = window.innerHeight
    const mid = vh / 2
    // root scale: 1 at the 1440px reference width (the root font-size is
    // vw-driven, so every px constant below scales with the design)
    const R = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16
    const rhythm = 700 * R

    // READ pass — collect every rect before touching the DOM (no layout thrash)
    const rects = cards.map((card) => card.item.getBoundingClientRect())

    let closest = 0
    let bestDistance = Infinity
    rects.forEach((rect, i) => {
      const distance = Math.abs(rect.top + rect.height / 2 - mid)
      if (distance < bestDistance) {
        bestDistance = distance
        closest = i
      }
    })

    // only activate once a card is actually near the viewport centre — otherwise
    // the topmost card lights up too early while the section is still off-centre
    const bestIndex = bestDistance <= vh * 0.5 ? closest : -1

    // READ pass 2 — all remaining geometry BEFORE any write (a read after a
    // write forces a synchronous reflow on every scroll event)
    const sr = section.getBoundingClientRect()
    // section position in document coords from LAYOUT (offsetTop ignores
    // transforms — deriving it from the transformed rect creates a feedback
    // loop with false fixed points if layout ever shifts mid-flight)
    let off = section
    let topDoc = 0
    while (off) { topDoc += off.offsetTop; off = off.offsetParent }
    const bottomDoc = topDoc + section.offsetHeight
    let coverTopBase = 0
    off = parent
    while (off) { coverTopBase += off.offsetTop; off = off.offsetParent }
    const wr = titleWrap ? titleWrap.getBoundingClientRect() : null
    const titleH = title ? title.offsetHeight : 0

    // exit — the section SINKS under the next horizontal page line, exactly
    // like the banner title: once the line (PageLines repeat at document
    // y = vh + k*700; first one at/below the section's bottom) enters the
    // viewport, the section translates down FASTER than the scroll
    // (SINK_RATE > 1) — on screen it visibly slides down while the line
    // rides up — and the cover (top edge = the line) hides whatever passes
    // under it. The sink freezes once the line clears the viewport: the
    // content is fully behind the cover by then and must not run away.
    const SINK_RATE = 1.4
    const lineDoc = vh + Math.max(1, Math.ceil((bottomDoc - vh) / rhythm)) * rhythm
    const past = Math.max(0, window.scrollY - (lineDoc - vh))
    const capped = Math.min(past, vh)
    const sink = capped * SINK_RATE

    // WRITE pass — smooth in-frame image parallax (image drifts within the card
    // so it reads as anchored, GPU transform only)
    cards.forEach((card, i) => {
      const rect = rects[i]
      const progress = (rect.top + rect.height / 2 - mid) / vh
      const over = OVER * R
      const ty = Math.max(-over, Math.min(over, -progress * over * 2))
      const img = card.item.querySelector('[data-maketi-service-photo]')
      if (img) img.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`
    })

    section.style.transform = sink > 0 ? `translate3d(0, ${sink.toFixed(1)}px, 0)` : ''
    // leftovers from the earlier clip/sticky variants (livesync can swap
    // effects without a reload) — make sure they're off
    if (section.style.clipPath) {
      section.style.clipPath = ''
      section.style.webkitClipPath = ''
    }
    if (section.style.position) { section.style.position = ''; section.style.top = '' }

    // the cover shows while the exit is engaged; its top edge sits exactly on
    // the mask line (guarded writes — no-ops on most frames)
    const coverDisplay = past > 0 ? 'block' : 'none'
    if (cover.style.display !== coverDisplay) cover.style.display = coverDisplay
    if (past > 0) {
      const coverTop = `${(lineDoc - coverTopBase).toFixed(1)}px`
      const coverH = `${Math.round(vh * 1.5)}px`
      if (cover.style.top !== coverTop) cover.style.top = coverTop
      if (cover.style.height !== coverH) cover.style.height = coverH
    }

    // title wrap: move it WITH the sinking section — its position:sticky
    // otherwise keeps compensating the scroll and would dive below the line
    // ahead of everything else. Measured (not assumed), so it holds in both
    // the sticky and released states of the wrap.
    if (titleWrap && wr) {
      // wrap's natural on-screen position with all our transforms removed
      // (wr was measured before this frame's writes — strip LAST frame's)
      const natural = wr.top - prevSink - wrapPrevY
      if (sink > 0) {
        // captured as the position the wrap had at the engage point
        if (wrapPin === null) wrapPin = wr.top - prevSink
        // section content's net on-screen motion: (SINK_RATE - 1) * past
        // down while sinking, then normal upward scroll after the freeze
        const target = wrapPin + (SINK_RATE - 1) * capped - Math.max(0, past - vh)
        const yNow = target - natural - sink
        titleWrap.style.transform = `translate3d(0, ${yNow.toFixed(1)}px, 0)`
        wrapPrevY = yNow
      } else {
        wrapPin = null
        // entry: the title starts with its BOTTOM exactly on the banner line
        // (fully clipped away above it) and slides down out of the line as the
        // section scrolls in, blending into the parallax drift once fully out
        const p = Math.min(1, Math.max(0, (vh - sr.top) / (vh * 0.9)))
        const lineYNow = vh - window.scrollY
        const naturalTop = (wr.top - prevSink - wrapPrevY) - titleH / 2
        const sectionProgress = (sr.top + sr.height / 2 - mid) / vh
        const drift = Math.max(-100 * R, Math.min(100 * R, -sectionProgress * 90 * R))
        const yNow = (1 - p) * (lineYNow - titleH - naturalTop) + p * drift
        titleWrap.style.transform = `translate3d(0, ${yNow.toFixed(2)}px, 0)`
        wrapPrevY = yNow
      }
    }
    prevSink = sink

    // bg title appears from the first horizontal page line inside the section —
    // the exact mirror of the banner title sinking into its line: whatever part
    // of the title is still ABOVE the line is clipped away, so as the line rides
    // up past the pinned title, the title emerges from underneath it. 1:1 with
    // scroll (scrolling back re-hides it). Measured AFTER this frame's wrap
    // transform is set, same as pageScroll does for the banner.
    if (title) {
      // the SAME line that cuts the banner title (document y = 100vh, see
      // pageScroll.js) — the banner sinks into it from above while this
      // title emerges from under it
      const lineY = vh - window.scrollY
      const tRect = title.getBoundingClientRect()
      const above = tRect.height > 0
        ? Math.min(1, Math.max(0, (lineY - tRect.top) / tRect.height))
        : 0
      const titleClip = `inset(${(above * 100).toFixed(2)}% 0 0 0)`
      title.style.clipPath = titleClip
      title.style.webkitClipPath = titleClip
    }

    applyActive(bestIndex)
    switchTitle(bestIndex)
  }

  // direct on the event — no rAF throttle: rAF adds a frame of lag to the
  // pinned exit curtain and is suspended entirely in background tabs
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
  update()

  return true
}
