const closeSideMenu = () => {
  document.documentElement.setAttribute('data-maketi-side-menu-open', 'false')
  document.body.style.overflow = ''

  const menu = document.querySelector('[data-maketi-menu="true"]')
  if (!menu) return

  menu.setAttribute('data-open', 'false')
  const button = menu.querySelector('button')
  if (button) button.setAttribute('aria-expanded', 'false')
}

const scrollToSection = (href) => {
  const section = href && document.querySelector(href)
  if (!section) return

  if (section.matches('[data-maketi-projects]') && window.__maketiScrollToProjects) {
    window.__maketiScrollToProjects()
    return
  }

  if (section.matches('[data-maketi-footer]')) {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    return
  }

  const firstItem = section.querySelector('[data-maketi-service-item]')
  if (firstItem) firstItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
  else section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const scrollHome = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const sideMenuItem = (text, href, index) => ({
  tag: 'a',
  href,
  display: 'block',
  width: '100%',
  color: 'black',
  textDecoration: 'none',
  cursor: 'pointer',
  overflow: 'hidden',
  'data-side-menu-link': String(index),

  onClick: (event) => {
    event.preventDefault()
    closeSideMenu()
    scrollToSection(href)
  },

  LabelMask: {
    tag: 'span',
    display: 'block',
    width: '100%',
    overflow: 'hidden',

    LabelText: {
      tag: 'span',
      text,
      display: 'block',
      width: '100%',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'K',
      fontWeight: '400',
      lineHeight: '.84',
      letterSpacing: '0',
      textAlign: 'right',
      textTransform: 'uppercase',
      transform: 'translate3d(0, 112%, 0)',
      clipPath: 'inset(0 0 100% 0)',
      willChange: 'transform, clip-path',
      'data-side-menu-label': 'true'
    }
  },

  Rule: {
    tag: 'span',
    display: 'block',
    width: '100%',
    height: 'V',
    margin: 'A 0 0 0',
    background: 'black',
    transform: 'scaleX(0)',
    transformOrigin: 'right center',
    willChange: 'transform',
    'data-side-menu-rule': 'true'
  }
})

export const SideMenu = {
  tag: 'aside',
  position: 'fixed',
  inset: '0',
  zIndex: '110',
  display: 'none',
  flow: 'y',
  justifyContent: 'space-between',
  background: 'cream',
  color: 'black',
  padding: 'B1 B1 D1 B1',
  transform: 'translateX(100%)',
  visibility: 'hidden',
  pointerEvents: 'none',
  transition: 'transform 620ms cubic-bezier(.19, 1, .22, 1), visibility 0ms linear 620ms',
  willChange: 'transform',
  'data-maketi-side-menu': 'true',
  '@tabletS': {
    display: 'flex'
  },

  onInit: (el) => {
    const onKeydown = (event) => {
      if (event.key === 'Escape') closeSideMenu()
    }

    el.scope = el.scope || {}
    el.scope.closeOnEscape = onKeydown
    document.addEventListener('keydown', onKeydown)
  },

  onRemove: (el) => {
    if (el.scope && el.scope.closeOnEscape) {
      document.removeEventListener('keydown', el.scope.closeOnEscape)
    }
  },

  Topbar: {
    tag: 'header',
    display: 'flex',
    align: 'center start',
    width: '100%',

    Cta: {
      tag: 'a',
      href: '#top',
      flow: 'x',
      align: 'center',
      gap: 'Y1',
      textDecoration: 'none',
      color: 'black',
      cursor: 'pointer',
      background: 'coralDark',
      padding: 'Z A2',
      borderWidth: 'V',
      borderStyle: 'solid',
      borderColor: 'coralDark',
      'data-side-menu-cta': 'true',
      transitionDuration: '1000ms',

      onClick: (event) => {
        event.preventDefault()
        closeSideMenu()
        scrollHome()
      },

      Icon: {
        tag: 'span',
        display: 'flex',
        align: 'center center',
        justifyContent: 'center',
        boxSize: 'A1 A1',
        flexShrink: '0',
        borderRadius: '50%',
        borderStyle: 'solid',
        borderWidth: 'V',
        borderColor: 'black',
        lineHeight: '1',

        Plus: {
          tag: 'span',
          text: '+',
          fontFamily: 'sans-serif',
          fontSize: 'B',
          fontWeight: '400',
          lineHeight: '1'
        }
      },

      Label: {
        tag: 'span',
        text: '{{ nav.home }}',
        display: 'block',
        fontFamily: 'ALKTallMtavruli',
        fontSize: 'B',
        fontWeight: '400',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }
    },

    Brand: {
      tag: 'span',
      text: 'maketi.ge',
      display: 'none',
      fontFamily: 'ALKTallMtavruli',
      fontSize: 'B',
      fontWeight: '400',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }
  },

  Nav: {
    tag: 'nav',
    position: 'absolute',
    right: 'B1',
    bottom: 'E',
    left: 'B1',
    display: 'flex',
    flow: 'y',
    gap: 'D1',
    align: 'end',
    NavServices: sideMenuItem('{{ nav.services }}', '#services', 0),
    NavProjects: sideMenuItem('{{ nav.projects }}', '#projects', 1),
    NavContact: sideMenuItem('{{ nav.contact }}', '#footer', 2)
  },


  Style: {
    tag: 'style',
    text: [
      'html[data-maketi-side-menu-open="true"] [data-maketi-side-menu="true"]{transform:translateX(0);visibility:visible;pointer-events:auto;transition:transform 620ms cubic-bezier(.19, 1, .22, 1), visibility 0ms linear 0ms;}',
      '[data-side-menu-label]{transition:transform 760ms cubic-bezier(.19, 1, .22, 1), clip-path 760ms cubic-bezier(.19, 1, .22, 1);}',
      '[data-side-menu-rule]{transition:transform 860ms cubic-bezier(.19, 1, .22, 1);}',
      'html[data-maketi-side-menu-open="true"] [data-side-menu-label]{transform:translate3d(0, 0, 0);clip-path:inset(0 0 0 0);}',
      'html[data-maketi-side-menu-open="true"] [data-side-menu-rule]{transform:scaleX(1);}',
      '[data-side-menu-link="0"] [data-side-menu-label],[data-side-menu-link="0"] [data-side-menu-rule]{transition-delay:220ms;}',
      '[data-side-menu-link="1"] [data-side-menu-label],[data-side-menu-link="1"] [data-side-menu-rule]{transition-delay:320ms;}',
      '[data-side-menu-link="2"] [data-side-menu-label],[data-side-menu-link="2"] [data-side-menu-rule]{transition-delay:420ms;}'
    ].join('')
  }
}
