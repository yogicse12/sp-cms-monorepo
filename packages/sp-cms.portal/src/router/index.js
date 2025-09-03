import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomePage.vue';
import Admin from '../views/AdminPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
