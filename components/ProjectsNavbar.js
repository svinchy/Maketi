export const ProjectsNavbar = {
  state: {
    activeProject: 'all'
  },
  position: 'sticky',
  top: 'B',
  zIndex: '8',
  flow: 'x',
  align: 'center',
  gap: 'B',
  padding: 'A C',
  margin: '- auto',
  width: 'fit-content',
  maxWidth: 'calc(100vw - var(--spacing-C) * 2)',
  opacity: '1',
  transform: 'translate3d(0, 0, 0)',
  transition: 'opacity 640ms cubic-bezier(.19, 1, .22, 1), transform 900ms cubic-bezier(.19, 1, .22, 1)',
  willChange: 'opacity, transform',
  'data-maketi-projects-navbar': 'true',
  childExtends: 'Link',
  childrenAs: 'state',
  childProps: (el, s) => ({
    href: s.href,
    text: s.text,
    'data-maketi-project-nav-item': 'true',
    'data-maketi-project-active': (childEl, childState) => childEl.parent.state.activeProject === childState.key ? 'true' : 'false',
    display: 'inline-block',
    color: (childEl, childState) => childEl.parent.state.activeProject === childState.key ? 'black' : 'black.62',
    textDecoration: 'none',
    fontSize: (childEl, childState) => childEl.parent.state.activeProject === childState.key ? 'F' : 'D',
    fontWeight: '400',
    lineHeight: '1',
    transition: 'color 720ms cubic-bezier(.19, 1, .22, 1), font-size 960ms cubic-bezier(.19, 1, .22, 1)',
    onClick: (event, childEl, childState) => {
      event.preventDefault()
      childEl.parent.state.update({ activeProject: childState.key })
    }
  }),
  children: [
    { key: 'all', text: '{{ projects.yours }}', href: '#all' },
    { key: 'current', text: '{{ projects.current }}', href: '#current' },
    { key: 'done', text: '{{ projects.done }}', href: '#done' }
  ]
}
