export const ArrowButton = {
  extends: 'Button',
  boxSize: 'D1 D1',
  background: 'transparent',
  border: '0',
  borderRadius: '0',
  padding: '0',
  display: 'flex',
  align: 'center center',
  cursor: 'pointer',

  Img: {
    src: (el) => el.context.files.upArrow.src,
    alt: 'Arrow up',
    boxSize: 'C1 C1',
    objectFit: 'contain',
    pointerEvents: 'none',
    filter: 'brightness(0) saturate(100%) invert(66%) sepia(61%) saturate(1644%) hue-rotate(321deg) brightness(103%) contrast(101%)'
  }
}
