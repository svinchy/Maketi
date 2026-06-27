export const Navbar = {
  tag: 'nav',
  flow: 'x',
  align: 'center',
  gap: 'B',
  padding: 'A',
  color: 'black',
  cursor: 'pointer',

  childExtends: 'Link',
  childrenAs: 'state',
  childProps: (el, s) => ({
    href: s.href,
    text: s.text,
    display: 'inline-block',
    position: 'relative',
    zIndex: '2',
    color: 'black',
    textDecoration: 'none',
    fontFamily: 'ALKTallMtavruli',
    fontSize: 'B',
    fontWeight: '400',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer'
  }),
  children: [
    { text: '{{ nav.services }}', href: '#services' },
    { text: '{{ nav.projects }}', href: '#projects' },
    { text: '{{ nav.contact }}', href: '#contact' }
  ]
}
