// export const MenuButton = {
//   'data-maketi-menu': 'true',
//   'data-open': 'false',
//   Button: {
//     tag: 'button',
//     type: 'button',
//     'aria-label': '{{ ui.menu }}',
//     'aria-expanded': 'false',
//     width: 'C1',
//     height: 'C1',
//     padding: '0',
//     borderWidth: '1px',
//     borderStyle: 'solid',
//     borderColor: 'rgba(0, 0, 0, 1)',
//     borderRadius: '0',
//     background: 'transparent',
//     color: 'black',
//     position: 'relative',
//     display: 'block',
//     cursor: 'pointer',

import { opacify } from "smbls";

//     onClick: (event, el) => {
//       event.preventDefault()

//       const root = el.parent && el.parent.node
//       if (!root) return

//       const isOpen = root.getAttribute('data-open') === 'true'
//       const nextOpen = String(!isOpen)

//       root.setAttribute('data-open', nextOpen)
//       el.node.setAttribute('aria-expanded', nextOpen)
//       document.documentElement.setAttribute('data-maketi-side-menu-open', nextOpen)
//       document.body.style.overflow = nextOpen === 'true' ? 'hidden' : ''
//     },

//     LineGroup: {
//       tag: 'span',
//       position: 'absolute',
//       left: '0',
//       right: '0',
//       top: '50%',
//       transform: 'translate3d(0, -50%, 0)',
//       display: 'flex',
//       flow: 'y',
//       gap: 'Y',
//       pointerEvents: 'none',

//       LineTop: {
//         tag: 'span',
//         'data-menu-line': 'top',
//         display: 'block',
//         alignSelf: 'flex-start',
//         width: '75%',
//         height: '2px',
//         background: 'black',
//         transformOrigin: 'center',
//         willChange: 'transform'
//       },

//       LineBottom: {
//         tag: 'span',
//         'data-menu-line': 'bottom',
//         display: 'block',
//         alignSelf: 'flex-end',
//         width: '75%',
//         height: '2px',
//         background: 'black',
//         transformOrigin: 'center',
//         willChange: 'transform'
//       }
//     }
//   },

//   // Style: {
//   //   tag: 'style',
//   //   text: [
//   //     '[data-maketi-menu="true"] button{transition:border-color 260ms ease,background 260ms ease;}',
//   //     '[data-maketi-menu="true"] [data-menu-line]{transition:transform 420ms cubic-bezier(.19, 1, .22, 1),background 260ms ease;}',
//   //     'html[data-maketi-side-menu-open="true"] [data-maketi-menu="true"] button{border-color:var(--color-coralDark)!important;background:transparent!important;}',
//   //     'html[data-maketi-side-menu-open="true"] [data-maketi-menu="true"] [data-menu-line]{background:var(--color-coralDark)!important;}',
//   //     '[data-maketi-menu="true"][data-open="true"] [data-menu-line="top"]{transform:translate(16.6667%, calc((var(--spacing-Y) + 2px) / 2)) rotate(45deg);}',
//   //     '[data-maketi-menu="true"][data-open="true"] [data-menu-line="bottom"]{transform:translate(-16.6667%, calc((var(--spacing-Y) + 2px) / -2)) rotate(-45deg);}'
//   //   ].join('')
//   // }
// }

export const MenuButton = {
  extends: 'Button',
  opacity: '0',
  pointerEvents: 'none',
  '@tabletS': {
    opacity: '1',
    pointerEvents: 'initial',
  },
  flow: 'y',
  gap: 'Y1',
  borderStyle: 'solid',
  borderWidth: 'V',
  borderColor: 'black',
  padding: '0',
  boxSize: 'C C',
  round: '0',
  position: 'absolute',
  top: 'B',
  right: 'B',
  zIndex: '2',

  onClick: (e, el, s) => s.root.update({ activeMenu: !s.root.activeMenu }),
  childProps: {
    boxSize: 'V2 70%',
    background: 'black',
    position: 'absolute',
    top: '50%',
    transition: 'left .3s ease, right .3s ease, transform .3s ease'
   },

  Line1: {
    transformOrigin: 'center',
    left: (el, s) => s.root.activeMenu ? '50%' : '0',
    transform: (el, s) => s.root.activeMenu
    ? 'translate(-50%, -50%) rotate(45deg) scale(.9)'
    : 'translate(0, -6px) scale(1)'
  },

  Line2: {
    right: (el, s) => s.root.activeMenu ? '50%' : '0',
    transformOrigin: 'center',
    transform: (el, s) => s.root.activeMenu
    ? 'translate(50%, -50%) rotate(-45deg) scale(.9)'
    : 'translate(0, 6px) scale(1)'
  }
}
