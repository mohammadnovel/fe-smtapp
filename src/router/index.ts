import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/RegisterPage.vue'),
      meta: { guest: true },
    },

    // App (requires auth)
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
        },
        {
          path: 'participants',
          name: 'participants',
          component: () => import('@/pages/participants/ParticipantListPage.vue'),
        },
        {
          path: 'participants/:id',
          name: 'participant-detail',
          component: () => import('@/pages/participants/ParticipantDetailPage.vue'),
        },
        {
          path: 'sessions',
          name: 'sessions',
          component: () => import('@/pages/sessions/SessionListPage.vue'),
        },
        {
          path: 'sessions/new',
          name: 'session-new',
          component: () => import('@/pages/sessions/SessionCreatePage.vue'),
        },
        {
          path: 'sessions/:id',
          name: 'session-detail',
          component: () => import('@/pages/sessions/SessionDetailPage.vue'),
        },
        {
          path: 'sessions/:id/input',
          name: 'session-input',
          component: () => import('@/pages/sessions/SessionInputPage.vue'),
        },
        {
          path: 'benchmarks',
          name: 'benchmarks',
          component: () => import('@/pages/BenchmarkPage.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/pages/UsersPage.vue'),
          meta: { adminOnly: true },
        },
        {
          path: 'billing',
          name: 'billing',
          component: () => import('@/pages/BillingPage.vue'),
          meta: { adminOnly: true },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/pages/NotificationsPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.user) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.adminOnly && !auth.isAdmin) {
    return { name: 'dashboard' }
  }
})

export default router
