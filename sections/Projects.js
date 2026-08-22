import { setupProjectsEffect } from '../effects/index.js'

export const Projects = {
  tag: 'section',
  id: 'projects',

  // the effect body is inlined into this onInit at bundle time.
  onInit: () => {
    if (typeof window === 'undefined') return
    const poll = () => {
      if (!setupProjectsEffect()) window.setTimeout(poll, 50)
    }
    poll()
  },

  position: 'relative',
  zIndex: '0',
  width: '100%',
  minHeight: '100vh',
  margin: 'C - - -',
  // transparent so the PageLines rhythm stays visible around the gallery —
  // the cream backdrop lives on Sticky.Bg and only fades in WITH the panels
  background: 'transparent',
  color: 'black',
  'data-maketi-projects': 'true',

  Sticky: {
    position: 'sticky',
    top: '0',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flow: 'y',
    // flex-start on the cross axis: the track is wider than the viewport and
    // must START at the left edge — centering it leaves half the track
    // off-screen left and a matching empty gap at the end of the scroll
    align: 'flex-start center',
    'data-maketi-projects-sticky': 'true',

    // cream backdrop for the gallery: first child (paints under everything in
    // the sticky), faded in by the effect only while the panels are on screen
    // so the page's line rhythm around the section is never painted over
    Bg: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'cream',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 360ms ease',
      willChange: 'opacity',
      'data-maketi-projects-bg': 'true'
    },

    Title: {
      tag: 'h2',
      text: '{{ section.projects }}',
      position: 'absolute',
      top: '50%',
      left: '0',
      zIndex: '0',
      width: '100%',
      margin: '0',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      color: 'black',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'K1+I2',
      fontWeight: '400',
      lineHeight: '.9',
      letterSpacing: '-0.01em',
      opacity: '0',
      transform: 'translate3d(0, -50%, 0)',
      transformOrigin: 'center center',
      willChange: 'transform, opacity',
      'data-maketi-projects-title': 'true'
    },

    Track: {
      position: 'relative',
      zIndex: '1',
      display: 'flex',
      flow: 'x',
      align: 'center',
      gap: 'C',
      style: {
        // D1 of air between the panels and the section's top/bottom edges
        // (still capped at 64rem on very tall screens). Lives in style:{} —
        // the top-level prop parser drops min(calc(var())) values silently.
        height: 'min(calc(100vh - var(--spacing-D1) * 2), 64rem)'
      },
      padding: '0',
      willChange: 'transform',
      'data-maketi-projects-track': 'true',

      childExtends: 'ProjectPanel',
      childrenAs: 'state',
      children: (el, state) => state.projects.panels
    },

    // the OPEN panel's project title: centred on the panel horizontally and
    // straddling its bottom edge (half outside the photo) — lives on the
    // sticky because the panel itself clips overflow. The effect supplies
    // text, position and visibility.
    OpenTitle: {
      tag: 'h3',
      position: 'absolute',
      left: '0',
      top: '0',
      zIndex: '3',
      margin: '0',
      whiteSpace: 'nowrap',
      color: 'coralDark',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'F',
      fontWeight: '400',
      lineHeight: '1',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 360ms ease',
      willChange: 'transform, opacity',
      'data-maketi-projects-open-title': 'true'
    },

    // the section's own CTA (same look as the navbar one): pinned to the
    // top-right corner of the gallery, revealed by the effect together with
    // the project panels
    Cta: {
      tag: 'a',
      href: '#home',
      position: 'absolute',
      top: 'A',
      right: 'A',
      zIndex: '4',
      flow: 'x',
      align: 'center',
      gap: 'Y1',
      textDecoration: 'none',
      color: 'black',
      cursor: 'pointer',
      background: 'coralDark',
      padding: 'Z A2',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'coralDark',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 420ms ease, transform 520ms cubic-bezier(.19, 1, .22, 1), background 300ms ease, color 300ms ease',
      willChange: 'opacity, transform',
      // hover: fill clears and the whole lockup (label, plus, ring — the ring
      // rides currentColor) turns coralDark
      ':hover': {
        background: 'transparent',
        color: 'coralDark'
      },
      'data-maketi-projects-cta': 'true',

      Icon: {
        tag: 'span',
        display: 'flex',
        align: 'center center',
        justifyContent: 'center',
        boxSize: 'A1 A1',
        flexShrink: '0',
        borderRadius: '50%',
        borderStyle: 'solid',
        borderWidth: '1px',
        // currentColor: black at rest, coralDark on CTA hover — the ring
        // always matches the text
        borderColor: 'currentColor',
        transition: 'border-color 300ms ease',
        lineHeight: '1',

        Plus: {
          tag: 'span',
          text: '+',
          fontFamily: 'sans-serif',
          fontSize: 'B',
          fontWeight: '400',
          lineHeight: '1'
        }
      },

      Label: {
        tag: 'span',
        text: '{{ nav.home }}',
        fontFamily: 'ALKTallMtavruli',
        fontSize: 'B',
        fontWeight: '400',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }
    },

    // horizontal scroll progress — same thumb language as ScrollbarLine; sits
    // exactly B below the panels' bottom edge (which is D1 above the section
    // edge); the effect drives position/opacity
    Scrollbar: {
      position: 'absolute',
      left: '0',
      style: {
        // calc(var()) — must live in style:{}, the top-level prop parser
        // drops such values silently. Subtract the square thumb height so its
        // top still sits B below the panels' bottom edge.
        bottom: 'calc(var(--spacing-D1) - var(--spacing-B) - 0.4375rem)'
      },
      zIndex: '3',
      // same square as the page ScrollbarLine (0.4375rem)
      width: '0.4375rem',
      height: '0.4375rem',
      background: 'coralDark',
      opacity: '0',
      pointerEvents: 'none',
      willChange: 'transform, opacity',
      'data-maketi-projects-scrollbar': 'true'
    }
  }
}
