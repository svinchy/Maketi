export const ServiceContent = {
  position: 'fixed',
  inset: '0',
  zIndex: '300',
  display: 'none',
  opacity: '1',
  background: 'cream',
  transition: 'opacity 320ms ease',
  'data-maketi-service-content': 'true',
  '--maketi-svc-dot-size': 'var(--spacing-B1)',
  '--maketi-svc-indicator-size': 'var(--spacing-A1)',
  '@mobileL': {
    '--maketi-svc-dot-size': 'var(--spacing-B)',
    '--maketi-svc-indicator-size': 'var(--spacing-A)'
  },

  Media: {
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
    width: '46%',
    overflow: 'hidden',
    willChange: 'transform',
    'data-maketi-service-content-media': 'true',
    '@mobileL': {
      top: '0',
      left: '0',
      right: 'auto',
      bottom: 'auto',
      width: '100%',
      height: '38vh'
    },

    // inner plate carries the image and a slow Ken-Burns transform so it reads
    // like a camera slowly drifting/pushing in; the outer Media clips it
    Plate: {
      position: 'absolute',
      inset: '0',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transformOrigin: 'center',
      willChange: 'transform',
      animation: 'maketiSvcDrift 22s ease-in-out infinite',
      'data-maketi-service-content-plate': 'true'
    },

    Shade: {
      position: 'absolute',
      inset: '0',
      zIndex: '1',
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 34%, rgba(0, 0, 0, .22) 66%, rgba(0, 0, 0, .62) 100%)',
      'data-maketi-service-content-shade': 'true'
    }
  },

  DriftKeyframes: {
    tag: 'style',
    text: [
      '@keyframes maketiSvcDrift{' +
      '0%{transform:scale(1.14) translate(-2.5%, 1.5%)}' +
      '50%{transform:scale(1.22) translate(2.5%, -2%)}' +
      '100%{transform:scale(1.14) translate(-2.5%, 1.5%)}}',
      '.maketi-svc-dot{position:relative;width:var(--maketi-svc-dot-size);height:var(--maketi-svc-dot-size);padding:0;flex:0 0 auto;' +
      'background:transparent;border:1px solid var(--color-coralDark);outline:0;cursor:pointer;' +
      'transition:border-color .24s ease,transform .24s ease}',
      '.maketi-svc-dot:hover{border-color:var(--color-coralDark);transform:scale(1.05)}',
      '.maketi-svc-dot.is-active{border-color:var(--color-coralDark);transform:scale(1.05)}',
      '.maketi-svc-indicator{position:absolute;top:0;left:0;width:var(--maketi-svc-indicator-size);height:var(--maketi-svc-indicator-size);' +
      'background:var(--color-coralDark);pointer-events:none;will-change:transform;' +
      'transition:transform .44s cubic-bezier(.19,1,.22,1)}',
      'html[data-maketi-service-modal-open="true"] [data-maketi-logo],html[data-maketi-service-modal-open="true"] [data-maketi-navbar],html[data-maketi-service-modal-open="true"] [data-maketi-menu],html[data-maketi-service-modal-open="true"] [data-maketi-lang],html[data-maketi-service-modal-open="true"] [data-maketi-scrollbar]{opacity:0!important;visibility:hidden!important;pointer-events:none!important}'
    ].join('')
  },

  Panel: {
    position: 'absolute',
    top: '0',
    right: '0',
    bottom: '0',
    width: '54%',
    overflowY: 'auto',
    padding: 'E - - -',
    // padding: 'H G F G',
    display: 'flex',
    flow: 'y',
    gap: 'C',
    align: 'center center',
    willChange: 'transform, opacity',
    'data-maketi-service-content-panel': 'true',
    '@mobileL': {
      top: '38vh',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100%',
      padding: '5.5rem 2rem 2rem',
      alignItems: 'flex-start',
      gap: '1.25rem'
    },

    Intro: {
      tag: 'p',
      text: '',
      'data-maketi-service-content-intro': 'true',
      width: '100%',
      margin: '0',
      color: 'black',
      opacity: '.65',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'B2',
      fontWeight: '400',
      lineHeight: '1.3',
      whiteSpace: 'pre-line',
      maxWidth: 'G2',
      letterSpacing: '.03em',
      '@mobileL': {
        maxWidth: 'none',
        fontSize: '1rem',
        lineHeight: '1.35',
        letterSpacing: '0'
      }
    },

    List: {
      tag: 'ul',
      'data-maketi-service-content-list': 'true',
      width: '100%',
      margin: '0',
      padding: '0',
      maxWidth: 'G2',
      color: 'black',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'B2',
      fontWeight: '400',
      lineHeight: '1.3',
      listStyle: 'none',
      letterSpacing: '.03em',
      '@mobileL': {
        maxWidth: 'none',
        fontSize: '1rem',
        lineHeight: '1.35',
        letterSpacing: '0'
      }

    }
  },

  Title: {
    position: 'absolute',
    top: 'C',
    left: '46%',
    right: 'auto',
    transform: 'translateX(-50%)',
    zIndex: '3',
    'data-maketi-service-content-title-wrap': 'true',
    '@mobileL': {
      top: 'calc(38vh + 1.25rem)',
      left: '2rem',
      right: '5rem',
      transform: 'none'
    },

    Inner: {
      tag: 'h3',
      text: '{{ service.title }}',
      'data-maketi-service-content-title': 'true',
      margin: '0',
      color: 'coralDark',
      textAlign: 'center',
      whiteSpace: 'pre-line',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'F',
      fontWeight: '400',
      lineHeight: '1',
      letterSpacing: '-0.01em',
      transformOrigin: 'center center',
      '@mobileL': {
        fontSize: '2.75rem',
        lineHeight: '.9',
        textAlign: 'left'
      }
    }
  },

  Close: {
    tag: 'button',
    type: 'button',
    text: '✕',
    'aria-label': '{{ ui.close }}',
    'data-maketi-service-content-close': 'true',
    position: 'absolute',
    top: 'A',
    right: 'A',
    zIndex: '3',
    width: '41px',
    height: '41px',
    display: 'flex',
    align: 'center center',
    background: 'coralDark',
    border: '1px solid coralDark',
    padding: '0',
    color: 'black',
    fontSize: 'B',
    lineHeight: '1',
    cursor: 'pointer',
    transition: 'background 240ms ease, color 240ms ease, opacity 200ms ease',
    '@mobileL': {
      top: '1rem',
      right: '1rem',
      left: 'auto',
      width: '2.75rem',
      height: '2.75rem'
    },
    ':hover': {
      background: 'transparent',
      color: 'coralDark'
    }
  },

  Nav: {
    position: 'absolute',
    left: 'C',
    bottom: 'C',
    zIndex: '4',
    display: 'flex',
    align: 'center center',
    gap: 'Z',
    'data-maketi-service-content-nav': 'true',
    '@mobileL': {
      top: 'calc(38vh - 3.75rem)',
      left: '2rem',
      right: 'auto',
      bottom: 'auto',
      gap: '.45rem'
    }
  }
}
