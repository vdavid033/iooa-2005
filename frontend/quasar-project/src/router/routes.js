import KalendarObaveza from 'src/pages/KalendarObaveza.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'kalendar-obaveze', component: KalendarObaveza }, // Ovdje ide ruta za stranicu za unos obaveze
    ],
  },

  // Ako ne postoji ruta, prikazat će se stranica za grešku
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
