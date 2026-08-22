// Inertia smooth scroll (awwwards-style): wheel input moves a TARGET, and an
// animation loop eases the real scroll position toward it each frame
// (exponential approach). Native scrolling still fires per frame, so every
// scroll-driven effect (banner sink, parallax, services exit) rides the same
// smoothed motion for free.
//
// House rules of this folder:
// - fully self-contained: smbls serializes this function and evals it without
//   module scope, so every helper/const must live INSIDE the function.
// - idempotent: guarded by a dataset flag; returns true when initialised.
// - degrade gracefully: reduced-motion users keep native scrolling; if this
//   never runs the page scrolls normally.
//
// Note on rAF: the loop is wheel-driven — it restarts on every wheel event —
// so a background-tab rAF suspension can't strand it permanently (unlike the
// banned rAF-throttled scroll handlers).
export const setupSmoothScrollEffect = () => {
  if (document.body.dataset.maketiSmoothScrollReady) return true
  document.body.dataset.maketiSmoothScrollReady = 'true'

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return true // keep native scrolling exactly as-is

  // approach factor per frame: lower = heavier/smoother, higher = snappier
  const EASE = 0.11

  let target = window.scrollY
  let current = window.scrollY
  let raf = 0

  const maxScroll = () =>
    Math.max(0, (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight)
  const locked = () =>
    document.documentElement.dataset.maketiIntroActive === 'true' ||
    document.documentElement.style.overflow === 'hidden' ||
    document.body.style.overflow === 'hidden' ||
    document.documentElement.dataset.maketiSideMenuOpen === 'true'

  const tick = () => {
    raf = 0
    current += (target - current) * EASE
    if (Math.abs(target - current) < 0.5) current = target
    window.scrollTo({ top: current, behavior: 'instant' })
    if (current !== target) raf = window.requestAnimationFrame(tick)
  }

  const onWheel = (e) => {
    if (e.ctrlKey) return // pinch-zoom gesture — leave it alone
    if (locked()) {
      e.preventDefault()
      target = window.scrollY
      current = window.scrollY
      return
    }
    e.preventDefault()
    // deltaMode: 0 = pixels, 1 = lines (Firefox), 2 = pages
    const mult = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? window.innerHeight : 1
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * mult))
    if (!raf) {
      current = window.scrollY
      raf = window.requestAnimationFrame(tick)
    }
  }

  // scrolling by other means (keyboard, scrollbar drag, anchors) stays
  // native — just resync so the next wheel continues from the real position
  const onScroll = () => {
    if (!raf) {
      target = window.scrollY
      current = window.scrollY
    }
  }
  const syncBounds = () => {
    target = Math.max(0, Math.min(maxScroll(), window.scrollY))
    current = target
  }

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', syncBounds, { passive: true })

  return true
}
