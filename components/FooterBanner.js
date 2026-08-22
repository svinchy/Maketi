export const FooterBanner = {
  position: 'relative',
  boxSize: 'I3 I3',
  color: 'black',

  Accent: {
    position: 'absolute',
    right: '0',
    top: 'D1',
    boxSize: 'I2 I',
    background: 'coralDark',
    'data-maketi-footer-accent': 'true',

    // contact details on the rectangle, below the image window, held B off
    // the rectangle's right edge
    Contact: {
      position: 'absolute',
      right: 'B',
      bottom: 'E',
      padding: '0',
      alignItems: 'flex-end',
      'data-maketi-footer-contact': 'true'
    }
  },

  // a clipping window over a viewport-tall image sheet: the footer effect
  // pins the sheet to the viewport (translate3d = -frame.top), which gives
  // the background-attachment:fixed look without relying on it (transforms
  // and some browsers break the real thing)
  ImageFrame: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '1',
    boxSize: 'H3 I2',
    overflow: 'hidden',
    role: 'img',
    'aria-label': '{{ ui.crane }}',
    'data-maketi-footer-img': 'true',

    Sheet: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100vh',
      backgroundImage: (el) => `url(${el.context.files.elevator.src})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      willChange: 'transform',
      'data-maketi-footer-img-sheet': 'true'
    }
  },

  // anchored to right: 0 like the Accent rectangle, so its right edge always
  // lines up with the rectangle's right edge
  Domain: {
    tag: 'p',
    text: '{{ brand.domain }}',
    position: 'absolute',
    right: '0',
    top: 'calc(100% + A1)',
    margin: '0',
    color: 'black',
    fontFamily: 'ALKTallMtavruli',
    fontSize: 'C1'
  },

  H6: {
    text: '{{ footerBanner.title }}',
    position: 'absolute',
    left: '0',
    bottom: 'X',
    zIndex: '2',
    'data-maketi-footer-title': 'true',
    color: 'black',
    fontFamily: 'ALKTallMtavruli',
    fontSize: 'L+G',
    lineHeight: '1',
    letterSpacing: '0'
  }
}
