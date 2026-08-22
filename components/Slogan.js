export const Slogan = {
  extends: 'P',
  text: (el, s) => s[s.language].slogan,
  fontSize: 'B2',
  letterSpacing: '0.03em',
  maxWidth: (el, s) => s.root.language === 'ka' ? 'E2' : 'D1',
  lineHeight: '1.1em',
  textAlign: 'right',
}