export const ProjectItem = {
  position: 'relative',
  display: 'flex',
  flow: 'y',
  gap: 'B',
  width: 'min(70rem, 100%)',
  maxWidth: '79.2rem',
  'data-maketi-project-item': 'true',

  Media: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1.62',
    overflow: 'hidden',
    background: 'black.06',

    Img: {
      src: (el) => {
        const state = el.parent.parent.state || {}
        return el.context.files[state.image || 'cottage2'].src
      },
      alt: (el) => {
        const state = el.parent.parent.state || {}
        return state.title || 'კოტეჯი'
      },
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'cover',
      transition: 'opacity C defaultBezier, transform C defaultBezier',
      transform: 'scale(1)',
      'data-maketi-project-image': 'true'
    }
  },

  Link: {
    href: (el) => {
      const state = el.parent.state || {}
      return state.href || '/projects/cottage'
    },
    position: 'absolute',
    right: 'C',
    bottom: 'C',
    zIndex: '2',
    textDecoration: 'none',
    'data-maketi-project-link': 'true',

    ArrowButton: {}
  },

  Footer: {
    display: 'flex',
    flow: 'x',
    align: 'center space-between',
    gap: 'B',
    padding: '- C',

    Dots: {
      display: 'flex',
      flow: 'x',
      align: 'center',
      gap: 'A',
      childrenAs: 'state',
      childExtends: 'Box',
      childProps: (childEl, childState) => {
        const projectState = childEl.parent.parent.parent.state || {}
        const activeIndex = projectState.index || 0
        const size = childState.index === activeIndex ? '1.625rem' : childState.index === 1 ? '1.125rem' : '0.875rem'

        return {
          background: 'coralDark',
          borderRadius: '50%',
          flexShrink: '0',
          width: size,
          height: size,
          opacity: childState.index === activeIndex ? '1' : '.95',
          transition: 'width C defaultBezier, height C defaultBezier, opacity C defaultBezier',
          'aria-current': childState.index === activeIndex ? 'true' : 'false',
          'data-maketi-project-dot': childState.index
        }
      },
      children: [
        { index: 0 },
        { index: 1 },
        { index: 2 }
      ]
    },

    H5: {
      text: (el) => {
        const state = el.parent.parent.state || {}
        return state.title || 'კოტეჯი'
      },
      tag: 'h5',
      color: 'black',
      fontFamily: 'ArchyEDTBold',
      fontSize: 'G',
      fontWeight: '700',
      lineHeight: '.85',
      margin: '0',
      transition: 'opacity C defaultBezier',
      'data-maketi-project-title': 'true'
    }
  }
}
