import KalendarObaveza from 'src/pages/KalendarObaveza.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'folders', component: () => import('pages/FoldersPage.vue') },
      { path: 'folders/:folderId', component: () => import('pages/FolderContentPage.vue') },
      { path: 'notifikacija', component: () => import('pages/NotifikacijaDummy.vue') },
      { path: 'inbox', component: () => import('pages/InboxPage.vue') }, // <-- Dodano za Inbox
      { path: 'poruke', component: () => import('pages/PorukeMain.vue') },
      { path: 'kalendardog', component: () => import('pages/KalendarDog.vue') },
      { path: 'kalendar-obaveze', component: KalendarObaveza },
      { path: 'forum', component: () => import('pages/ForumPage.vue') },
      { path: 'objava/:id', component: () => import('pages/ForumCommentPage.vue') },
      { path: 'groups', component: () => import('pages/GroupMessagesUser.vue') },
      { path: 'groups-admin', component: () => import('pages/GroupMessagesAdmin.vue') }
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
