/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
// import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { verifySession } from '@/api/authenticationApi'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
  // routes: setupLayouts(routes),
})

router.beforeEach(async (to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      console.warn('No session token found. Redirecting to login...');
      return next('/admin/login'); // Redirect to login if no token
    }

    try {
      await verifySession(token); // Validate session token with backend
      next(); // Proceed to the requested route
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('sessionToken'); // Remove invalid token
      next('/admin/login'); // Redirect to login if token is invalid
    }
  } else {
    next(); // Proceed to the requested route
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
