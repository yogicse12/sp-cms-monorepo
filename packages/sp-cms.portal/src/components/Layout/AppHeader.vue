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
      <Avatar :fallback="name" class="h-10 w-10" />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import Avatar from '@/components/ui/Avatar.vue';

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
