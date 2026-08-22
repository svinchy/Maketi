export const Contact = {
  flow: 'y',
  align: 'start',
  gap: 'C',
  padding: 'B',
  color: 'black',
  fontFamily: 'ALKTallMtavruli',

  Phone: {
    flow: 'y',
    align: 'end',
    gap: 'Z',

    H5: {
      text: '{{ contact.phone.label }}',
      color: 'black.4',
      fontSize: 'C',
      lineHeight: '1',
      textAlign: 'right'
    },

    P: {
      text: '{{ contact.phone.value }}',
      color: 'black',
      fontSize: 'D',
      lineHeight: '1',
      textAlign: 'right'
    }
  },

  Email: {
    flow: 'y',
    gap: 'Z',
    align: 'end',

    H5: {
      text: '{{ contact.email.label }}',
      color: 'black.4',
      fontSize: 'C',
      lineHeight: '1',
      textAlign: 'right'
    },

    P: {
      text: '{{ contact.email.value }}',
      color: 'black',
      fontSize: 'D',
      lineHeight: '1',
      textAlign: 'right'
    }
  }
}
