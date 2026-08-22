export const PageLines = {
  position: 'absolute',
  top: '0',
  right: '0',
  bottom: '0',
  left: '0',
  zIndex: '0',
  overflow: 'hidden',
  pointerEvents: 'none',

  Vertical: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '31.5%',
    width: '1px',
    background: 'black',
    opacity: '.15',
    'data-maketi-line-v': 'true',
  },

  // Horizontal lines every 43.75rem (700px at the 1440px reference width —
  // rem so the rhythm scales with the root font-size), from below the hero to
  // the page bottom. bottom: 0 anchors it to the full document height, so
  // lines are added automatically as the page grows.
  Horizontal: {
    position: 'absolute',
    left: '0',
    right: '0',
    top: '45vh',
    bottom: '0',
    style: {
      backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0, 0, 0, .15) 0, rgba(0, 0, 0, .15) 1px, transparent 1px, transparent 43.75rem)'
    }
  }
}
