// const showUnderline = (textEl, itemEl, navEl) => {
//   const text = textEl && textEl.node
//   const item = itemEl && itemEl.node
//   const navNode = navEl && navEl.node
//   const bar = navEl && navEl.Underline && navEl.Underline.node
//   if (!text || !item || !navNode || !bar) return

//   // the hovered item scales by this factor on :hover — keep in sync with the CSS
//   const scale = 1.15
//   const navR = navNode.getBoundingClientRect()
//   const itemR = item.getBoundingClientRect()
//   const textR = text.getBoundingClientRect()

//   // item centre (unchanged by a centre-origin scale) and its projected bottom edge
//   const ccx = itemR.left + itemR.width / 2
//   const ccy = itemR.top + itemR.height / 2
//   const bottom = ccy + (textR.bottom - ccy) * scale

//   // centre the bar horizontally on the item, crossing the text by 2px at the bottom
//   const left = (ccx - bar.offsetWidth / 2) - navR.left
//   const top = (bottom - 2) - navR.top

//   // spin the square a half-turn on every move — it rotates while it slides
//   // (transform is transitioned, so translate + rotate animate together)
//   bar.__mkAngle = (bar.__mkAngle || 0) + 180

//   bar.style.top = `${top}px`
//   bar.style.transform = `translateX(${left}px) rotate(${bar.__mkAngle}deg)`
//   bar.style.opacity = '1'
// }

// const hideUnderline = (el) => {
//   const bar = el.Underline && el.Underline.node
//   if (bar) bar.style.opacity = '0'
// }

// export const Navbar = {
//   tag: 'nav',
//   position: 'relative',
//   flow: 'x',
//   align: 'center',
//   gap: 'Y',
//   color: 'black',
//   cursor: 'pointer',
//   'data-maketi-navbar': 'true',
//   transition: 'opacity 360ms ease',
//   margin: '0',
//   fontSize: 'B2',


//   // hide the navbar when scrolling down, show it immediately when scrolling up
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
//       // stay hidden while the projects gallery owns the screen — the gallery
//       // brings its OWN top-right CTA (sections/Projects.js). Measured directly
//       // (section covering the viewport middle) rather than via the effect's
//       // flag: the flag is written by a LATER scroll listener, so on reverse
//       // scroll it lags one event behind and the navbar pops in for a beat.
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
//     el.scope.updateNavbar = update
//     win.addEventListener('scroll', update, { passive: true })
//     win.addEventListener('resize', update, { passive: true })
//     update()
//   },

//   onRemove: (el) => {
//     const win = el.context.window || window
//     if (el.scope && el.scope.updateNavbar) {
//       win.removeEventListener('scroll', el.scope.updateNavbar)
//       win.removeEventListener('resize', el.scope.updateNavbar)
//     }
//   },

//   onMouseleave: (event, el) => hideUnderline(el),

//   Underline: {
//     tag: 'div',
//     position: 'absolute',
//     left: '0',
//     top: '0',
//     width: '0.4375rem',
//     height: '0.4375rem',
//     background: 'coralDark',
//     borderRadius: '0',
//     opacity: '0',
//     pointerEvents: 'none',
//     transformOrigin: 'center',
//     willChange: 'transform, width, opacity',
//     transition: 'transform 620ms cubic-bezier(.16, 1, .3, 1), width 620ms cubic-bezier(.16, 1, .3, 1), opacity 320ms ease'
//   },

//   Links: {
//     flow: 'x',
//     align: 'center',
//     gap: 'A2',
//     transition: 'opacity 360ms ease',
//     // 'data-maketi-nav-links': 'true',
//     // padding: 'A',

//     childExtends: 'Link',
//     childrenAs: 'state',
//     childProps: (el, s) => ({
//       href: s.href,
//       text: s.text,
//       display: 'inline-block',
//       position: 'relative',
//       zIndex: '2',
//       color: 'black',
//       textDecoration: 'none',
//       fontFamily: 'ALKTallMtavruli',
//       fontWeight: '400',
//       letterSpacing: '0.05em',
//       textTransform: 'uppercase',
//       cursor: 'pointer',
//       opacity: '0.8',
//       transformOrigin: 'center',
//       transform: 'scale(1)',
//       willChange: 'transform',
//       transition: 'opacity 360ms cubic-bezier(.16, 1, .3, 1), transform 560ms cubic-bezier(.16, 1, .3, 1)',
//       ':hover': {
//         opacity: '1',
//         transform: 'scale(1.15)'
//       },
//       onMouseenter: (event, childEl) => showUnderline(childEl, childEl, childEl.parent.parent),
//       onClick: (event, childEl, childState) => {
//         const section = childState.href && document.querySelector(childState.href)
//         if (!section) return
//         event.preventDefault()
//         // projects: jump into the pinned gallery state (panels assembled), not
//         // the empty top of the section
//         if (section.matches('[data-maketi-projects]') && window.__maketiScrollToProjects) {
//           window.__maketiScrollToProjects()
//           return
//         }
//         // footer/contact: the contact details only finish revealing at the page
//         // bottom (the accent rectangle is full there), so scroll all the way down
//         if (section.matches('[data-maketi-footer]')) {
//           window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
//           return
//         }
//         // land on the first item of the section (centered so it becomes active),
//         // rather than the empty top of the section
//         const firstItem = section.querySelector('[data-maketi-service-item]')
//         if (firstItem) firstItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
//         else section.scrollIntoView({ behavior: 'smooth', block: 'start' })
//       }
//     }),
//     children: [
//       { text: '{{ nav.services }}', href: '#services' },
//       { text: '{{ nav.projects }}', href: '#projects' },
//       { text: '{{ nav.contact }}', href: '#footer' }
//     ]
//   },

//   // HomeCta: {
//   //   tag: 'a',
//   //   href: '#home',
//   //   flow: 'x',
//   //   align: 'center',
//   //   gap: 'W',
//   //   textDecoration: 'none',
//   //   margin: '- - - A',
//   //   transition: 'opacity 300ms ease',
//   //   'data-maketi-nav-cta': 'true',
//   //   color: 'black',
//   //   cursor: 'pointer',
//   //   background: 'coralDark',
//   //   padding: 'Y1 A1 Y1 Z2',
//   //   borderWidth: '1px',
//   //   borderStyle: 'solid',
//   //   borderColor: 'coralDark',
//   //   onMouseenter: (event, el) => hideUnderline(el.parent),
//   //   ':hover': {
//   //     background: 'transparent',
//   //     borderColor: 'coralDark',
//   //     color: 'coralDark',
//   //     '> span': {
//   //       borderColor: 'coralDark'
//   //     }
//   //   },
//   //   Icon: {
//   //     tag: 'span',
//   //     display: 'flex',
//   //     align: 'center center',
//   //     justifyContent: 'center',
//   //     boxSize: 'A A',
//   //     flexShrink: '0',
//   //     borderRadius: '50%',
//   //     // borderStyle: 'solid',
//   //     // borderWidth: '1px',
//   //     // borderColor: 'black',
//   //     lineHeight: '1',

//   //     Plus: {
//   //       tag: 'span',
//   //       text: '+',
//   //       fontFamily: 'sans-serif',
//   //       fontSize: 'A1',
//   //       fontWeight: '400',
//   //       lineHeight: '1'
//   //     }
//   //   },

//   //   Label: {
//   //     tag: 'span',
//   //     text: '{{ nav.home }}',
//   //     fontFamily: 'ALKTallMtavruli',
//   //     fontWeight: '400',
//   //     letterSpacing: '0.05em',
//   //     textTransform: 'uppercase'
//   //   }
//   // }
// }


export const Navbar = {
  position: 'absolute',
  top: '4.2vh',
  left: '3.5vw',
  zIndex: '2',
  padding: '- - Z -',
  '@tabletS': {
    display: 'none'
  },

  onMouseLeave: (e, el, s) => {
    s.root.update({
      navCubeVisible: false
    })
  },

  Nav: {
    extends: 'Flex',
    gap: 'B2',
    childExtends: 'Link',
    childrenAs: 'state',
    children: (el, s) => s[s.language].navBar,
    childProps: {
      href: (el, s) => s.href,
      text: (el, s) => s.text,
      cursor: 'pointer',
      fontSize: 'A2',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      opacity: '.75',
      transition: 'opacity .3s ease, transform .3s ease',
      ':hover': {
        opacity: '1',
        transform: 'scale(1.1)',
      },
      onMouseEnter: (e, el, s) => {
        s.root.update({
          navCubeLeft: el.node.offsetLeft + el.node.offsetWidth - 20,
          navCubeRotation: s.root.navCubeRotation + 90,
          navCubeVisible: true
        })
      }
    }
  },

  Cube: {
    boxSize: 'Y1 Y1',
    background: 'coralDark',
    position: 'absolute',
    bottom: '0',
    pointerEvents: 'none',
    left: (el, s) => `${s.navCubeLeft}px`,
    opacity: (el, s) => s.navCubeVisible ? '1' : '0',
    transform: (el, s) => `translate(-50%, 0) rotate(${s.navCubeRotation}deg)`,
    transition: 'left 0.3s ease, opacity 0.2s ease, transform 0.3s ease',
  },
}