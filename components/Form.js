export const Form = {
  tag: 'form',
  extends: 'Flex',
  flow: 'y',
  padding: 'C',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'black.3',
  childProps: {
    round: '0',
  },

  Input: {
    name: 'name',
    type: 'text',
    minWidth: 'G3',
   borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'black.3',
    placeholder: 'სახელი',
    background: 'transparent',
    outline: 'none',
    padding: 'A A A Y',
    fontSize: 'A2',

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
    borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'black.3',
    minWidth: 'G3',
    placeholder: 'მეილი',
     background: 'transparent',
     outline: 'none',
     padding: 'A A A Y',
     fontSize: 'A2',

    ':focus': {
      outline: 'none',
      boxShadow: 'none'
    },

    '::placeholder': {
      opacity: '.5'
    }
  },

  Textarea: {
    placeholder: 'მოიწერე',
     minWidth: 'G3',
      borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'black.3',
    resize: 'none',
     background: 'transparent',
     outline: 'none',
     padding: 'A A A Y',
     fontSize: 'A2',

    ':focus': {
      outline: 'none',
      boxShadow: 'none'
    }
  },

  Button: {
    type: 'submit',
    boxSize: 'C2 C2',
    padding: '0',
    background: 'coral.9',
    alignSelf: 'flex-end',
    margin: 'A1 0 0 0',
    Img: {
      src: (el) => el.context.files.send.src,
      alt: 'send',
      boxSize: 'B1 B1',
      display: 'block'
    }

  }
}
