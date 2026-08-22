import { setupFooterEffect } from '../effects/index.js'

export const Footer = {
  tag: 'footer',
  id: 'footer',

  // the effect body is inlined into this onInit at bundle time — this comment
  // changes when effects/footer.js changes, forcing the entry to re-bundle
  // (rev: contact fades in late, as the rectangle finishes growing)
  onInit: () => {
    if (typeof window === 'undefined') return
    const poll = () => {
      if (!setupFooterEffect()) window.setTimeout(poll, 50)
    }
    poll()
  },

  position: 'relative',
  zIndex: '0',
  width: '100%',
  // extra bottom padding: the maketi.ge line hangs below the banner
  // (absolutely positioned inside FooterBanner)
  padding: 'F B1 D1 B1',
  background: 'transparent',
  color: 'black',
  display: 'flex',
  flow: 'y',
  alignItems: 'center',
  'data-maketi-footer': 'true',

  FooterBanner: {}
}
