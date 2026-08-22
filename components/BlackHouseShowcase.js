// export const BlackHouseShowcase = {
//   position: 'absolute',
//   left: '53.12vw',
//   top: '0',
//   width: '24.65vw',
//   height: '80.3vh',
//   marginLeft: '0',
//   marginRight: '0',
//   'data-maketi-showcase': 'true',

//   Stage: {
//     position: 'relative',
//     width: '100%',
//     height: '100%',
//     flexShrink: '0',
//     zIndex: '0',

//     Rectangle: {
//       position: 'absolute',
//       top: '0',
//       left: '0',
//       width: '100%',
//       height: '100%',
//       background: 'peach',
//       zIndex: '0',
//       overflow: 'hidden',
//       'data-maketi-orange-rectangle': 'true',

//       OrangeLayer: {
//         position: 'absolute',
//         inset: '0',
//         zIndex: '0',
//         background: 'red',
//         opacity: '1',
//         transform: 'scale(1, 1)',
//         transformOrigin: 'top center',
//         'data-maketi-intro-rectangle': 'true'
//       }
//     },

//     P: {
//       tag: 'p',
//       text: '{{ banner.text }}',
//       position: 'absolute',
//       top: 'calc(100% + 3.65vh)',
//       right: '0',
//       margin: '0',
//       zIndex: '2',
//       color: 'black',
//       textAlign: 'right',
//       whiteSpace: 'pre-line',
//       fontFamily: 'ALKTallMtavruli',
//       fontSize: 'C2',
//       fontWeight: '400',
//       lineHeight: '1.1em',
//       'data-maketi-tagline': 'true',
//       '@tabletS': {
//         top: 'calc(100% + 2.15vh)',
//         right: '0',
//         fontSize: 'C',
//         lineHeight: '1.08em'
//       },
//     }
//   },

//   HouseLayer: {
//     position: 'absolute',
//     left: '-9.3vw',
//     top: '20.35vh',
//     width: '25.9vw',
//     height: 'auto',
//     zIndex: '1',
//     pointerEvents: 'none',
//     Shadow: {
//       position: 'absolute',
//       left: '18%',
//       top: '97%',
//       width: '73%',
//       aspectRatio: '4.4',
//       zIndex: '0',
//       pointerEvents: 'none',
//       'data-maketi-house-shadow': 'true',
//       background: 'radial-gradient(ellipse 46% 42% at 50% 50%, rgba(0, 0, 0, .38), rgba(0, 0, 0, .14) 55%, transparent 74%)',
//       filter: 'blur(12px)',
//       transform: 'scale(1, .5)',
//       transformOrigin: 'center',
//       willChange: 'transform, opacity',
//       '@tabletS': {
//         left: '9%',
//         width: '62%'
//       }
//     },

//     Img: {
//       src: (el) => el.context.files.blackHouse.src,
//       alt: 'Black house',
//       position: 'relative',
//       width: '100%',
//       height: 'auto',
//       objectFit: 'contain',
//       display: 'block',
//       zIndex: '1',
//       'data-maketi-house': 'true'
//     }
//   }
// }


export const BlackHouseShowcase = {
  position: 'absolute',
  top: '0',
  right: '25vw',
  height: '75vh',
  boxSize: '75vh 23vw',
  '@tabletS': {
    // boxSize: '70vh G2',
    right: '15vw',
  },

  Rectangle: {
    boxSize: '100% 100%',
    background: 'coralDark',
    '@tabletS': {
      // boxSize: '100% 35vw',
    },
  },

  House: {
    width: '25vw',
    height: 'auto',
    position: 'absolute',
    top: '16.5vh',
    left: '-9vw',
    '@tabletS': {
      width: '47vw',
      left: '-15vw',
      top: '20vh',
    },
    // '@media (max-width: 1024px) and (max-height: 1150px)': {
    //   top: '18vh',
    //   width: '42vw',
    //   left: '-17vw',
    // },
    Img: {
      src: (el) => el.context.files.blackHouse.src,
      alt: 'Black house',
      position: 'relative',
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      display: 'block',
      zIndex: '1'
    }
  },

  Slogan: {
    margin: 'A1 - - auto',
    '@tabletS': {
      display: 'none'
    }
  },

  Title: {
    display: 'none',
    '@tabletS': {
      display: 'block',
      fontSize: 'K2+G2',
      margin: '2vh - - -2px'
    }
  }
}
