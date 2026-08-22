// Footer scroll effect, tied 1:1 to scroll position (scrolling back restores),
// same mechanics as the banner showcase rectangle in pageScroll.js:
// - the coralDark rectangle scales from its pinned top edge — grows top→bottom
//   as the section scrolls in, shrinks back bottom→top on the way up
// - the crane image is a fixed-attachment emulation: the sheet inside the
//   clipping frame is pinned to the viewport (translate = -frame.top)
// - the title parallaxes sharply against the scroll, is cut off by the nearest
//   horizontal page line, and — once the footer scrolls into view — writes in
//   letter by letter with the same hollow-stroke-then-fill treatment as the
//   banner title in intro.js
//
// House rules of this folder:
// - fully self-contained: smbls serializes this function and evals it without
//   module scope, so every helper/const must live INSIDE the function.
// - idempotent: guarded by a dataset flag; returns true when initialised so
//   the component onInit poller stops retrying, false to retry in 50ms.
// - hide/animate at runtime only — the component renders fully visible, so if
//   the effect never runs the page still looks fine.
export const setupFooterEffect = () => {
  // already initialised — report done so the poller stops retrying
  if (document.body.dataset.maketiFooterReady) return true

  if (
    !document.querySelector('[data-maketi-footer]') ||
    !document.querySelector('[data-maketi-footer-accent]') ||
    !document.querySelector('[data-maketi-footer-title]')
  ) return false

  document.body.dataset.maketiFooterReady = 'true'

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return true // leave the section exactly as rendered

  // fully grown once this fraction of the viewport has been entered
  const RANGE = 0.85
  const EASE = 'cubic-bezier(.19, 1, .22, 1)' // same write-in ease as intro.js

  const setClip = (el, v) => {
    el.style.clipPath = v
    el.style.webkitClipPath = v
  }

  // ── letter-by-letter write-in (mirrors the banner title in intro.js) ──────
  // domql keeps a reference to the title's ORIGINAL text node for language
  // switches — destroying it kills reactivity. Like about.js: the node is
  // MOVED into a visually hidden holder, and the visible letters are a
  // rebuilt mirror of it.
  let played = false
  let gen = 0 // invalidates in-flight write-in timers on reset/replay

  const renderLetters = (title) => {
    let holder = title.querySelector('[data-maketi-footer-title-source]')
    if (!holder) {
      const src = Array.from(title.childNodes).find(
        (n) => n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()
      )
      if (!src) return
      holder = document.createElement('span')
      holder.setAttribute('data-maketi-footer-title-source', 'true')
      holder.style.position = 'absolute'
      holder.style.width = '1px'
      holder.style.height = '1px'
      holder.style.overflow = 'hidden'
      holder.style.clipPath = 'inset(50%)'
      holder.style.whiteSpace = 'nowrap'
      title.insertBefore(holder, src)
      holder.appendChild(src)
    }
    const text = (holder.textContent || '').trim()
    const old = title.querySelector('[data-maketi-footer-letters]')
    if (old) {
      if (old.dataset.maketiText === text) return
      old.remove()
    }
    const mirror = document.createElement('span')
    mirror.setAttribute('data-maketi-footer-letters', 'true')
    mirror.setAttribute('aria-hidden', 'true')
    mirror.dataset.maketiText = text
    Array.from(text).forEach((ch) => {
      const span = document.createElement('span')
      span.textContent = ch
      span.style.display = 'inline-block'
      // hidden until the write-in plays; already-played rebuilds (language
      // switch) come back fully visible
      if (!played) setClip(span, 'inset(100% 0 0 0)')
      mirror.appendChild(span)
    })
    title.appendChild(mirror)
  }

  const playLetters = (title) => {
    played = true
    const g = ++gen
    const mirror = title.querySelector('[data-maketi-footer-letters]')
    if (!mirror) return
    const letters = Array.from(mirror.children)
    // hollow stroke while the letters write in; the solid fill follows
    title.style.webkitTextStroke = '1px #000000'
    title.style.webkitTextFillColor = 'transparent'
    letters.forEach((span) => { span.style.transition = `clip-path 650ms ${EASE}` })
    void mirror.offsetWidth // commit the transitions before the first reveal
    letters.forEach((span, i) => {
      window.setTimeout(() => { if (g === gen) setClip(span, 'inset(0 0 0 0)') }, i * 140)
    })
    const fillAt = letters.length * 140 + 450
    window.setTimeout(() => {
      if (g !== gen) return
      title.style.transition = '-webkit-text-fill-color 1200ms ease'
      title.style.webkitTextFillColor = '#000000'
    }, fillAt)
    // hand the title back to plain styling once the fill has settled
    window.setTimeout(() => {
      if (g !== gen) return
      title.style.webkitTextStroke = ''
      title.style.webkitTextFillColor = ''
      title.style.transition = ''
    }, fillAt + 1300)
  }

  // scrolled back away from the footer: shut the letters again so the
  // write-in replays on the next approach
  const resetLetters = (title) => {
    played = false
    gen++
    title.style.webkitTextStroke = ''
    title.style.webkitTextFillColor = ''
    title.style.transition = ''
    const mirror = title.querySelector('[data-maketi-footer-letters]')
    if (!mirror) return
    Array.from(mirror.children).forEach((span) => {
      span.style.transition = 'none'
      setClip(span, 'inset(100% 0 0 0)')
    })
  }

  const update = () => {
    // query fresh EVERY pass: domql re-renders (language switch, state
    // changes) replace these nodes, so cached references go stale
    const section = document.querySelector('[data-maketi-footer]')
    const accent = document.querySelector('[data-maketi-footer-accent]')
    const title = document.querySelector('[data-maketi-footer-title]')
    const frame = document.querySelector('[data-maketi-footer-img]')
    const sheet = document.querySelector('[data-maketi-footer-img-sheet]')
    if (!section || !accent || !title) return

    // re-assert the inline setup per node (guarded, so it's a no-op most
    // frames): re-rendered nodes come back with plain class styling
    if (accent.style.transition !== 'none') {
      accent.style.transition = 'none'
      accent.style.transformOrigin = 'top center'
      accent.style.willChange = 'transform'
    }
    if (title.style.willChange !== 'transform') title.style.willChange = 'transform'
    if (sheet && sheet.style.willChange !== 'transform') sheet.style.willChange = 'transform'

    renderLetters(title)

    const vh = window.innerHeight
    const sr = section.getBoundingClientRect()
    // root scale keeps the px constants aligned with rem-based layout values.
    const R = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16

    // 1:1 with scroll, like the showcase rectangle but anchored to the page
    // end: the last RANGE of a viewport of scrolling drives the growth, so it
    // is still visibly increasing while the user scrolls down and shrinking
    // the moment they scroll back up — full exactly at the page bottom
    const maxScroll = document.documentElement.scrollHeight - vh
    const progress = Math.min(1, Math.max(0, 1 - (maxScroll - window.scrollY) / (vh * RANGE)))
    accent.style.transform = `scale(1, ${progress.toFixed(4)})`

    // the contact details live INSIDE the scaling rectangle: counter-scale
    // them with the inverse vertical scale so they stay crisp instead of squashed,
    // riding the rectangle's growing bottom edge, and fade them in while it
    // grows
    const contact = document.querySelector('[data-maketi-footer-contact]')
    if (contact) {
      if (contact.style.transition !== 'none') {
        contact.style.transition = 'none'
        contact.style.transformOrigin = 'bottom right'
        contact.style.willChange = 'transform, opacity'
      }
      const inv = 1 / Math.max(progress, 0.125)
      contact.style.transform = `scale(1, ${inv.toFixed(4)})`
      // late reveal: only as the rectangle is finishing its growth
      contact.style.opacity = Math.min(1, Math.max(0, (progress - 0.75) / 0.2)).toFixed(3)
    }

    // background-attachment:fixed, emulated: the sheet inside the clipping
    // frame is pinned to the viewport by cancelling the frame's own movement
    // 1:1, so the frame slides over a crane that stays put on screen — the
    // classic fixed-window parallax
    if (frame && sheet) {
      const ft = frame.getBoundingClientRect().top
      sheet.style.transform = `translate3d(0, ${(-ft).toFixed(2)}px, 0)`
    }

    // the title mirrors the banner title: a sharp parallax drift, cut off by
    // the nearest horizontal page line (they repeat every 700px from 100vh) —
    // it emerges out of the line scrolling down, sinks back into it scrolling
    // up. Measure AFTER this frame's transform is set.
    const centre = (sr.top + sr.height / 2 - vh / 2) / vh
    const ty = -centre * 300 * R
    title.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`
    const tRect = title.getBoundingClientRect()
    const staticTop = tRect.top + window.scrollY - ty
    const lineGap = 700 * R // PageLines repeats every 43.75rem
    const k = Math.floor((staticTop + tRect.height / 2 - vh) / lineGap)
    const lineY = vh + k * lineGap - window.scrollY
    // the 28px pad lets the title clear the line completely at the bottom of
    // the page (its resting top edge sits a hair above the line)
    const above = tRect.height > 0
      ? Math.min(1, Math.max(0, (lineY - tRect.top - 28 * R) / tRect.height))
      : 0
    const titleClip = `inset(${(above * 100).toFixed(2)}% 0 0 0)`
    title.style.clipPath = titleClip
    title.style.webkitClipPath = titleClip

    // the letters write in one by one the moment the TITLE itself becomes
    // visible (not earlier — the user has to actually see the write-in), and
    // re-arm once it is fully below the viewport again so every approach
    // replays it, like the banner title does on every page load
    if (!played && tRect.top < vh * 0.9) playLetters(title)
    else if (played && tRect.top > vh * 1.1) resetLetters(title)
  }

  // language switches write into the holder's text node — rebuild the letter
  // mirror when that happens (renderLetters no-ops when the text is unchanged)
  const section = document.querySelector('[data-maketi-footer]')
  const observer = new MutationObserver(update)
  observer.observe(section, { childList: true, subtree: true, characterData: true })

  // update runs directly on the event — NOT rAF-scheduled: rAF is throttled or
  // suspended in background tabs, which strands the scheduled flag and kills
  // the effect permanently (house rule: no rAF gating in effects)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
  update()

  return true
}
