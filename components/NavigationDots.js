export const NavigationDots = {
  flow: 'x',
  align: 'center',
  gap: 'B',
  childrenAs: 'state',
  childExtends: 'Box',
  childProps: (el, s) => ({
    background: 'coral',
    borderRadius: '50%',
    flexShrink: '0',
    boxSize: s.active ? 'B B' : s.boxSize,
    opacity: s.active ? '1' : '.95',
    transition: 'width C ease, height C ease, opacity C ease'
  }),
  children: [
    { active: true, boxSize: 'B B' },
    { active: false, boxSize: 'A1 A1' },
    { active: false, boxSize: 'Z1 Z1' }
  ]
}
