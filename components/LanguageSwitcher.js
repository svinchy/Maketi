// import { setLanguage } from '../methods/index.js'

import { fontFamily, opacify } from "smbls"

// export const LanguageSwitcher = {
//   flow: 'y',
//   align: 'center',
//   gap: 'X',
//   padding: 'Z',
//   color: 'black.5',
//   cursor: 'pointer',
//   fontSize: 'A2',
//   'data-maketi-lang': 'true',
//   childExtends: {
//     extends: 'Link',
//     display: 'block',
//     position: 'relative',
//     zIndex: '2',
//     padding: 'X',
//     margin: '-X',
//     cursor: 'pointer',
//     style: {
//       cursor: 'pointer'
//     }
//   },
//   childrenAs: 'state',
//   childProps: (el, s) => ({
//     href: s.href,
//     text: s.text,
//     display: 'block',
//     position: 'relative',
//     zIndex: '2',
//     padding: 'X',
//     margin: '-X',
//     color: (childEl, childState) => childEl.getRootState().lang === childState.lang ? 'coralDark' : 'black.5',
//     textDecoration: 'none',
//     fontFamily: 'ArchyEDTBold',
//     cursor: 'pointer',
//     style: {
//       cursor: 'pointer'
//     },
//     fontSize: (childEl, childState) => childEl.getRootState().lang === childState.lang ? 'A' : 'Z',
//     fontWeight: '700',
//     lineHeight: '1',
//     writingMode: 'vertical-rl',
//     textOrientation: 'mixed',
//     onClick: (event, childEl, childState) => {
//       event.preventDefault()
//       setLanguage(childEl.getRootState(), childState.lang)
//     }
//   }),
//   children: [
//     { text: 'ქარ', href: '#ka', lang: 'ka' },
//     { text: 'ENG', href: '#en', lang: 'en' }
//   ]
// }








export const LanguageSwitcher = {
  extends: 'Flex',
  flow: 'y',
  gap: 'Y2',
  position: 'absolute',
  top: '43vh',
  left: '1vw',
  zIndex: '2',
  transform: 'rotate(180deg)',

  childExtends: {
    tag: 'button'
  },
  childrenAs: 'state',
  children: (el, s) => s.langSwitcher,

  childProps: (el, s) => ({
    text: s.text,
    padding: '0',
    fontSize: 'A1',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    textDecoration: 'none',
    fontWeight: '900',
    cursor: 'unset',
    transition: 'opacity .3s ease, transform .3s ease, color .3s ease',
    opacity: (el, s) => s.root.language === s.value ? 1 : 0.7,
    color: (el, s) => s.root.language === s.value ? 'coralDark' : 'inherit',
    transform: (el, s) => s.root.language === s.value ? 'scale(1.3)' : 'scale(1)',

    onClick: (e, el, s) => {
      s.root.update({
        language: s.value
      })
    }
  })
}