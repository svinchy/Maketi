export const ChatButton = {
  extends: 'Button',
  boxSize: 'C1 C1',
  round: '100%',
  border: '0',
  padding: '0',
  background: 'coral.8',
  display: 'flex',
  align: 'center center',
  cursor: 'pointer',

  Bubble: {
    boxSize: 'B1 B1',
    round: '100%',
    background: 'black',
    display: 'flex',
    align: 'center center',
    gap: 'X2',
    childExtends: {
      boxSize: 'X1 X1',
      round: '100%',
      background: 'cream'
    },
    children: [{}, {}]
  }
}
