export const ScrollbarLine = {
  state: {
    progress: 0
  },
  scope: {},
  position: 'fixed',
  right: 'Z',
  top: (el, s) => `${s.progress}%`,
  transform: (el, s) => `translateY(-${s.progress}%)`,
  width: 'W',
  height: 'B1',
  background: 'black',
  zIndex: '100',
  pointerEvents: 'none',

  onInit: (el, s) => {
    const runtimeWindow = el.context.window || window
    const updateScrollLine = () => {
      const doc = runtimeWindow.document.documentElement
      const scrollable = doc.scrollHeight - runtimeWindow.innerHeight
      const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0
      s.update({ progress: Math.max(0, Math.min(100, progress * 100)) }, { preventFetch: true })
    }

    el.scope.updateScrollLine = updateScrollLine
    runtimeWindow.addEventListener('scroll', updateScrollLine, { passive: true })
    runtimeWindow.addEventListener('resize', updateScrollLine)
    updateScrollLine()
  },

  onRemove: (el) => {
    const runtimeWindow = el.context.window || window
    runtimeWindow.removeEventListener('scroll', el.scope.updateScrollLine)
    runtimeWindow.removeEventListener('resize', el.scope.updateScrollLine)
  }
}
