import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import AuthLayout from '@/layouts/AuthLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import LoginPage from '@/views/auth/LoginPage.vue';
import HomeView from '@/views/HomeView.vue';
import ProfilePage from '@/views/ProfilePage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'Login',
          component: LoginPage,
          meta: { guest: true },
        },
      ],
    },
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          name: 'Home',
          component: HomeView,
          meta: { requiresAuth: true },
        },
        {
          path: '/profile',
          name: 'Profile',
          component: ProfilePage,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      redirect: '/auth/login',
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login');
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
