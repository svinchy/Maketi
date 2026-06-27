export const Contact = {
  flow: 'y',
  align: 'start',
  gap: 'B',
  padding: 'B',
  color: 'black',

  Phone: {
    flow: 'y',
    align: 'start',
    gap: 'Z',

    H5: {
      text: '{{ contact.phone.label }}',
      color: 'black.4',
      fontSize: 'B',
      lineHeight: '1'
    },

    P: {
      text: '{{ contact.phone.value }}',
      color: 'black',
      fontSize: 'D',
      lineHeight: '1'
    }
  },

  Email: {
    flow: 'y',
    align: 'start',
    gap: 'Z',

    H5: {
      text: '{{ contact.email.label }}',
      color: 'black.4',
      fontSize: 'B',
      lineHeight: '1'
    },

    P: {
      text: '{{ contact.email.value }}',
      color: 'black',
      fontSize: 'D',
      lineHeight: '1'
    }
  }
}
