
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      { path: '', name: 'home', component: () => import('pages/index') }
    ]
  },
  {
    path: '/cluster',
    component: () => import('layouts/default'),
    children: [
      { path: '', name: 'cluster.list', component: () => import('pages/cluster/list') },
      { path: ':id', name: 'cluster.detail', component: () => import('pages/cluster/detail') }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
