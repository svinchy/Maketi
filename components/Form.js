export const Form = {
  tag: 'form',
  extends: 'Flex',
  flow: 'y',
  padding: 'C',

  // Web3Forms submission via fetch — the user stays on the page. Submissions
  // are emailed to the address the access key is registered to (web3forms.com).
  onSubmit: async (event, el) => {
    event.preventDefault()
    const copy = el.getRootState().form || {}
    const form = el.node
    const status = form.querySelector('[data-maketi-form-status]')
    const show = (msg, ok) => {
      if (!status) return
      status.textContent = msg
      status.style.opacity = '1'
      status.style.color = ok ? '#000000' : '#c0392b'
    }
    const name = form.querySelector('[name="name"]')
    const email = form.querySelector('[name="email"]')
    const message = form.querySelector('[name="message"]')
    const nameV = name ? name.value.trim() : ''
    const emailV = email ? email.value.trim() : ''
    const msgV = message ? message.value.trim() : ''
    if (!nameV || !emailV || !msgV) {
      show(copy.required || 'Please fill in every field', false)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailV)) {
      show(copy.invalidEmail || 'Email format is not valid', false)
      return
    }
    const btn = form.querySelector('button[type="submit"]')
    if (btn) btn.disabled = true
    show(copy.sending || 'Sending...', true)
    try {
      const keyInput = form.querySelector('[name="access_key"]')
      const bot = form.querySelector('[name="botcheck"]')
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: keyInput ? keyInput.value : '',
          name: nameV,
          email: emailV,
          message: msgV,
          subject: (copy.subject || 'maketi.ge - new message: ') + nameV,
          botcheck: bot && bot.checked ? true : undefined
        })
      })
      const data = await res.json()
      if (data && data.success) {
        show((copy.success || 'Message sent') + ' ✓', true)
        if (name) name.value = ''
        if (email) email.value = ''
        if (message) message.value = ''
      } else {
        show(copy.failed || 'Could not send - please try again later', false)
      }
    } catch (e) {
      show(copy.network || 'Could not send - check your connection', false)
    }
    if (btn) btn.disabled = false
  },

  borderWidth: '.5px .5px .5px .3px',
  borderStyle: 'solid',
  borderColor: 'black.3',
  fontFamily: 'ALKTallMtavruli',
  background: 'cream',
  childProps: {
    round: '0',
    fontFamily: 'ALKTallMtavruli'
  },

  // Web3Forms public access key (registered to G.chichinadze@diligence.ge) —
  // submissions are emailed there
  AccessKey: {
    tag: 'input',
    type: 'hidden',
    name: 'access_key',
    value: 'efbcb09c-b31c-4897-860f-cc019bdab6ac'
  },

  // honeypot: hidden from humans; bots that tick it are dropped by Web3Forms
  BotCheck: {
    tag: 'input',
    type: 'checkbox',
    name: 'botcheck',
    tabIndex: '-1',
    'aria-hidden': 'true',
    style: { display: 'none' }
  },

  Input: {
    name: 'name',
    type: 'text',
    minWidth: 'G',
   borderBottomWidth: '.5px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'black.3',
    placeholder: (el) => (el.getRootState().form || {}).name,
    background: 'transparent',
    outline: 'none',
    padding: 'A A A Y',
    fontSize: 'C',

    ':focus': {
      outline: 'none',
      boxShadow: 'none'
    },

    '::placeholder': {
      opacity: '.5'
    }
  },

  Input_2: {
    name: 'email',
    type: 'email',
    borderBottomWidth: '.5px',
      borderBottomStyle: 'solid',
    borderBottomColor: 'black.3',
    minWidth: 'G',
    placeholder: (el) => (el.getRootState().form || {}).email,
     background: 'transparent',
     outline: 'none',
     padding: 'A A A Y',
     fontSize: 'C',

    ':focus': {
      outline: 'none',
      boxShadow: 'none'
    },

    '::placeholder': {
      opacity: '.5'
    }
  },

  Textarea: {
    name: 'message',
    placeholder: (el) => (el.getRootState().form || {}).message,
     minWidth: 'G',
      borderBottomWidth: '.5px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'black.3',
    resize: 'none',
     background: 'transparent',
     outline: 'none',
     padding: 'A A A Y',
     fontSize: 'C',

    ':focus': {
      outline: 'none',
      boxShadow: 'none'
    }
  },

  // success / error feedback line, filled by the onSubmit handler
  Status: {
    tag: 'p',
    text: '',
    'data-maketi-form-status': 'true',
    margin: 'A1 0 0 0',
    fontFamily: 'ALKTallMtavruli',
    fontSize: 'A',
    lineHeight: '1.2',
    opacity: '0',
    transition: 'opacity 240ms ease'
  },

  Button: {
    type: 'submit',
    boxSize: 'C2 C2',
    padding: '0',
    background: 'coralDark',
    color: 'black',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'coralDark',
    alignSelf: 'flex-end',
    margin: 'A1 0 0 0',
    cursor: 'pointer',
    display: 'flex',
    align: 'center center',
    justifyContent: 'center',
    transition: 'background 240ms ease, color 240ms ease',

    ':hover': {
      background: 'transparent',
      borderColor: 'coralDark',
      color: 'coralDark'
    },

    // the send glyph as a mask over currentColor, so it follows the button's
    // color on hover (a raster <img> can't be recolored). The mask URL is set
    // in onInit — a function-valued maskImage prop doesn't render
    SendGlyph: {
      tag: 'span',
      boxSize: 'B1 B1',
      display: 'block',
      'aria-label': '{{ ui.send }}',
      role: 'img',
      style: {
        backgroundColor: 'currentColor',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center'
      },
      onInit: (el) => {
        if (typeof window === 'undefined') return
        const poll = () => {
          if (el.node && el.context && el.context.files && el.context.files.send) {
            const url = 'url(' + el.context.files.send.src + ')'
            el.node.style.webkitMaskImage = url
            el.node.style.maskImage = url
          } else window.setTimeout(poll, 50)
        }
        poll()
      }
    }
  }
}
