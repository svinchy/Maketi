export const BlackHouseShowcase = {
  position: 'relative',
  display: 'flex',
  align: 'center center',

  Rectangle: {
    position: 'relative',
    boxSize: 'H3 G1',
    background: 'peach',
    flexShrink: '0',
    zIndex: '0',
    overflow: 'hidden',
    'data-maketi-orange-rectangle': 'true',

    OrangeLayer: {
      position: 'absolute',
      inset: '0',
      zIndex: '0',
      background: 'coralDark',
      opacity: '1',
      transform: 'scaleY(1)',
      transformOrigin: 'top center',
      'data-maketi-intro-rectangle': 'true'
    }
  },

  Img: {
    src: (el) => el.context.files.blackHouse.src,
    alt: 'Black house',
    position: 'absolute',
    left: '-E1',
    top: 'F',
    boxSize: 'G1 G2',
    objectFit: 'contain',
    display: 'block',
    zIndex: '1'
  },

  H3: {
    tag: 'h3',
    text: 'მაკეტი',
    position: 'absolute',
    left: '-50px',
    bottom: '-50px',
    zIndex: '2',
    margin: '0',
    color: 'black',
    fontFamily: 'ALKTallMtavruli',
    fontSize: '96px',
    fontWeight: '400',
    lineHeight: '.9'
  }
}
