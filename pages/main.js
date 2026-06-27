export const main = {
  extends: 'Page',
  id: 'top',
  width: '100%',
  minHeight: '100vh',
  position: 'relative',
  background: 'cream',

  Logo: {
    position: 'fixed',
    top: 'B1',
    right: 'B1',
    zIndex: '100'
  },

  Navbar: {
    position: 'fixed',
    top: 'B1',
    left: 'D',
    zIndex: '100'
  },

  LanguageSwitcher: {
    position: 'absolute',
    right: 'A',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: '10'
  },

  ScrollbarLine: {},

  ChatButton: {
    position: 'fixed',
    right: 'B',
    bottom: 'B',
    zIndex: '100'
  },

  Banner: {
    width: '100%',
    minHeight: '100vh',
    align: 'flex-start center',
    padding: '0 B1 B1'
  },

  HouseModelSection: {
    width: '100%'
  }
}
