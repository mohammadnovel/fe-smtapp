import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public landing page
    {
      path: '/',
      name: 'landing',
      component: () => import('@/pages/LandingPage.vue'),
      meta: { landing: true },
    },

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
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
        },
        {
          path: 'participants',
          name: 'participants',
          component: () => import('@/pages/participants/ParticipantListPage.vue'),
          meta: { menu: 'participants' },
        },
        {
          path: 'participants/:id',
          name: 'participant-detail',
          component: () => import('@/pages/participants/ParticipantDetailPage.vue'),
          meta: { menu: 'participants' },
        },
        {
          path: 'sessions',
          name: 'sessions',
          component: () => import('@/pages/sessions/SessionListPage.vue'),
          meta: { menu: 'sessions' },
        },
        {
          path: 'sessions/new',
          name: 'session-new',
          component: () => import('@/pages/sessions/SessionCreatePage.vue'),
          meta: { menu: 'sessions' },
        },
        {
          path: 'sessions/:id',
          name: 'session-detail',
          component: () => import('@/pages/sessions/SessionDetailPage.vue'),
          meta: { menu: 'sessions' },
        },
        {
          path: 'sessions/:id/input',
          name: 'session-input',
          component: () => import('@/pages/sessions/SessionInputPage.vue'),
          meta: { menu: 'sessions' },
        },
        {
          path: 'benchmarks',
          name: 'benchmarks',
          component: () => import('@/pages/BenchmarkPage.vue'),
          meta: { menu: 'benchmarks' },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/pages/UsersPage.vue'),
          meta: { adminOnly: true, menu: 'users' },
        },
        {
          path: 'billing',
          name: 'billing',
          component: () => import('@/pages/BillingPage.vue'),
          meta: { adminOnly: true, menu: 'billing' },
        },
        {
          path: 'master',
          name: 'master',
          component: () => import('@/pages/master/MasterDataPage.vue'),
          meta: { superAdminOnly: true },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/pages/NotificationsPage.vue'),
          meta: { menu: 'notifications' },
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

  if ((to.meta.guest || to.meta.landing) && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.adminOnly && !auth.isAdmin) {
    return { name: 'dashboard' }
  }

  if (to.meta.superAdminOnly && !auth.isSuperadmin) {
    return { name: 'dashboard' }
  }

  // Menu access is managed per role in Master Data
  const menu = to.meta.menu as string | undefined
  if (menu && !auth.isSuperadmin && auth.user?.menus && !auth.user.menus.includes(menu)) {
    return { name: 'dashboard' }
  }
})

router.afterEach((to) => {
  const auth = useAuthStore()
  // Show the renewal popup whenever a menu is opened while the subscription is locked
  auth.renewalPrompt = to.meta.requiresAuth !== undefined
    && auth.isSubscriptionLocked
    && to.name !== 'billing'
})

export default router
