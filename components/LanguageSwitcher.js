export const LanguageSwitcher = {
  flow: 'y',
  align: 'center',
  gap: 'X',
  padding: 'Z',
  color: 'black.5',
  cursor: 'pointer',
  childExtends: {
    extends: 'Link',
    display: 'block',
    position: 'relative',
    zIndex: '2',
    padding: 'X',
    margin: '-X',
    cursor: 'pointer',
    style: {
      cursor: 'pointer'
    }
  },
  childrenAs: 'state',
  childProps: (el, s) => ({
    href: s.href,
    text: s.text,
    display: 'block',
    position: 'relative',
    zIndex: '2',
    padding: 'X',
    margin: '-X',
    color: (childEl, childState) => childEl.getRootState().lang === childState.lang ? 'coral' : 'black.5',
    textDecoration: 'none',
    fontFamily: 'ArchyEDTBold',
    cursor: 'pointer',
    style: {
      cursor: 'pointer'
    },
    fontSize: (childEl, childState) => childEl.getRootState().lang === childState.lang ? 'A1' : 'Z1',
    fontWeight: '700',
    lineHeight: '1',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    onClick: (event, childEl, childState) => {
      event.preventDefault()
      const state = childEl.getRootState()
      const content = state.translations[childState.lang]
      state.update({
        lang: childState.lang,
        nav: content.nav,
        projects: content.projects,
        section: content.section,
        banner: content.banner,
        service: content.service,
        services: content.services,
        contact: content.contact,
        form: content.form,
        footerBanner: content.footerBanner
      })
    }
  }),
  children: [
    { text: 'ქარ', href: '#ka', lang: 'ka' },
    { text: 'ENG', href: '#en', lang: 'en' }
  ]
}
