import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ServicesTree from '../views/ServicesTree.vue'
import ServicesTable from '../views/ServicesTable.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
	{
      path: '/',
      name: 'tree',
      component: ServicesTree
    },
	{
      path: '/:itemId',
      name: 'treeWithId',
      props: true,
      component: ServicesTree
    },
    {
      path: '/table',
      name: 'tableWithId',
      component: ServicesTable
    },
    {
      path: '/table/:itemId',
      name: 'table',
       props: true,
      component: ServicesTable
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
