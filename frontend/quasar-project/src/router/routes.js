import KalendarObaveza from 'src/pages/KalendarObaveza.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
<<<<<<< HEAD
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'folders', component: () => import('pages/FoldersPage.vue') },
      { path: 'folders/:folderId', component: () => import('pages/FolderContentPage.vue') },
=======
>>>>>>> kal_obv
      { path: 'notifikacija', component: () => import('pages/NotifikacijaDummy.vue') },
      { path: 'inbox', component: () => import('pages/InboxPage.vue') }, // <-- Dodano za Inbox
      { path: 'poruke', component: () => import('pages/PorukeMain.vue') },
      { path: 'kalendardog', component: () => import('pages/KalendarDog.vue') },
      { path: 'kalendar-obaveze', component: KalendarObaveza },
      { path: 'forum', component: () => import('pages/ForumPage.vue') },
      { path: 'objava/:id', component: () => import('pages/ForumCommentPage.vue') },
<<<<<<< HEAD
      { path: 'groups', component: () => import('pages/GroupMessagesUser.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') }
=======
      { path: 'register', component: () => import('pages/RegisterPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') }
>>>>>>> kal_obv
    ],
  },

  // Always leave this as last one,
  // but you can also remove it

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes