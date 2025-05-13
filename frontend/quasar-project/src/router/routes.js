import KalendarObaveza from 'src/pages/KalendarObaveza.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },

      { path: 'notifikacija', component: () => import('pages/NotifikacijaDummy.vue') },
      { path: 'inbox', component: () => import('pages/InboxPage.vue') }, // <-- Dodano za Inbox
      {path: 'poruke', component: () => import('pages/PorukeMain.vue') },
      { path: 'kalendardog', component: () => import('pages/KalendarDog.vue') },
      { path: 'kalendar-obaveze', component: KalendarObaveza },    
      { path: 'forum', component: () => import('pages/ForumPage.vue') },
      { path: 'objava/:id', component: () => import('pages/ForumCommentPage.vue')},
      { path: '/login', component: () => import('pages/LoginPage.vue')} 
    ]

  },

  // Always leave this as last one,
  // but you can also remove it

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  }
]

export default routes
