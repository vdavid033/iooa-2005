const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout1.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'groups', component: () => import('pages/GroupMessagesUser.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout2.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'groups-admin', component: () => import('pages/GroupMessagesAdmin.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
