export const ServiceItem = {
  flow: 'x',
  align: 'center',
  gap: 'Z',
  color: 'black',
  width: '100%',
  justifyContent: 'center',
   Box: {
        position: 'relative',
        overflow: 'hidden',
        perspective: '900px',
        transformStyle: 'preserve-3d',
        boxShadow: 'none',
        style: {
          height: 'clamp(300px, 46vw, 540px)',
          width: 'clamp(220px, 31vw, 380px)'
        },

        Img: {
          src: (childEl) => {
            const state = childEl.parent.state.image
              ? childEl.parent.state
              : childEl.parent.parent.state

            return childEl.context.files[state.image || 'plan'].src
          },
          alt: (childEl) => {
            const state = childEl.parent.state.title
              ? childEl.parent.state
              : childEl.parent.parent.state

            return state.title || ''
          },
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          opacity: '1',
          filter: 'grayscale(1) brightness(.34) contrast(1.12)',
          transition: 'filter 420ms ease',
          transformOrigin: 'center',
          backfaceVisibility: 'hidden',
          willChange: 'transform, filter',
          style: {
            height: 'clamp(300px, 46vw, 540px)',
            width: 'clamp(220px, 31vw, 380px)'
          }
        },

        ServiceArrow: {
          extends: 'ArrowButton',
          type: 'button',
          'aria-label': 'Open service',
          'data-maketi-service-arrow': 'true',
          position: 'absolute',
          right: '26px',
          bottom: '26px',
          zIndex: '4',
          opacity: '0',
          pointerEvents: 'none',
          transform: 'translate3d(10px, 10px, 0) scale(.88)',
          transition: 'opacity 420ms ease, transform 620ms cubic-bezier(.19, 1, .22, 1)',
          style: {
            width: '96px',
            height: '96px'
          }
        }
      }
}
