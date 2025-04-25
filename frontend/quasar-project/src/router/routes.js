const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },

      { path: 'nova-objava', component: () => import('pages/CreatePost.vue') },
      { path: 'forum-komentari', component: () => import('pages/ForumCommentPage.vue') },
      { path: 'forum', component: () => import('pages/ForumPage.vue') }

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
