import { createRouter, createWebHistory } from 'vue-router';
import { securityGuard } from '@/middleware/security.js';
import AuthLayout from '@/layouts/AuthLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import LoginPage from '@/views/auth/LoginPage.vue';
import HomeView from '@/views/HomeView.vue';
import BlogPage from '@/views/Blog/index.vue';
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
          meta: {
            guest: true,
            requiresSecureHeaders: true,
          },
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
          redirect: '/blog',
        },
        {
          path: '/blog',
          name: 'Blog',
          component: BlogPage,
          meta: { requiresAuth: true },
        },
        {
          path: '/profile',
          name: 'Profile',
          component: ProfilePage,
          meta: {
            requiresAuth: true,
            requiresSecureHeaders: true,
          },
        },
      ],
    },
    {
      path: '/login',
      redirect: '/auth/login',
    },
  ],
});

// Use security guard middleware for all routes
router.beforeEach(securityGuard);

export default router;
