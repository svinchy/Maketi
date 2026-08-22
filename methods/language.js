const setAttr = (node, name, value) => {
  if (node && value !== undefined && value !== null) node.setAttribute(name, String(value))
}

const renderServiceList = (list, lines) => {
  if (!list) return
  list.textContent = ''
  ;(lines || []).forEach((line, index) => {
    const li = document.createElement('li')
    li.style.display = 'flex'
    li.style.gap = '0.9em'
    li.style.alignItems = 'baseline'
    li.style.padding = '0.7em 0'
    li.style.borderBottom = '1px dashed rgba(0, 0, 0, .25)'
    if (index === 0) li.style.borderTop = '1px dashed rgba(0, 0, 0, .25)'

    const num = document.createElement('span')
    num.textContent = String(index + 1).padStart(2, '0')
    num.style.color = '#FF7C5B'
    num.style.flexShrink = '0'
    num.style.width = '1.8em'

    const body = document.createElement('span')
    body.textContent = line
    body.style.opacity = '.65'

    li.appendChild(num)
    li.appendChild(body)
    list.appendChild(li)
  })
}

const syncGeneratedLanguageDom = (content, previous) => {
  if (typeof document === 'undefined' || !content) return

  document.documentElement.setAttribute('lang', content.lang || '')

  const serviceItems = Array.from(document.querySelectorAll('[data-maketi-service-item]'))
  serviceItems.forEach((item, index) => {
    const service = content.services && content.services.items && content.services.items[index]
    if (!service) return
    setAttr(item, 'data-maketi-service-title', service.title)
    setAttr(item, 'data-maketi-service-image', service.image)
    setAttr(item, 'data-maketi-service-intro', service.intro || '')
    setAttr(item, 'data-maketi-service-list', (service.list || []).join('\n'))
    setAttr(item.querySelector('[data-maketi-service-photo]'), 'alt', service.title)
  })

  const title = document.querySelector('[data-maketi-services-title]')
  if (title && content.services && content.services.items) {
    const oldTitle = title.textContent.replace(/\s+/g, ' ').trim()
    const oldIndex = previous && previous.services && previous.services.items
      ? previous.services.items.findIndex((service) => service.title === oldTitle)
      : -1
    const index = oldIndex >= 0 ? oldIndex : 0
    title.textContent = content.services.items[index] ? content.services.items[index].title : ''
  }

  const panels = Array.from(document.querySelectorAll('[data-maketi-project-panel]'))
  panels.forEach((panel, index) => {
    const project = content.projects && content.projects.panels && content.projects.panels[index]
    if (!project) return
    setAttr(panel, 'data-maketi-project-title-text', project.title)
    setAttr(panel.querySelector('[data-maketi-project-panel-image]'), 'alt', project.title)
  })

  const openProjectTitle = document.querySelector('[data-maketi-projects-open-title]')
  if (openProjectTitle && content.projects && content.projects.panels) {
    const oldProjectTitle = openProjectTitle.textContent.replace(/\s+/g, ' ').trim()
    const oldProjectIndex = previous && previous.projects && previous.projects.panels
      ? previous.projects.panels.findIndex((project) => project.title === oldProjectTitle)
      : -1
    if (oldProjectIndex >= 0 && content.projects.panels[oldProjectIndex]) {
      openProjectTitle.textContent = content.projects.panels[oldProjectIndex].title
    }
  }

  const form = content.form || {}
  setAttr(document.querySelector('input[name="name"]'), 'placeholder', form.name)
  setAttr(document.querySelector('input[name="email"]'), 'placeholder', form.email)
  setAttr(document.querySelector('textarea[name="message"]'), 'placeholder', form.message)

  const modal = document.querySelector('[data-maketi-service-content]')
  if (!modal || getComputedStyle(modal).display === 'none') return

  const heading = modal.querySelector('[data-maketi-service-content-title]')
  const oldModalTitle = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : ''
  const modalIndex = previous && previous.services && previous.services.items
    ? previous.services.items.findIndex((service) => service.title === oldModalTitle)
    : -1
  const service = content.services && content.services.items && content.services.items[modalIndex >= 0 ? modalIndex : 0]
  if (!service) return

  if (heading) heading.textContent = service.title.split(' ').join('\n')
  const intro = modal.querySelector('[data-maketi-service-content-intro]')
  if (intro) intro.textContent = service.intro || ''
  renderServiceList(modal.querySelector('[data-maketi-service-content-list]'), service.list)
}

export const setLanguage = (state, lang) => {
  const content = state.translations && state.translations[lang]
  if (!content) return

  const previous = state.translations[state.lang]
  const runtime = state.runtime || {}
  const languageRevision = (runtime.languageRevision || 0) + 1
  const next = { ...content, lang }

  state.update({
    lang,
    runtime: {
      ...runtime,
      languageRevision
    },
    ...content
  })

  syncGeneratedLanguageDom(next, previous)
  window.setTimeout(() => syncGeneratedLanguageDom(next, previous), 80)
}
