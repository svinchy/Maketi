// export const ChatButton = {
//   extends: 'Button',
//   boxSize: 'C C',
//   round: '100%',
//   border: '0',
//   padding: '0',
//   // background: 'coral.8',
//   position: 'relative',
//   display: 'flex',
//   align: 'center center',
//   cursor: 'pointer',
//   transition: 'opacity 360ms ease',
//   'data-maketi-chat': 'true',

import { opacify } from "smbls";

//   // toggle the icon in sync with Crisp's real state: chat glyph when closed,
//   // two black lines rotated into an X when open — driven purely by the
//   // [data-open] attribute + injected CSS (below).
//   // helpers must live inside the fn — it's eval'd without module scope.
//   onInit: (el) => {
//     if (typeof window === 'undefined') return

//     // bootstrap Crisp + the button styling once. the smbls build generates its
//     // own index.html, so this can't live in the static index.html — it has to
//     // be injected from the app JS to work on the real dev server (:1234).
//     if (!window.__maketiCrispLoaded) {
//       window.__maketiCrispLoaded = true
//       window.$crisp = window.$crisp || []
//       window.CRISP_WEBSITE_ID = 'b062e8ce-85d3-4fb8-88df-e1f3e610641a'
//       const loader = document.createElement('script')
//       loader.src = 'https://client.crisp.chat/l.js'
//       loader.async = 1
//       document.getElementsByTagName('head')[0].appendChild(loader)

//       const style = document.createElement('style')
//       style.textContent = [
//         // hide Crisp's own launcher bubble — this ChatButton drives the messenger
//         '#crisp-chatbox div[role="button"][data-is-failure]{display:none !important;}',
//         // chat glyph fades out when open
//         '[data-maketi-chat] img{transition:opacity .28s ease;}',
//         '[data-maketi-chat][data-open="true"] img{opacity:0;}',
//         // two-line close glyph, centred over the button, hidden until open
//         '[data-maketi-chat] [data-maketi-close]{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .28s ease;}',
//         '[data-maketi-chat] [data-line]{position:absolute;left:50%;top:50%;width:1.05rem;height:.14rem;background:#000;border-radius:1rem;transform:translate(-50%,-50%) translateY(var(--line-y,0));transition:transform .34s cubic-bezier(.19,1,.22,1);}',
//         '[data-maketi-chat] [data-line="1"]{--line-y:-.26rem;}',
//         '[data-maketi-chat] [data-line="2"]{--line-y:.26rem;}',
//         // open: reveal the lines and rotate them into an X
//         '[data-maketi-chat][data-open="true"] [data-maketi-close]{opacity:1;}',
//         '[data-maketi-chat][data-open="true"] [data-line="1"]{transform:translate(-50%,-50%) rotate(45deg);}',
//         '[data-maketi-chat][data-open="true"] [data-line="2"]{transform:translate(-50%,-50%) rotate(-45deg);}',
//         // service detail modal sits in the services stacking context; keep all
//         // chat UI out of the way while it is open, including Crisp's iframe.
//         'html[data-maketi-service-modal-open="true"] [data-maketi-chat],html[data-maketi-service-modal-open="true"] #crisp-chatbox{opacity:0!important;visibility:hidden!important;pointer-events:none!important;}'
//       ].join('')
//       document.head.appendChild(style)
//     }

//     const setOpen = (open) => {
//       if (el.node) el.node.setAttribute('data-open', open ? 'true' : 'false')
//     }
//     const attach = () => {
//       if (!window.$crisp || typeof window.$crisp.push !== 'function') {
//         window.setTimeout(attach, 300)
//         return
//       }
//       window.$crisp.push(['on', 'chat:opened', () => setOpen(true)])
//       window.$crisp.push(['on', 'chat:closed', () => setOpen(false)])
//       // once the SDK is ready, match Crisp's actual state (it restores the
//       // open/closed state across page loads)
//       window.$crisp.push(['on', 'session:loaded', () => {
//         try { setOpen(!!(window.$crisp.is && window.$crisp.is('chat:opened'))) } catch (e) {}
//       }])
//     }
//     attach()
//   },

//   onClick: (event, el) => {
//     if (typeof window === 'undefined' || !el.node) return
//     const crisp = window.$crisp
//     if (!crisp || typeof crisp.push !== 'function') return
//     const isOpen = el.node.getAttribute('data-open') === 'true'
//     if (isOpen) {
//       crisp.push(['do', 'chat:close'])
//       el.node.setAttribute('data-open', 'false')
//     } else {
//       crisp.push(['do', 'chat:open'])
//       el.node.setAttribute('data-open', 'true')
//     }
//   },

//   Img: {
//     src: (el) => el.context.files.chat.src,
//     alt: 'chat',
//     boxSize: 'C C',
//     display: 'block'
//   },

//   CloseGlyph: {
//     tag: 'span',
//     'data-maketi-close': 'true',
//     LineA: { tag: 'span', 'data-line': '1' },
//     LineB: { tag: 'span', 'data-line': '2' }
//   }
// }

export const ChatButton = {
  extends: 'Button',
  padding: '0',
  width: 'fit-content',
  height: 'fit-content',
  position: 'absolute',
  bottom: '2.5vh',
  right: '2vw',
  zIndex: '2',
  cursor: 'pointer',
  transition: 'opacity .3s ease, transform .3s ease',
  opacity: '0.85',
  ':hover': {
    opacity: '1',
    transform: 'scale(0.95)'
  },
  '@tabletS': {
     right: '2.5vw',
    },

  Img: {
    src: (el) => el.context.files.chat.src,
    alt: 'chat',
    boxSize: 'B1 B1',
    display: 'block',
    '@tabletS': {
      boxSize: 'C C'
    }
  }
}
