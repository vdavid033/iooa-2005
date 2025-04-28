import KalendarObaveza from 'src/pages/KalendarObaveza.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'kalendardog', component: () => import('pages/KalendarDog.vue') },
      { path: 'kalendar-obaveze', component: KalendarObaveza },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path: '/KalendarObaveza',
    name: 'KalendarObaveza',
    component: () => import('pages/KalendarObaveza.vue'),
  },
]

export default routes
