// Projects section — a pinned scroll story, tied 1:1 to scroll position so
// scrolling back restores every stage:
//   1. the "პროექტები" title fades + rises into the centre of the screen (big,
//      banner-title size) — it appears FIRST, on its own
//   2. as you keep scrolling you "pass" the title: it slides up to the top and
//      shrinks, and the 8 panels stagger in behind it — odd panels (1st, 3rd,…)
//      drop from the top, even panels rise from the bottom
//   3. the panels then scroll HORIZONTALLY; the pin releases the instant the
//      last panel reaches the edge (section height = viewport + exactly the pin
//      length), so there is no dead scroll past the last item
// Each panel image is over-sized and drifts on X (parallax) so it reads as
// anchored to the viewport while the panel window slides across it.
//
// House rules of this folder:
// - self-contained: smbls evals this fn WITHOUT module scope, so every helper/
//   const lives INSIDE the function.
// - idempotent: guarded by a dataset flag; returns true once initialised (poller
//   stops), false to retry in 50ms.
// - hide/animate at runtime only — the component renders fully visible.
export const setupProjectsEffect = () => {
  if (document.querySelector('[data-maketi-projects][data-maketi-projects-ready]')) return true

  const section = document.querySelector('[data-maketi-projects]:not([data-maketi-projects-ready])')
  if (!section) return false

  const sticky = section.querySelector('[data-maketi-projects-sticky]')
  const track = section.querySelector('[data-maketi-projects-track]')
  const title = section.querySelector('[data-maketi-projects-title]')
  const bar = section.querySelector('[data-maketi-projects-scrollbar]')
  const cta = section.querySelector('[data-maketi-projects-cta]')
  const bg = section.querySelector('[data-maketi-projects-bg]')
  const panels = Array.from(section.querySelectorAll('[data-maketi-project-panel]'))
  if (!sticky || !track || !panels.length) return false

  section.dataset.maketiProjectsReady = 'true'

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  // smootherstep — eases gently at BOTH ends (0 and 1), so the panels ease
  // off the screen edge and ease into place rather than snapping at either
  const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10)

  // per-panel lookups cached once — update() runs on every scroll event and
  // twenty querySelectors per frame is measurable churn
  const imgs = panels.map((p) => p.querySelector('[data-maketi-project-panel-image]'))
  const openTitle = section.querySelector('[data-maketi-projects-open-title]')

  // dashed separator lines, one centred in each C-gap between panels —
  // created here (pure decoration) and positioned every frame from the same
  // target math as the panels, so they ride the scroll AND the accordion.
  // They live on the STICKY (not the track) so they span its full height,
  // edge to edge; inserted before the title so they paint under it.
  let gapPx = 0
  const dividers = []
  for (let i = 1; i < panels.length; i++) {
    const d = document.createElement('div')
    d.setAttribute('aria-hidden', 'true')
    d.style.position = 'absolute'
    d.style.top = '0'
    d.style.bottom = '0'
    d.style.left = '0'
    d.style.width = '0'
    d.style.borderLeft = '1px dashed rgba(0, 0, 0, .8)'
    d.style.pointerEvents = 'none'
    d.style.opacity = '0'
    d.style.willChange = 'transform, opacity'
    sticky.insertBefore(d, title || sticky.firstChild)
    dividers.push(d)
  }

  // two motion modes, one shared curve each — the fixed-attachment
  // counter-translate only cancels when track, panels and images ease
  // IDENTICALLY, so the whole gallery always switches curves together:
  //  · scroll — NO transition at all: the writes are already 1:1 scroll-tied,
  //    and any easing between them reads as input lag on the horizontal drag
  //  · focus  — long, calm ease-in-out for the click accordion: it gathers
  //    softly, glides, and settles without a snap (the "elegant" open)
  const FOCUS_MS = 950
  const setMotion = (mode) => {
    if (reduce) return
    if (mode === 'focus') {
      const curve = `${FOCUS_MS}ms cubic-bezier(.65, 0, .13, 1)`
      track.style.transition = `transform ${curve}`
      panels.forEach((panel, i) => {
        panel.style.transition = `transform ${curve}, width ${curve}`
        // width/left too: the open panel's photo morphs from the 120vw
        // fixed-attachment slice to a panel-fitted frame on the same curve
        if (imgs[i]) imgs[i].style.transition = `transform ${curve}, width ${curve}, left ${curve}`
      })
      dividers.forEach((d) => {
        d.style.transition = `transform ${curve}, opacity 360ms ease`
      })
      if (openTitle) openTitle.style.transition = `transform ${curve}, opacity 360ms ease`
    } else {
      track.style.transition = ''
      panels.forEach((panel, i) => {
        panel.style.transition = ''
        if (imgs[i]) imgs[i].style.transition = ''
      })
      dividers.forEach((d) => {
        d.style.transition = 'opacity 360ms ease'
      })
      if (openTitle) openTitle.style.transition = 'opacity 360ms ease'
    }
  }
  if (!reduce) {
    if (title) title.style.transition = 'opacity 360ms ease'
    if (bar) bar.style.transition = 'opacity 360ms ease'
    setMotion('scroll')
  }

  // status badges (bottom-left of each panel): masked spans the component
  // renders — assign the mask + per-type fill here (check = mint, loading =
  // coralDark), resolving through the stashed files map like the arrows
  panels.forEach((panel) => {
    const badge = panel.querySelector('[data-maketi-panel-badge]')
    if (!badge) return
    const type = badge.dataset.maketiPanelBadge
    const file = (window.__maketiFiles || {})[type]
    if (!file) {
      badge.style.display = 'none'
      return
    }
    badge.style.webkitMaskImage = `url("${file.src}")`
    badge.style.maskImage = `url("${file.src}")`
    badge.style.background = type === 'check' ? '#7DF2AA' : 'var(--color-coralDark)'
  })

  // hover: only the shade lifts so the photo reads brighter
  panels.forEach((panel) => {
    panel.addEventListener('mouseenter', () => {
      const shade = panel.querySelector('[data-maketi-project-panel-shade]')
      if (shade) shade.style.opacity = '.35'
    })
    panel.addEventListener('mouseleave', () => {
      const shade = panel.querySelector('[data-maketi-project-panel-shade]')
      if (shade) shade.style.opacity = ''
    })
  })

  // per-panel image switcher (the ←/→ buttons the component renders, revealed
  // on the focused panel): cycles through the panel's data-maketi-project-images
  // list, resolving keys through the files map the component stashes on
  // window.__maketiFiles. Clicks must not bubble — the panel click toggles focus.
  panels.forEach((panel) => {
    const img = panel.querySelector('[data-maketi-project-panel-image]')
    const list = (panel.dataset.maketiProjectImages || '').split(',').filter(Boolean)
    if (!img || list.length < 2) return
    let idx = 0
    panel.querySelectorAll('[data-maketi-panel-nav]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation()
        const files = window.__maketiFiles || {}
        const dir = Number(btn.dataset.maketiPanelNav) || 1
        idx = (idx + dir + list.length) % list.length
        const file = files[list[idx]]
        if (file) img.src = file.src
      })

      // arrow glyph: masked span the component renders — assign its mask
      // from the files map here, and swap its fill to coralDark on hover
      // (the button's own fill clears at the same moment)
      const arrow = btn.querySelector('[data-maketi-panel-arrow]')
      if (arrow) {
        const file = (window.__maketiFiles || {})[btn.dataset.maketiPanelIcon]
        if (file) {
          arrow.style.webkitMaskImage = `url("${file.src}")`
          arrow.style.maskImage = `url("${file.src}")`
        }
        btn.addEventListener('mouseenter', () => {
          arrow.style.background = 'var(--color-coralDark)'
        })
        btn.addEventListener('mouseleave', () => {
          arrow.style.background = ''
        })
      }
    })
  })

  // click-to-focus accordion, flex-style — but scoped to the VISIBLE window,
  // not the whole track: the clicked panel takes a flex-10 share and the
  // panels around it flex-1 shares of one viewport (1 + 10 + 2 units fill the
  // screen exactly), while the rest of the ten stay off-screen — the gallery
  // keeps its "about four in view" framing. The track slides so the active
  // panel sits second from the left edge, clamped so no end-gap ever shows.
  // Moving the mouse OFF the active panel releases the focus.
  let focusedPanel = null
  let focusedAt = 0
  const FOCUS_UNITS = 16 // active panel's flex share; every companion gets 1
  const FOCUS_TOTAL = FOCUS_UNITS + 3 // one small before + two after in view
  const applyFocus = () => {
    panels.forEach((p, i) => {
      const open = focusedPanel === p
      // the image switcher lives on the open panel only
      const nav = p.querySelector('[data-maketi-project-panel-nav]')
      if (nav) {
        nav.style.opacity = open ? '1' : '0'
        nav.style.pointerEvents = open ? 'auto' : 'none'
      }
      // the status badge bows out while its panel is open
      const badge = p.querySelector('[data-maketi-panel-badge]')
      if (badge && badge.style.display !== 'none') badge.style.opacity = open ? '0' : ''
      // the OPEN panel's photo reframes to the panel itself (cover within the
      // real box) instead of the 120vw fixed-attachment slice — switching
      // through a project's photos must show each one properly, not a crop
      // of a viewport-sized render (portrait shots were badly cut)
      if (imgs[i]) {
        imgs[i].style.width = open ? '100%' : ''
        imgs[i].style.left = open ? '0' : ''
      }
      // the open panel's title (sticky-level element — see the section):
      // text + visibility here, position per frame in update()
      if (open && openTitle) openTitle.textContent = p.dataset.maketiProjectTitleText || ''
      if (!focusedPanel) {
        p.style.width = ''
        return
      }
      // the C-gaps between the three visible seams stay constant, so the
      // flex shares split what remains of the viewport after them
      const vw = window.innerWidth
      const small = vw ? (vw - 3 * gapPx) / FOCUS_TOTAL : 0
      const units = p === focusedPanel ? FOCUS_UNITS : 1
      p.style.width = small ? `${(units * small).toFixed(1)}px` : ''
    })
    // the title never shows here — it's revealed only AFTER the panel has
    // finished stretching (see scheduleTitle); this keeps it hidden on the
    // initial pass, on resize, and the instant a panel closes
    if (openTitle && !focusedPanel) openTitle.style.opacity = '0'
  }
  // the open title waits for the stretch to finish: hide it at once on any
  // focus change, then fade it in a beat after the accordion settles
  let titleTimer = 0
  const scheduleTitle = () => {
    window.clearTimeout(titleTimer)
    if (openTitle) openTitle.style.opacity = '0'
    if (focusedPanel) {
      titleTimer = window.setTimeout(() => {
        if (focusedPanel && openTitle) openTitle.style.opacity = '1'
      }, FOCUS_MS + 60)
    }
  }
  // every focus change runs on the calm focus curve, then hands the shared
  // transitions back to the quick scroll chase once the accordion has settled
  let motionTimer = 0
  const engageFocusMotion = () => {
    setMotion('focus')
    window.clearTimeout(motionTimer)
    motionTimer = window.setTimeout(() => setMotion('scroll'), FOCUS_MS + 100)
  }
  const releaseFocus = () => {
    focusedPanel = null
    focusedAt = performance.now() // widths animate back — hold the self-heal
    engageFocusMotion()
    applyFocus()
    scheduleTitle()
    update()
  }
  panels.forEach((panel) => {
    panel.addEventListener('click', () => {
      focusedPanel = focusedPanel === panel ? null : panel
      focusedAt = performance.now()
      engageFocusMotion()
      applyFocus()
      scheduleTitle()
      update()
    })
    panel.addEventListener('mouseleave', () => {
      // grace period: the click reshapes the row under the cursor and can
      // fire a spurious mouseleave mid-transition — ignore those
      if (focusedPanel === panel && performance.now() - focusedAt > FOCUS_MS + 150) releaseFocus()
    })
  })

  // pin geometry, recomputed on resize only (reading scrollWidth per scroll
  // frame forces a synchronous reflow):
  //   L1 — scroll spent bringing the title in and holding it centred
  //   L2 — scroll spent moving the title up while the panels stagger in
  //   maxX — how far the track overruns the viewport (the horizontal distance)
  //   L3 — scroll spent staggering the panels back OUT after the last item
  // section height = viewport + L1 + L2 + maxX + L3 makes it all 1:1.
  let L1 = 0
  let L2 = 0
  let L3 = 0
  let maxX = 0
  let thumbW = 0
  let titleH = 0
  let trackH = 0
  // the services exit-mask line: the first PageLines line (document
  // y = vh + k*700) at/below the services section bottom — the same line the
  // services content sinks under. The projects title POURS DOWN out of it.
  let maskLineDoc = 0
  const layout = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (!vw || !vh) return // no layout viewport yet — leave CSS min-height
    // root scale keeps rem-derived geometry in sync with the rendered design.
    const R = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16
    const rhythm = 700 * R
    L1 = vh * 0.5
    // longer appear/disappear runs — the panels travel over more scroll, so
    // the motion at the top (entrance) and bottom (exit) reads far gentler
    L2 = vh * 0.95
    L3 = vh * 0.95
    gapPx = parseFloat(getComputedStyle(track).columnGap) || 0
    // static C-width thumb — cached here: reading offsetWidth inside update()
    // lands after style writes and forces a synchronous reflow every scroll
    // event (a real jank source during the horizontal phase)
    thumbW = bar ? bar.offsetWidth : 0
    titleH = title ? title.offsetHeight : 0
    trackH = track.offsetHeight
    // the switcher buttons match the CTA's height exactly, measured (not
    // assumed) so padding/font changes on the CTA propagate automatically
    const ctaH = cta ? cta.offsetHeight : 0
    if (ctaH) {
      section.querySelectorAll('[data-maketi-panel-nav]').forEach((btn) => {
        btn.style.width = `${ctaH}px`
        btn.style.height = `${ctaH}px`
      })
    }
    maxX = Math.max(0, track.scrollWidth - vw)
    section.style.height = `${Math.round(vh + L1 + L2 + maxX + L3)}px`

    maskLineDoc = 0
    const services = document.querySelector('[data-maketi-services]')
    if (services) {
      let off = services
      let bottomDoc = services.offsetHeight
      while (off) { bottomDoc += off.offsetTop; off = off.offsetParent }
      maskLineDoc = vh + Math.max(1, Math.ceil((bottomDoc - vh) / rhythm)) * rhythm
    }
  }

  const update = () => {
    const vh = window.innerHeight
    const vw = window.innerWidth
    if (!vh || !vw) return // no layout viewport (e.g. background tab) — render as-is
    // root scale keeps rem-derived geometry in sync with the rendered design.
    const R = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16
    const rhythm = 700 * R
    const rect = section.getBoundingClientRect()

    // self-heal the pin length: track width can change after init (language
    // switch re-renders, image loads) and a stale maxX either overshoots into
    // empty space or cuts the last panel off (guarded write — no-op normally).
    // Skipped while a panel is focused AND for a beat after any focus change:
    // the accordion reshapes the track deliberately, and measuring the widths
    // MID-TRANSITION bakes a bogus maxX into the section height — the page
    // visibly lurches under the click.
    if (!focusedPanel && performance.now() - focusedAt > FOCUS_MS + 300) {
      const freshMaxX = Math.max(0, track.scrollWidth - vw)
      if (Math.abs(freshMaxX - maxX) > 1) {
        maxX = freshMaxX
        section.style.height = `${Math.round(vh + L1 + L2 + maxX + L3)}px`
      }
    }

    // scroll consumed inside the pin (0 before the section tops out, growing to
    // the full pin length as it scrolls through)
    const pin = L1 + L2 + maxX + L3
    const s = clamp(-rect.top, 0, pin)

    // phase progress
    const p1 = L1 > 0 ? clamp(s / L1, 0, 1) : 1 // title in
    const p2 = L2 > 0 ? clamp((s - L1) / L2, 0, 1) : 1 // title up + items in
    const p3 = maxX > 0 ? clamp((s - L1 - L2) / maxX, 0, 1) : 0 // horizontal
    const p4 = L3 > 0 ? clamp((s - L1 - L2 - maxX) / L3, 0, 1) : 0 // items out

    // --- title: POURS DOWN out of the services mask line — the same line the
    // services content sank under. It waits hidden ABOVE the line (everything
    // above the line is clipped), then slides down out of it to the centre
    // while the line sweeps up; the reveal edge IS the line. Once the line has
    // passed, the title is fully out and stays; p2 then climbs it to the top ---
    if (title) {
      if (reduce) {
        title.style.opacity = '1'
        title.style.transform = 'translate3d(0, -50%, 0)'
        title.style.clipPath = ''
        title.style.webkitClipPath = ''
      } else if (maskLineDoc) {
        const lineY = maskLineDoc - window.scrollY
        const h = titleH || vh * 0.28
        const restBottom = vh * 0.5 + h / 2
        // E: eased pour progress. At 0 the title hangs with its bottom ON the
        // line (fully swallowed above it); at 1 it rests at the centre.
        const E = 1 - Math.pow(1 - p1, 2)
        const fromLine = lineY - restBottom // offset that pins bottom to the line
        const scale = 0.96 + p1 * 0.04
        const tH = h * scale

        // on the way OUT, the mirror of the pour: as the panels leave, the
        // FOLLOWING page line sweeps up and the title sinks into it
        // bottom-first. The line alone can be up to a full 700px rhythm-step
        // away — not always enough travel within the exit — so the title also
        // SINKS toward the line (services-style), by exactly the shortfall,
        // making the swallow complete at pin end on any screen/rhythm phase.
        const p4StartScroll = window.scrollY + rect.top + L1 + L2 + maxX
        const exitLineDoc = vh + Math.ceil((p4StartScroll + vh * 0.5 + tH / 2 - vh) / rhythm) * rhythm
        const exitLineY = exitLineDoc - window.scrollY
        const lineYAtPinEnd = exitLineDoc - (p4StartScroll + L3)
        const restTop = vh * 0.5 - tH / 2
        const drop = Math.max(0, lineYAtPinEnd - restTop)
        const sink = p4 * drop

        const Y = (1 - E) * fromLine + sink
        // hidden until the pin engages (before it, the un-pinned sticky sits
        // lower and the anchor would parade the title through the viewport);
        // after the pour it STAYS, centred in the section — the panels sweep
        // over it and it peeks through the C-gaps between them
        title.style.opacity = rect.top <= 0 ? '1' : '0'
        title.style.transform = `translate3d(0, calc(-50% + ${Y.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`

        // clips, computed ANALYTICALLY from this frame's own transform
        // (untransitioned, so target == visual): measuring the rect here would
        // force a synchronous reflow on every scroll event — the biggest jank
        // source this section had. Above-cut = the pour-in; below-cut = the
        // exit swallow against the following line.
        const stickyTop = rect.top > 0 ? rect.top : (rect.bottom - vh < 0 ? rect.bottom - vh : 0)
        const tTop = stickyTop + vh * 0.5 + Y - tH / 2
        const above = clamp((lineY - tTop) / tH, 0, 1)
        const below = clamp((tTop + tH - exitLineY) / tH, 0, 1)
        const clip = `inset(${(above * 100).toFixed(2)}% 0 ${(below * 100).toFixed(2)}% 0)`
        title.style.clipPath = clip
        title.style.webkitClipPath = clip
      } else {
        // no services section on the page — plain fade + rise fallback,
        // resting centred behind the panels
        const rise = (1 - p1) * 40 * R
        const scale = 0.96 + p1 * 0.04
        title.style.opacity = p1.toFixed(3)
        title.style.transform = `translate3d(0, calc(-50% + ${rise.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`
        title.style.clipPath = ''
        title.style.webkitClipPath = ''
      }
    }

    // --- panels: stagger in during p2, left→right, alternating top/bottom.
    // They slide in from FULLY off-screen at full opacity, so each panel
    // physically sweeps over the big title and clips it as it passes.
    // The reveal is layered for depth: the panel decelerates in on an
    // ease-out curve with a slight settling tilt, while the image inside
    // starts zoomed + counter-drifted and relaxes to rest a beat behind the
    // frame — the classic editorial "window slides over the photo" reveal.
    // The caption lands last, once its panel has essentially settled.
    // panel TARGET geometry, shared by the images and the track write below.
    // Everything is computed from targets (track target + target widths of
    // the panels before), never from mid-transition measurements: the images
    // and the panels ride IDENTICAL 520ms curves, so the counter-translate
    // cancels the panel motion at every frame — true background-attachment:
    // fixed behaviour through both the scroll glide and the click accordion.
    const smallW = (vw - 3 * gapPx) / FOCUS_TOTAL
    const activeW = smallW * FOCUS_UNITS
    const stride = smallW + gapPx
    const focusIdx = focusedPanel ? panels.indexOf(focusedPanel) : -1
    let trackTargetX
    if (focusIdx >= 0) {
      // the active panel sits one small-panel (plus its gap) in from the left
      // edge, clamped so neither track end leaves a hole
      const focusTrackW = activeW + (panels.length - 1) * stride
      trackTargetX = clamp(stride - focusIdx * stride, vw - focusTrackW, 0)
    } else {
      trackTargetX = -p3 * maxX
    }
    const targetLeft = (i) => {
      // parked panel width is 23.4rem in the CSS; derive the same px from the
      // root scale so the effect math matches the rendered panel.
      if (focusIdx < 0) return trackTargetX + i * (374.4 * R + gapPx)
      const before = (i > focusIdx ? (i - 1) * smallW + activeW : i * smallW) + i * gapPx
      return trackTargetX + before
    }

    const SPREAD = 0.45
    const step = panels.length > 1 ? SPREAD / (panels.length - 1) : 0
    panels.forEach((panel, i) => {
      const img = imgs[i]

      // glue the photo slice to the viewport, centred: the panel is a window
      // sliding over a stationary image. The slice is 108rem wide anchored at
      // -18rem, so the centring offset is vw/2 - 576*R. Far off-screen panels
      // pin to a clamped crop so the image never chases them across multiple
      // screens.
      const tl = clamp(targetLeft(i), -vw * 0.3, vw)
      const tx = vw / 2 - 576 * R - tl

      if (reduce) {
        panel.style.transform = ''
        if (img) img.style.transform = `translate3d(${tx.toFixed(1)}px, 0, 0)`
        return
      }

      const dir = i % 2 === 0 ? -1 : 1 // odd (index 0,2,…) from top; even from bottom

      // "away" is how far the panel is from its parked state, 1 → fully off.
      // Entrance (p2): flies in on an ease-out — fast approach, soft landing.
      // Exit (p4): the mirror image — soft launch, accelerating away (ease-in),
      // same left→right stagger, each panel leaving the way it came in.
      let away
      if (p4 > 0) {
        const local = clamp((p4 - i * step) / (1 - SPREAD), 0, 1)
        away = smooth(local)
      } else {
        const local = clamp((p2 - i * step) / (1 - SPREAD), 0, 1)
        away = smooth(1 - local)
      }

      // +80px cushion: at rest the panel must sit FULLY outside the sticky —
      // at a bare ±vh its edge (and any rotated corner) grazes the viewport
      // line and pokes into the sticky's visible strip while the section is
      // still approaching (seen as slivers over the services section)
      const offset = away * dir * (vh + 80 * R)
      // tilt peaks mid-flight and is zero at BOTH ends, so the parked and the
      // waiting panel are perfectly axis-aligned (no protruding corners)
      const tilt = Math.sin((1 - away) * Math.PI) * dir * 3 // deg
      panel.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`

      if (img) {
        if (panel === focusedPanel) {
          // panel-fitted framing while open (see applyFocus) — no anchor
          img.style.transform = 'translate3d(0, 0, 0)'
        } else {
          // zoom-out reveal + vertical lag: the photo trails its frame slightly
          // (depth), arriving at scale 1 exactly as the panel parks
          const zoom = 1 + away * 0.4
          const ty = away * dir * -(vh * 0.15)
          img.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${zoom.toFixed(3)})`
        }
      }

    })

    // --- open-panel title: anchored to the open panel's LEFT side (a C-gap
    // inset) and straddling its bottom edge (half over the photo, half
    // outside on the cream) — sticky-level, since the panel clips overflow ---
    if (openTitle && focusIdx >= 0) {
      const lx = targetLeft(focusIdx) + gapPx
      const edgeY = (vh + trackH) / 2 // the track is centred → its bottom edge
      openTitle.style.transform = `translate3d(${lx.toFixed(1)}px, ${edgeY.toFixed(1)}px, 0) translate(0, -50%)`
    }

    // --- dashed separators: one parked in the middle of each gap, computed
    // from the same targets so they stay centred through the scroll AND the
    // accordion; they fade in once the panels settle and leave with the exit.
    // (Sticky coordinates — targetLeft already includes the track's travel.) ---
    const divOp = clamp((p2 - 0.35) / 0.65, 0, 1) * (1 - p4)
    dividers.forEach((d, k) => {
      const x = targetLeft(k + 1) - gapPx / 2
      d.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
      d.style.opacity = divOp.toFixed(3)
    })

    // --- cream backdrop: on only while the panels own the screen, so the
    // page's line rhythm shows before the gallery and after it leaves ---
    if (bg) {
      const bgOp = clamp(p2 * 1.6, 0, 1) * (1 - clamp((p4 - 0.6) / 0.4, 0, 1))
      bg.style.opacity = bgOp.toFixed(3)
    }

    // --- horizontal scroll: ends exactly at the last panel (no dead scroll);
    // while focused the accordion target computed above takes over ---
    track.style.transform = `translate3d(${trackTargetX.toFixed(1)}px, 0, 0)`

    // --- horizontal scrollbar: fixed C-width thumb (styled in the component)
    // travelling edge to edge, appears once the panels are in; pointless (and
    // misleading) while the accordion has the whole track on screen ---
    if (bar) {
      // the square spins as it travels — one full turn across the whole
      // horizontal run, tied 1:1 to scroll so it winds back on reverse
      const spin = p3 * 360
      bar.style.transform = `translate3d(${((vw - thumbW) * p3).toFixed(1)}px, 0, 0) rotate(${spin.toFixed(1)}deg)`
      bar.style.opacity = maxX > 0 && !focusedPanel ? (p2 * (1 - p4)).toFixed(3) : '0'
    }

    // --- the section CTA appears WITH the panels: fades/slides in over the
    // entrance stagger, leaves with the exit (scroll-tied both ways) ---
    if (cta) {
      const on = p2 * (1 - p4)
      cta.style.opacity = on.toFixed(3)
      cta.style.transform = `translate3d(0, ${((1 - on) * -16 * R).toFixed(1)}px, 0)`
      cta.style.pointerEvents = on > 0.5 ? 'auto' : 'none'
    }

    // fixed page chrome (navbar, logo) must not pop back in while the pinned
    // gallery fills the screen — their show-on-scroll-up handlers check this
    const pinned = rect.top <= 0 && rect.bottom >= vh
    window.__maketiProjectsPinned = pinned

    // the chat bubble has no scroll handler of its own — hide it here while
    // the gallery owns the screen (guarded writes, no-ops on most frames)
    const chat = document.querySelector('[data-maketi-chat]')
    if (chat) {
      const op = pinned ? '0' : ''
      if (chat.style.opacity !== op) {
        chat.style.opacity = op
        chat.style.pointerEvents = pinned ? 'none' : ''
      }
    }
  }

  // let the navbar jump straight to the assembled-gallery state — the end of
  // the title/stagger-in phases (s = L1 + L2), where the panels are fully in
  // and the horizontal drag hasn't started — instead of the empty section top
  window.__maketiScrollToProjects = () => {
    const rect = section.getBoundingClientRect()
    const target = window.scrollY + rect.top + L1 + L2
    window.scrollTo({ top: Math.round(target), behavior: 'smooth' })
  }

  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', () => {
    layout()
    if (focusedPanel) applyFocus() // px-based focus widths must track vw
    update()
  }, { passive: true })
  layout()
  applyFocus() // initial pass: title + switchers hidden, badges shown
  update()

  return true
}
