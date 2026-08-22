export const ServiceItem = {
  flow: 'x',
  align: 'center',
  gap: 'Z',
  color: 'black',
  width: '100%',
  justifyContent: 'center',
  'data-maketi-service-item': 'true',
   Box: {
     position: 'relative',
     overflow: 'hidden',
     boxShadow: 'none',
     'data-maketi-service-box': 'true',
     // 500×350px at the 1440px reference width — rem so the card scales
     // proportionally with the root font-size on every screen
     height: '31.25rem',
     width: '21.875rem',

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

       'data-maketi-service-photo': 'true',
       position: 'absolute',
       left: '0',
       top: '-8.75rem',
       width: '100%',
       height: 'calc(100% + 17.5rem)',
       objectFit: 'cover',
       objectPosition: 'center',
       display: 'block',
       filter: 'brightness(.62)',
       transition: 'filter 320ms ease',
       willChange: 'transform',
       backfaceVisibility: 'hidden'
     },

     ServiceArrow: {
       extends: 'ArrowButton',
       type: 'button',
       'aria-label': '{{ ui.openService }}',
       'data-maketi-service-arrow': 'true',
       position: 'absolute',
       right: '1.625rem',
       bottom: '1.625rem',
       zIndex: '4',
       opacity: '0',
       pointerEvents: 'none',
       transform: 'translate3d(0.625rem, 0.625rem, 0) scale(.88)',
       transition: 'opacity 420ms ease, transform 620ms cubic-bezier(.19, 1, .22, 1)',
       width: '6rem',
       height: '6rem'
     }
   }
}
