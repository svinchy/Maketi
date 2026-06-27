const ka = {
  nav: {
    services: 'სერვისები',
    projects: 'პროექტები',
    contact: 'კონტაქტი'
  },
  projects: {
    yours: 'შენი',
    current: 'მიმდინარე',
    done: 'დასრულებული'
  },
  section: {
    services: 'სერვისები',
    projects: 'პროექტები'
  },
  banner: {
    text: 'ჩვენ ვქნით სივრცეს სადაც ცხოვრება უკეთესია'
  },
  service: {
    title: 'პროექტირება'
  },
  services: {
    items: [
      { title: 'პროექტირება', image: 'plan' },
      { title: 'მშენებლობა', image: 'construction' },
      { title: 'დემონტაჟი', image: 'demolution' },
      { title: 'კედლების მოწყობა', image: 'walls' },
      { title: 'ელექტროობა', image: 'electric' },
      { title: 'სანტექნიკა', image: 'plumber' },
      { title: 'იატაკის დაგება', image: 'floor' },
      { title: 'გათბობის მონტაჟი', image: 'heat' },
      { title: 'სამღებრო სამუშაოები', image: 'paint' },
      { title: 'იზოლაცია', image: 'insulation' }
    ]
  },
  contact: {
    phone: {
      label: 'ნომერი',
      value: '568 084 105'
    },
    email: {
      label: 'მეილი',
      value: 'info@maketi.ge'
    }
  },
  form: {
    name: 'სახელი',
    email: 'მეილი',
    message: 'მიმოწერა'
  },
  footerBanner: {
    title: 'მაკეტი'
  }
}

const en = {
  nav: {
    services: 'Services',
    projects: 'Projects',
    contact: 'Contact'
  },
  projects: {
    yours: 'Yours',
    current: 'Current',
    done: 'Completed'
  },
  section: {
    services: 'Services',
    projects: 'Projects'
  },
  banner: {
    text: 'We create spaces where life is better'
  },
  service: {
    title: 'Planning'
  },
  services: {
    items: [
      { title: 'Planning', image: 'plan' },
      { title: 'Construction', image: 'construction' },
      { title: 'Demolition', image: 'demolution' },
      { title: 'Wall installation', image: 'walls' },
      { title: 'Electrical', image: 'electric' },
      { title: 'Plumbing', image: 'plumber' },
      { title: 'Flooring', image: 'floor' },
      { title: 'Heating installation', image: 'heat' },
      { title: 'Painting works', image: 'paint' },
      { title: 'Insulation', image: 'insulation' }
    ]
  },
  contact: {
    phone: {
      label: 'Phone',
      value: '568 084 105'
    },
    email: {
      label: 'Email',
      value: 'info@maketi.ge'
    }
  },
  form: {
    name: 'Name',
    email: 'Email',
    message: 'Message'
  },
  footerBanner: {
    title: 'Maketi'
  }
}

export default {
  lang: 'ka',
  translations: { ka, en },
  ...ka
}
