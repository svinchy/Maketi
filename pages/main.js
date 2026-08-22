// export const main = {
//   extends: 'Page',
//   id: 'top',
//   width: '100%',
//   minHeight: '100vh',
//   position: 'relative',
//   background: 'cream',
//   fontFamily: 'ALKTallMtavruli',


//   PageLines: {},

//   ScrollbarReset: {
//     tag: 'style',
//     text: 'html{scroll-behavior:smooth}*{scrollbar-width:none;-ms-overflow-style:none}*::-webkit-scrollbar{display:none}'
//   },

//   Logo: {
//     position: 'fixed',
//     top: 'B2',
//     right: 'C',
//     zIndex: '100',
//     // '@screenM': {
//     //   top: 'B',
//     //   right: 'B2'
//     // },
//     // '@screenS': {
//     //   right: 'B'
//     // },
//     // '@tabletS': {
//     //   right: 'initial',
//     //   left: 'B1',
//     //   top: 'B1'
//     // },
//     // '@mobileL': {
//     //   left: 'A2',
//     //   top: 'A2'
//     // },
//     Img: {
//       // '@screenM': {
//       //   height: 'C2',
//       // },
//       // '@screenS': {
//       //   height: 'C+W2'
//       // },
//       // '@tabletS': {
//       //   height: 'D',
//       // }
//     }
//   },

//   Navbar: {
//     position: 'fixed',
//     top: 'B2',
//     left: 'C',
//     zIndex: '100',
//     // '@screenM': {
//     //   fontSize: 'B1',
//     //   top: 'B',
//     //   left: 'B2',
//     // },
//     //  '@screenS': {
//     //   fontSize: 'A2'
//     // },
//     // '@tabletS': {
//     //   display: 'none'
//     // },
//     Underline: {},
//     Links: {},
//     HomeCta: {}
//   },

//   MenuButton: {
//     position: 'fixed',
//     zIndex: '120',
//     display: 'none',
//     // '@tabletS': {
//     //   display: 'block',
//     //   top: 'B2',
//     //   right: 'B2'
//     // },
//     // '@mobileL': {
//     //   top: 'A2',
//     //   right: 'A2'}
//   },

//   SideMenu: {},

//   LanguageSwitcher: {
//     position: 'absolute',
//     left: 'A',
//     top: '43vh',
//     transform: 'rotate(-180deg)',
//     zIndex: '10',
//     // '@screenM': {
//     //   fontSize: 'A1',
//     //   left: 'Z'
//     // },
//     // '@screenS': {
//     //   fontSize: 'A',
//     //   left: 'Y'
//     // },
//     // '@tabletS': {
//     //   fontSize: 'B1',
//     // }
//   },

//   ScrollbarLine: {},

//   ChatButton: {
//     position: 'fixed',
//     right: 'C',
//     bottom: 'B2',
//     zIndex: '100',
//     // '@screenM': {
//     //   boxSize: 'B2 B2',
//     //   bottom: 'B',
//     //   right: 'B2'
//     // },
//     // '@screenS': {
//     //    boxSize: 'B1 B1',
//     //    bottom: 'A2',
//     //    right: 'A2'
//     // },
//     // '@tabletS': {
//     //   boxSize: 'C1 C1',
//     //   bottom: 'B1',
//     //    right: 'B1'
//     // },
//     Img: {
//     //   '@screenM': {
//     //     boxSize: 'B2 B2',
//     //   },
//     //   '@screenS': {
//     //    boxSize: 'B1 B1'
//     // },
//     // '@tabletS': {
//     //   boxSize: 'C1 C1',
//     // },
//     }
//   },

//   Banner: {},

//   // Services: {},

//   // Projects: {},

//   // About: {},

//   // HouseEditor: {},

//   // Form: {
//   //   width: 'fit-content',
//   //   margin: 'E auto'
//   //   // margin: 'G auto G auto'
//   // },

//   // Footer: {},

//   // HouseModelSection: {
//   //   width: '100%'
//   // }
// }


export const main = {
  extends: 'Page',
  width: '100%',
  minHeight: '100vh',
  position: 'relative',
  background: 'cream',
  fontFamily: 'ALKTallMtavruli',
  fontSize: 'C1',
  '@screenL': {
    fontSize: 'B'
  },
  '@screenM': {
    fontSize: 'A2'
  },
  '@screenS': {
    fontSize: 'A'
  },
  '@tabletL': {
    fontSize: 'Z2'
  },
  '@tabletS': {
    fontSize: 'A'
  },
  // '@screenM': {
  //   fontSize: 'A1'
  // },
  // '@screenS': {
  //   fontSize: 'A'
  // },

  Logo: {},
  Navbar: {},
  HomeCta: {},
  ChatButton: {},
  LanguageSwitcher: {},
  MenuButton: {},
  PageLines: {},

  Banner: {},
}
