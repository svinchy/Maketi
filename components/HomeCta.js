// export const HomeCta = {
//   // extends: 'Button',
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

import state from "../state";

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
// }

export const HomeCta = {
  extends: 'Button',
  position: 'absolute',
  display: 'flex',
  gap: 'Y',
  round: '0',
  padding: 'Z2 A1',
  alignItems: 'center',
  top: '2.85vh',
  left: '28vw',
  zIndex: '2',
  fontSize: 'A2',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  opacity: '0.75',
  borderStyle: 'dashed',
  backdropFilter: 'blur(20px)',
  borderWidth: '1px',
  borderColor: 'rgba(0, 0, 0, 0.5)',
  fontWeight: '900',
   transition: 'opacity .3s ease, transform .3s ease, border .3s ease',
  ':hover': {
        opacity: '1',
        transform: 'scale(0.95)',
        borderStyle: 'solid',
        borderColor: 'rgba(0, 0, 0, 0.25)',
        // borderColor: 'coralDark'
      },
  text: (el, s) => s.root[s.root.language].homeCta,
  ':before': {
    content: '"+"',
    display: 'block',
    lineHeight: '.7em',
    alignSelf: 'flex-start',
    margin: '0.7px - - -'
  },
  '@tabletS': {
    top: 'initial',
    left: '4vw',
    bottom: '3vh',
  }
}