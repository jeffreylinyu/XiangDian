import { createRouter, createWebHistory } from 'vue-router'
import OrderView from '../views/OrderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'order',
      component: OrderView,
    },
    
  ],
})

export default router
