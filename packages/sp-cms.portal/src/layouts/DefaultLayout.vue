<template>
  <AppSidebar />
  <AppHeader />
  <div class="main">
    <router-view />
  </div>
</template>

<script setup>
import AppSidebar from '@/components/Layout/AppSidebar.vue';
import AppHeader from '@/components/Layout/AppHeader.vue';
</script>

<style scoped>
.main {
  margin-left: 16rem;
  margin-top: 60px;
  padding: 20px 24px;
  background: #f4f4f4;
  min-height: calc(100vh - 60px);
  width: calc(100% - 16rem);
}
</style>
