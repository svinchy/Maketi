// import { setupIntroEffect, setupPageScrollEffect, setupSmoothScrollEffect } from '../effects/index.js'

// export const Banner = {
//   tag: 'section',
//   width: '100%',
//   minHeight: '100vh',
//   position: 'relative',
//   zIndex: '0',
//   display: 'flex',
//   align: 'flex-start center',
//   overflow: 'hidden',
//   padding: '0 B1 B1',
//   background: 'cream',
//   'data-maketi-banner': 'true',
//   onInit: () => {
//     if (typeof window === 'undefined') return
//     const poll = () => {
//       if (!setupIntroEffect()) window.setTimeout(poll, 50)
//     }
//     poll()
//     const pollScroll = () => {
//       if (!setupPageScrollEffect()) window.setTimeout(pollScroll, 50)
//     }
//     pollScroll()
//     const pollSmooth = () => {
//       if (!setupSmoothScrollEffect()) window.setTimeout(pollSmooth, 50)
//     }
//     pollSmooth()
//   },

//   VerticalLine: {
//     position: 'absolute',
//     top: '0',
//     bottom: '0',
//     left: '31.5%',
//     width: '1px',
//     background: 'black',
//     opacity: '.15',
//     zIndex: '0',
//     pointerEvents: 'none',
//     'data-maketi-line-v': 'true',
//     '@tabletS': {
//       left: '26.5%'
//     },
//     '@mobileL': {
//       left: '31.5%'
//     }
//   },

//   CenterLine: {
//     position: 'absolute',
//     left: '0',
//     right: '0',
//     top: '47%',
//     height: '1px',
//     background: 'black',
//     opacity: '.15',
//     zIndex: '0',
//     pointerEvents: 'none',
//     'data-maketi-line-h': 'true',
//     '@tabletS': {
//       top: '48%'
//     },
//     '@mobileL': {
//       top: '47%'
//     }
//   },
//   BlackHouseShowcase: {
//     // '@tabletS': {
//     //   width: '38vw',
//     //   height: '65.3vh',
//     //   left: '45vw',
//     // },
//     Stage: {
//       Rectangle: {
//         OrangeLayer: {}
//       },
//       P: {
//       }
//     },
//     HouseLayer: {
//       // '@tabletS': {
//       //   width: '45vw',
//       //   top: '22.35vh',
//       //   left: '-17vw',
//       // },
//       Shadow: {
//       },
//       Img: {
//       }
//     }
//   },
//   BannerTitle: {
//     position: 'absolute',
//     left: 'Y',
//     bottom: 'X',
//     // '@screenM': {
//     //   fontSize: 'K1+J',
//     // },
//     // '@screenS': {
//     //   fontSize: 'K1+I',
//     //   left: 'X',
//     //   bottom: 'X'
//     // },
//     // '@tabletL': {
//     //    fontSize: 'K1+H',
//     // },
//     // '@tabletS': {
//     //    fontSize: 'K1+H2',
//     //    left: 'Y',
//     //    bottom: 'X'
//     // },
//     // '@mobileL': {
//     //   fontSize: 'K1+G',
//     //   left: 'X',
//     //   bottom: 'W'
//     // }

//   }
// }

export const Banner = {
  width: '100%',
  height: '100vh',
  position: 'relative',
  zIndex: '0',
  overflow: 'hidden',

  BlackHouseShowcase: {},

  Title: {
    position: 'absolute',
    bottom: '2vh',
    left: '4vw',
    '@tabletS': { display: 'none' }
  },

   Slogan: {
    position: 'absolute',
    bottom: '35vh',
    left: '10vw',
    textAlign: 'left',
    display: 'none',
    '@tabletS': {
      display: 'block'
    }
  },
}
