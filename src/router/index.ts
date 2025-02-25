import { createRouter, createWebHistory } from 'vue-router'
import OrderView from '../views/OrderView.vue'
import OrderConfirm from '../views/OrderConfirm.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'order',
      component: OrderView,
    },
    {
      path: '/order-confirm',
      name: 'order-confirm',
      component: OrderConfirm,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    }
  ],
})

export default router
