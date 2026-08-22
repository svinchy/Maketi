export const setupAboutEffect = () => {
  // already initialised — report done so any pollers stop retrying
  if (document.querySelector('[data-maketi-about][data-maketi-about-ready]')) return true

  const section = document.querySelector('[data-maketi-about]:not([data-maketi-about-ready])')
  if (!section) return false

  const intro = section.querySelector('[data-maketi-about-intro]')
  const goal = section.querySelector('[data-maketi-about-goal]')
  if (!intro || !goal) return false

  section.dataset.maketiAboutReady = 'true'

  // wave = pure CSS keyframes (runs without JS per frame, survives background
  // tabs); each character gets a staggered delay so the bob travels across the
  // line like a wave
  if (!document.getElementById('maketi-about-wave-style')) {
    const style = document.createElement('style')
    style.id = 'maketi-about-wave-style'
    style.textContent =
      '@keyframes maketiAboutWave{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-0.16em,0)}}' +
      '[data-maketi-wave-char]{display:inline-block;animation:maketiAboutWave 2.8s ease-in-out infinite}' +
      '@media (prefers-reduced-motion: reduce){[data-maketi-wave-char]{animation:none}}'
    document.head.appendChild(style)
  }

  // domql keeps a reference to the paragraph's ORIGINAL text node and writes
  // language switches into it — destroying it (textContent = '') silently
  // kills reactivity. So the node is MOVED (same object) into a visually
  // hidden holder that domql keeps updating; the visible wave chars are a
  // rebuilt mirror of it. The holder is also what screen readers get.
  const initHolder = (p) => {
    if (p.querySelector('[data-maketi-wave-source]')) return true
    const src = Array.from(p.childNodes).find(
      (n) => n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()
    )
    if (!src) return false
    const holder = document.createElement('span')
    holder.setAttribute('data-maketi-wave-source', 'true')
    holder.style.position = 'absolute'
    holder.style.width = '1px'
    holder.style.height = '1px'
    holder.style.overflow = 'hidden'
    holder.style.clipPath = 'inset(50%)'
    holder.style.whiteSpace = 'nowrap'
    p.insertBefore(holder, src)
    holder.appendChild(src)
    return true
  }

  // rebuild the visible wave mirror from the holder's current text: word
  // wrappers (inline-block + nowrap so line wrapping still happens between
  // words) holding per-character spans with staggered delays
  const lastText = new WeakMap()
  const render = (p) => {
    initHolder(p)
    const holder = p.querySelector('[data-maketi-wave-source]')
    if (!holder) return
    const text = (holder.textContent || '').trim()
    if (!text || lastText.get(p) === text) return
    lastText.set(p, text)
    const old = p.querySelector('[data-maketi-wave-text]')
    if (old) old.remove()
    const wave = document.createElement('span')
    wave.setAttribute('data-maketi-wave-text', 'true')
    wave.setAttribute('aria-hidden', 'true')
    let charIndex = 0
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return
      if (/^\s+$/.test(part)) {
        wave.appendChild(document.createTextNode(' '))
        return
      }
      const word = document.createElement('span')
      word.style.display = 'inline-block'
      word.style.whiteSpace = 'nowrap'
      for (const ch of part) {
        const span = document.createElement('span')
        span.setAttribute('data-maketi-wave-char', 'true')
        span.textContent = ch
        span.style.animationDelay = `${(charIndex * 0.05).toFixed(2)}s`
        word.appendChild(span)
        charIndex++
      }
      wave.appendChild(word)
    })
    p.appendChild(wave)
  }
  render(intro)
  render(goal)

  // language switches write into the holder's text node (characterData) — or,
  // if domql ever replaces the children wholesale, childList fires and the
  // holder is rebuilt; the lastText guard keeps our own writes from looping
  const observer = new MutationObserver(() => {
    render(intro)
    render(goal)
  })
  observer.observe(section, { childList: true, subtree: true, characterData: true })

  // parallax: the two paragraphs drift at different rates (and directions) as
  // the section crosses the viewport — GPU transform only, on the paragraph
  // elements themselves (the wave animates the char spans, so they don't fight)
  const update = () => {
    const vh = window.innerHeight
    const sr = section.getBoundingClientRect()
    // root scale: 1 at the 1440px reference width (root font-size is
    // vw-driven, so the drift amounts scale with the design)
    const R = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16
    // signed progress: +1 when the section centre is a viewport below the
    // viewport centre, 0 when centred, negative when scrolled past
    const progress = (sr.top + sr.height / 2 - vh / 2) / vh
    intro.style.transform = `translate3d(0, ${(progress * 60 * R).toFixed(2)}px, 0)`
    goal.style.transform = `translate3d(0, ${(-progress * 110 * R).toFixed(2)}px, 0)`
  }

  // direct on the event — no rAF throttle (suspended in background tabs, adds
  // a frame of lag)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
  update()

  return true
}
