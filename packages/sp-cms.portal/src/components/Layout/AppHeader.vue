<template>
  <header class="bg-white ml-64 navbar">
    <div class="pageInfo">
      <h1 class="text-xl font-bold">{{ $route.name }}</h1>
    </div>
    <div class="profile">
      <div class="username">
        <div class="text-secondary font-bold text-right">{{ name }}</div>
        <div class="text-right text-xs">{{ userName }}</div>
      </div>

      <DropdownMenuProvider>
        <template #default="{ toggle }">
          <button
            @click="toggle"
            class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          >
            <Avatar
              :fallback="name"
              class="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </button>

          <DropdownMenuContent align="end" :sideOffset="8">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem @click="goToProfile">
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                  <svg
                    class="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </div>
                <kbd
                  class="ml-auto text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-[0.1rem]"
                  ><ArrowBigUp size="10" /><Command size="10" /><span
                    >P</span
                  ></kbd
                >
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem @click="goToSettings">
              <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem @click="handleLogout">
              <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </template>
      </DropdownMenuProvider>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import Avatar from '@/components/ui/Avatar.vue';
import DropdownMenuProvider from '@/components/ui/DropdownMenuProvider.vue';
import DropdownMenuContent from '@/components/ui/DropdownMenuContent.vue';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue';
import DropdownMenuLabel from '@/components/ui/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '@/components/ui/DropdownMenuSeparator.vue';
import { ArrowBigUp, Command } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

// Use computed properties for reactivity with the auth store
const name = computed(() => {
  const userData = authStore.getUserData();
  return userData?.name || '';
});

const userName = computed(() => {
  const userData = authStore.getUserData();
  return userData?.email || '';
});

// Dropdown menu actions
const goToProfile = () => {
  router.push('/profile');
};

const goToSettings = () => {
  // Navigate to settings page when implemented
  router.push('/settings');
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/auth/login');
  } catch (error) {
    // Error handling - logout will redirect anyway
  }
};

// Keyboard shortcut handlers
const handleKeyboardShortcuts = event => {
  // Check for Shift + Cmd + P (Profile)
  if (event.shiftKey && event.metaKey && event.key.toLowerCase() === 'p') {
    event.preventDefault();
    goToProfile();
  }
};

// Add keyboard event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts);
});
</script>
<style scoped>
.navbar {
  position: fixed;
  top: 0;
  border-bottom: 1px solid #ebebeb;
  width: calc(100% - 16rem);
  height: 60px;
  background-color: #fafafa;
  padding: 4px 24px;
  z-index: 49;
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 16px;
}
.navbar .profile {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: 16px;
}
.navbar .profile .user {
  width: 48px;
  height: 48px;
  line-height: 60px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
}
.navbar .profile .user img {
  object-fit: cover;
}
</style>
