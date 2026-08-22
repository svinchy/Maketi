export const ProjectPanel = {
  position: 'relative',
  flexShrink: '0',
  width: '23.4rem',
  height: '100%',
  overflow: 'hidden',
  background: 'black.06',
  cursor: 'pointer',
  willChange: 'transform, opacity',
  'data-maketi-project-panel': 'true',
  // the effect-side image switcher reads this list and resolves each key
  // through the files map stashed below
  'data-maketi-project-images': (el) => {
    const state = el.state || {}
    return (state.images && state.images.length ? state.images : [state.image]).join(',')
  },
  // the open-panel title is rendered at the STICKY level (the panel clips
  // overflow, and the title must straddle the bottom edge) — the effect reads
  // the text from here
  'data-maketi-project-title-text': (el) => (el.state || {}).title || '',

  Img: {
    src: (el) => {
      // stash the files map for the effect-side image switcher — effects have
      // no module/context access, and this keeps future image keys resolvable
      if (typeof window !== 'undefined') window.__maketiFiles = el.context.files
      const state = el.parent.state || {}
      const list = state.images && state.images.length ? state.images : [state.image]
      const key = list[(state.imageIndex || 0) % list.length]
      return el.context.files[key || 'wodoreti'].src
    },
    alt: (el) => {
      const state = el.parent.state || {}
      return state.title || ''
    },
    // the panel is just a sliding window over a fixed-size photo.
    // Growing/shrinking the panel only re-clips the image.
    position: 'absolute',
    top: '0',
    left: '-18rem',
    width: '108rem',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    objectPosition: 'center',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    'data-maketi-project-panel-image': 'true'
  },

  Shade: {
    position: 'absolute',
    inset: '0',
    zIndex: '1',
    pointerEvents: 'none',
    // heavy editorial vignette: deep at the foot (caption zone), a breath of
    // darkness at the top edge, and an overall dim so the cream page pops
    background: 'linear-gradient(180deg, rgba(0, 0, 0, .38) 0%, rgba(0, 0, 0, .18) 28%, rgba(0, 0, 0, .22) 55%, rgba(0, 0, 0, .82) 100%)',
    transition: 'opacity 300ms cubic-bezier(.3, .9, .3, 1)',
    'data-maketi-project-panel-shade': 'true'
  },

  // prev/next image switcher — revealed by the effect only on the focused
  // (clicked-open) panel. Clicks must not bubble to the panel, which would
  // toggle the focus itself.
  Nav: {
    position: 'absolute',
    right: 'A',
    bottom: 'A',
    zIndex: '2',
    display: 'flex',
    flow: 'x',
    gap: 'Z',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 300ms ease',
    'data-maketi-project-panel-nav': 'true',

    // the arrow is a MASKED span, not a background image: a mask lets it be
    // recoloured (cream at rest on the coral fill, coralDark on hover) — a
    // PNG background can't change colour. The effect assigns the per-button
    // mask URL and drives the hover colours + clicks (domql does not attach
    // childProps handlers at this nesting depth). Masked 'contain' inside an
    // identical box also keeps both arrows the same visual size despite the
    // PNGs' different canvases (318×512 vs 512×512).
    childExtends: {
      extends: 'Button',
      Arrow: {
        tag: 'span',
        display: 'block',
        width: '46%',
        height: '46%',
        background: 'black',
        pointerEvents: 'none',
        transition: 'background 300ms ease',
        style: {
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain'
        },
        'data-maketi-panel-arrow': 'true'
      }
    },
    childrenAs: 'state',
    childProps: (el, s) => ({
      type: 'button',
      'aria-label': (childEl) => {
        const ui = childEl.getRootState().ui || {}
        return s.dir < 0 ? ui.previousImage : ui.nextImage
      },
      'data-maketi-panel-nav': String(s.dir),
      'data-maketi-panel-icon': s.icon,
      display: 'flex',
      align: 'center center',
      boxSize: 'D D',
      padding: '0',
      backgroundColor: 'coralDark',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'coralDark',
      borderRadius: '0',
      cursor: 'pointer',
      transition: 'background-color 300ms ease',
      ':hover': {
        backgroundColor: 'transparent'
      }
    }),
    children: [
      { icon: 'leftArrow', dir: -1 },
      { icon: 'rightArrow', dir: 1 }
    ]
  },

  // status badge, bottom-left: check (mint) = completed, loading (coralDark)
  // = in progress. Masked span so the PNG takes any colour — the effect
  // assigns the mask URL and the per-type fill (same pattern as the arrows).
  Badge: {
    tag: 'span',
    position: 'absolute',
    left: 'B',
    bottom: 'B',
    zIndex: '2',
    boxSize: 'C C',
    display: 'block',
    pointerEvents: 'none',
    transition: 'opacity 300ms ease',
    style: {
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain'
    },
    'data-maketi-panel-badge': (el) => (el.parent.state || {}).badge || ''
  },

}
