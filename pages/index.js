import { main } from './main.js'
import { projectCottage, projectHouse, projectVilla } from './projectPages.js'

export default {
  '/': main,
  '/projects/cottage': projectCottage,
  '/projects/house': projectHouse,
  '/projects/villa': projectVilla
}
