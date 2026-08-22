// export const Logo = {
//   extends: 'Link',
//   href: '#top',
//   'data-maketi-logo': 'true',
//   maxWidth: 'fit-content',
//   textDecoration: 'none',
//   cursor: 'pointer',
//   transition: 'opacity 360ms ease',

//   // hide the logo when scrolling down, show it immediately when scrolling up
//   // (or at the top). lives in onInit so the smbls runner bundles it.
//   onInit: (el, s) => {
//     const win = el.context.window || window
//     let lastY = win.scrollY || win.document.documentElement.scrollTop || 0
//     const show = (visible) => {
//       const node = el.node
//       if (!node) return
//       node.style.opacity = visible ? '1' : '0'
//       node.style.pointerEvents = visible ? 'auto' : 'none'
//     }
//     const update = () => {
//       const y = win.scrollY || win.document.documentElement.scrollTop || 0
//       const delta = y - lastY
//       lastY = y
//       // stay hidden while the projects gallery owns the screen — measured
//       // directly (section covering the viewport middle) rather than via the
//       // effect's flag: the flag is written by a LATER scroll listener, so on
//       // reverse scroll it lags one event behind and the logo pops in for a beat
//       const projects = win.document.querySelector('[data-maketi-projects]')
//       if (projects) {
//         const rect = projects.getBoundingClientRect()
//         const mid = win.innerHeight * 0.5
//         if (rect.top < mid && rect.bottom > mid) return show(false)
//       }
//       if (y < 40) show(true)
//       else if (delta > 4) show(false)
//       else if (delta < -4) show(true)
//     }
//     el.scope = el.scope || {}
//     el.scope.updateLogo = update
//     win.addEventListener('scroll', update, { passive: true })
//     win.addEventListener('resize', update, { passive: true })
//     update()
//   },

//   onRemove: (el) => {
//     const win = el.context.window || window
//     if (el.scope && el.scope.updateLogo) {
//       win.removeEventListener('scroll', el.scope.updateLogo)
//       win.removeEventListener('resize', el.scope.updateLogo)
//     }
//   },

//   Img: {
//     src: (el) => el.context.files.logo3.src,
//     alt: 'maketi.ge',
//     width: '3vw',
//     // height: '7vh',

//     // height: '5.45vh',
//     display: 'block'
//   }
// }

export const Logo = {
  extends: 'Link',
  href: '#top',
  position: 'absolute',
  top: '2.5vh',
  right: '2vw',
  zIndex: '2',
  '@tabletS': {
    right: 'initial',
    top: 'B',
    left: 'A2'
  },

  Img: {
    src: (el) => el.context.files.logo3.src,
    alt: 'maketi.ge',
    height: 'C1',
    display: 'block',
    opacity: '0.8',
    '@tabletS': {
      height: 'D'
    }
  }
}
