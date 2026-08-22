import { setupServicesEffect } from '../effects/index.js'

export const Services = {
  tag: 'section',
  id: 'services',

  // the effect body is inlined into this onInit at bundle time.
  onInit: () => {
    if (typeof window === 'undefined') return
    const poll = () => {
      if (!setupServicesEffect()) window.setTimeout(poll, 50)
    }
    poll()
  },

  position: 'relative',
  zIndex: '0',
  width: '100%',
  minHeight: '100vh',
  margin: 'G - - -',
  padding: 'B2 F B1 F',
  background: 'transparent',
  color: 'black',
  display: 'flex',
  flow: 'y',
  gap: 'B1',
  'data-maketi-services': 'true',

  BgTitle: {
    tag: 'h2',
    position: 'sticky',
    top: '50vh',
    height: '0',
    width: '100%',
    margin: '0',
    zIndex: '0',
    overflow: 'visible',
    pointerEvents: 'none',
    'data-maketi-services-title-wrap': 'true',

    // centers the title on the viewport middle regardless of how many lines it wraps to
      Center: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        transform: 'translate3d(0, -50%, 0)',

      Inner: {
        tag: 'span',
        text: (el) => el.getRootState().services.items[0].title,
        // the scroll effect owns this text after init; keep the reactive value as
        // the initial/SSR fallback only
        display: 'block',
        textAlign: 'center',
        color: 'coralDark',
        opacity: '.9',
        fontFamily: 'ALKTallMtavruli',
        fontSize: 'I2',
        fontWeight: '400',
        lineHeight: '.9',
        letterSpacing: '-0.01em',
        transformOrigin: 'center',
        transition: 'transform 340ms cubic-bezier(.19, 1, .22, 1)',
        willChange: 'transform',
        'data-maketi-services-title': 'true'
      }
    }
  },

  Clip: {
    position: 'relative',
    zIndex: '1',
    width: '100%',
    // overflow: 'hidden',

    List: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      columnGap: 'E',
      rowGap: 'E1',
      width: '100%',
      alignItems: 'start',

      childExtends: 'ServiceItem',
      childrenAs: 'state',
      childProps: (el, item) => ({
        width: 'auto',
        'data-maketi-service-title': item.title,
        'data-maketi-service-image': item.image,
        'data-maketi-service-intro': item.intro || '',
        'data-maketi-service-list': (item.list || []).join('\n'),
        // editorial stagger: left column hugs the start, right column hugs the
        // end and is dropped down so the two columns interlock with whitespace
        ':nth-child(odd)': {
          justifyContent: 'flex-start'
        },
        ':nth-child(even)': {
          justifyContent: 'flex-end',
          marginTop: 'F1'
        }
      }),
      children: (el, state) => state.services.items
    }
  },

  ServiceContent: {}
}
