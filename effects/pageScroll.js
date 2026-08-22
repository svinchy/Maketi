// Page scroll effect, tied 1:1 to scroll position (scrolling back restores):
// - the orange rectangle shrinks bottom -> top (top edge stays put)
// - the black house drifts down slower than the page + swells slightly,
//   so it floats behind like a deep parallax layer, fading out as it goes
//   (fully gone ~70% into the range)
// - the "მაკეტი" title parallaxes down and gets cut off by the bottom
//   horizontal page line (the first PageLines line at 100vh): whatever part
//   of the title sinks below that line is clipped, so it disappears into it
// - the showcase tagline clips away bottom -> top first (done by mid-range),
//   then disappears entirely
//
// House rules of this folder:
// - fully self-contained: smbls serializes this function and evals it without
//   module scope, so every helper/const must live INSIDE the function.
// - idempotent: guarded by a dataset flag; returns true when initialised so
//   the component onInit poller stops retrying, false to retry in 50ms.
// - hide/animate at runtime only — the component renders fully visible, so if
//   the effect never runs the page still looks fine.
export const setupPageScrollEffect = () => {
  // already initialised — report done so the poller stops retrying
  if (document.body.dataset.maketiPageScrollReady) return true

  if (
    !document.querySelector('[data-maketi-orange-rectangle]') ||
    !document.querySelector('[data-maketi-house]') ||
    !document.querySelector('[data-maketi-title]') ||
    !document.querySelector('[data-maketi-tagline]')
  ) return false

  document.body.dataset.maketiPageScrollReady = 'true'

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return true // leave the page exactly as rendered

  // fully collapsed once this fraction of the viewport has been scrolled
  const RANGE = 0.85

  const update = () => {
    // the intro animates these same elements (grow-in etc.) — don't fight it
    if (document.documentElement.dataset.maketiIntroActive === 'true') return

    // query fresh EVERY pass: domql re-renders (language switch, state
    // changes) replace these nodes, so cached references go stale after a
    // while and the effect silently dies writing to detached elements
    const rectangle = document.querySelector('[data-maketi-orange-rectangle]')
    const house = document.querySelector('[data-maketi-house]')
    const title = document.querySelector('[data-maketi-title]')
    const tagline = document.querySelector('[data-maketi-tagline]')
    const shadow = document.querySelector('[data-maketi-house-shadow]')
    const lang = document.querySelector('[data-maketi-lang]')
    if (!rectangle || !house || !title || !tagline) return

    // re-assert the inline setup per node (guarded, so it's a no-op most
    // frames): the intro leaves laggy transitions inline, and re-rendered
    // nodes come back with plain class styling
    if (rectangle.style.transition !== 'none') {
      rectangle.style.transition = 'none'
      rectangle.style.transformOrigin = 'top center'
      rectangle.style.willChange = 'transform'
    }
    if (house.style.transition !== 'none') {
      house.style.transition = 'none'
      house.style.willChange = 'transform'
    }
    if (title.style.willChange !== 'transform') title.style.willChange = 'transform'
    if (tagline.style.transition !== 'none') tagline.style.transition = 'none'

    const vh = window.innerHeight
    const progress = Math.min(1, Math.max(0, window.scrollY / (vh * RANGE)))
    rectangle.style.transform = `scale(1, ${(1 - progress).toFixed(4)})`

    // parallax: both lag behind the page (translate down a fraction of the
    // scroll), at different rates so they separate into depth layers
    const y = Math.min(window.scrollY, vh)
    house.style.transform = `translate3d(0, ${(y * 0.45).toFixed(1)}px, 0) scale(${(1 + progress * 0.06).toFixed(4)})`
    house.style.opacity = (1 - Math.min(1, progress / 0.7)).toFixed(3)
    if (shadow) {
      // fade with the house; opacity only — the intro hands the shadow's
      // transform/transition back to class styles after it finishes
      if (shadow.style.transition !== 'none') shadow.style.transition = 'none'
      shadow.style.opacity = house.style.opacity
    }

    // lang switcher disappears immediately on scroll — fully gone within the
    // first few px; opacity only (it relies on its own class transforms/
    // transitions — don't touch those). Unclickable once invisible.
    if (lang) {
      const gone = Math.min(1, window.scrollY / 60)
      lang.style.opacity = (1 - gone).toFixed(3)
      lang.style.pointerEvents = gone >= 1 ? 'none' : ''
    }
    title.style.transform = `translate3d(0, ${(y * 0.7).toFixed(1)}px, 0)`

    // cut the title off at the bottom horizontal page line (document y = 1vh,
    // so viewport y = vh - scrollY): the title drifts down while the line
    // rides up, and everything below the line is clipped away — the title
    // sinks into the line. Measure AFTER this frame's transform is set.
    const lineY = vh - window.scrollY
    const tRect = title.getBoundingClientRect()
    const below = tRect.height > 0
      ? Math.min(1, Math.max(0, (tRect.bottom - lineY) / tRect.height))
      : 0
    const titleClip = `inset(0 0 ${(below * 100).toFixed(2)}% 0)`
    title.style.clipPath = titleClip
    title.style.webkitClipPath = titleClip

    // tagline, two steps: the bottom -> top wipe runs over the first half of
    // the range; once fully clipped it disappears outright (and the reverse
    // on the way back up: reappears, then un-wipes)
    const wipe = Math.min(1, progress / 0.5)
    const clip = `inset(0 0 ${(wipe * 100).toFixed(2)}% 0)`
    tagline.style.clipPath = clip
    tagline.style.webkitClipPath = clip
    tagline.style.visibility = wipe >= 1 ? 'hidden' : ''
  }

  // update runs directly on the event — NOT rAF-scheduled: rAF is throttled or
  // suspended in background tabs, which strands the scheduled flag and kills
  // the effect permanently (house rule: no rAF gating in effects)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
  update()

  return true
}
