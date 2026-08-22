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
    tag: 'span',
    'aria-hidden': 'true',
    boxSize: 'C1 C1',
    display: 'block',
    background: 'coralDark',
    pointerEvents: 'none',
    style: {
      WebkitMaskImage: (el) => `url("${el.context.files.upArrow.src}")`,
      maskImage: (el) => `url("${el.context.files.upArrow.src}")`,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain'
    }
  }
}
