import app from './app.js'
import config from './config.js'
import state from './state.js'
import dependencies from './dependencies.js'
import sharedLibraries from './sharedLibraries.js'
import globalScope from './globalScope.js'
import cases from './cases.js'
import * as components from './components/index.js'
import * as sections from './sections/index.js'
import pages from './pages/index.js'
import designSystem from './designSystem/index.js'
import * as functions from './functions/index.js'
import * as methods from './methods/index.js'
import * as snippets from './snippets/index.js'
import files from './files/index.js'

export default {
  ...config,
  app,
  state,
  dependencies,
  sharedLibraries,
  globalScope,
  cases,
  components: {
    ...components,
    ...sections
  },
  sections,
  pages,
  designSystem,
  functions,
  methods,
  snippets,
  files
}
