import { setupAboutEffect } from '../effects/index.js'

export const About = {
  tag: 'section',
  id: 'about',

  // the effect body is inlined into this onInit at bundle time — this comment
  // changes when effects/about.js changes, forcing the entry to re-bundle
  // (rev: proportional scaling — px constants × root scale R)
  onInit: () => {
    if (typeof window === 'undefined') return
    const poll = () => {
      if (!setupAboutEffect()) window.setTimeout(poll, 50)
    }
    poll()
  },
  position: 'relative',
  zIndex: '0',
  width: '100%',
  // minHeight: '100vh',
  padding: '0 B1',
  background: 'transparent',
  color: 'black',
  display: 'flex',
  flow: 'y',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 'F2',
  'data-maketi-about': 'true',

  Intro: {
    tag: 'p',
    text: '{{ about.intro }}',
    'data-maketi-about-intro': 'true',
    willChange: 'transform',
    maxWidth: 'G1',
    fontFamily: 'ALKTallMtavruli',
    fontSize: 'C',
    fontWeight: '400',
    lineHeight: '1.25',
    margin: '- - - E'
  },

  Goal: {
    tag: 'p',
    text: '{{ about.goal }}',
    'data-maketi-about-goal': 'true',
    willChange: 'transform',
    fontFamily: 'ALKTallMtavruli',
    fontSize: 'C',
    fontWeight: '400',
    lineHeight: '1.25',
    maxWidth: 'G2',
    margin: '- - - C2'
  }
}
