export const SectionTitle = {
  display: 'none',
  visibility: 'hidden',
  opacity: '0',
  position: 'relative',
  boxSize: 'G G',
  'data-maketi-section-title': 'true',

  Accent: {
    position: 'absolute',
    top: '0',
    right: '0',
    boxSize: 'G F',
    background: 'peach',
    display: 'none',
    'data-maketi-section-title-accent': 'true'
  },

  H2: {
    text: '{{ section.services }}',
    position: 'absolute',
    left: '-X',
    bottom: 'X',
    zIndex: '1',
    margin: '0',
    lineHeight: '1em',
    color: 'black',
    fontSize: 'I',
    fontWeight: '400',
    lineHeight: '1',
    letterSpacing: '0',
    display: 'none',
    'data-maketi-section-title-text': 'true'
  }
}
