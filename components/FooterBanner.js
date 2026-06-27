export const FooterBanner = {
  position: 'relative',
  boxSize: 'I3 I3',
  color: 'black',

  Accent: {
    position: 'absolute',
    right: '0',
    top: 'D1',
    boxSize: 'I2 I',
    background: 'peach'
  },

  Img: {
    src: (el) => el.context.files.elevator.src,
    alt: 'crane',
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '1',
    boxSize: 'H3 I2',
    objectFit: 'cover',
    display: 'block'
  },

  H6: {
    text: '{{ footerBanner.title }}',
    position: 'absolute',
    left: '0',
    bottom: '0',
    zIndex: '2',
    color: 'black',
    fontSize: '500px',
    lineHeight: '1',
    letterSpacing: '0'
  }
}
