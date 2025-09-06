import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

// Security imports
import { initializeSecurity } from '@/lib/security.js';
import { useAuthStore } from '@/stores/auth.js';

// Initialize security measures
initializeSecurity();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize auth store and session
const authStore = useAuthStore();

// Setup session management
let activityTimer = null;
let sessionCheckTimer = null;

const resetActivityTimer = () => {
  if (activityTimer) {
    clearTimeout(activityTimer);
  }

  // Auto-logout after 30 minutes of inactivity
  activityTimer = setTimeout(() => {
    authStore.handleSessionTimeout();
  }, 1800000); // 30 minutes
};

const setupActivityTracking = () => {
  // Track user activity
  const activities = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ];

  activities.forEach(activity => {
    document.addEventListener(
      activity,
      () => {
        authStore.updateActivity();
        resetActivityTimer();
      },
      { passive: true }
    );
  });

  resetActivityTimer();
};

const setupSessionValidation = () => {
  // Check session validity every 5 minutes
  sessionCheckTimer = setInterval(async () => {
    if (authStore.isAuthenticated) {
      const isValid = await authStore.validateSession();
      if (!isValid) {
        clearInterval(sessionCheckTimer);
      }
    }
  }, 300000); // 5 minutes
};

// Initialize session tracking after app starts
const initializeApp = async () => {
  try {
    // Setup activity tracking and session validation
    setupActivityTracking();
    setupSessionValidation();
  } catch (error) {
    console.warn('App initialization failed:', error);
  }
};

// Mount app and initialize
app.mount('#app');
initializeApp();

// Cleanup on app unmount
window.addEventListener('beforeunload', () => {
  if (activityTimer) clearTimeout(activityTimer);
  if (sessionCheckTimer) clearInterval(sessionCheckTimer);
});
