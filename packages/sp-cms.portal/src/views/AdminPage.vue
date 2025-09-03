<template>
  <div class="admin">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <h3>Content Items: {{ contentItems.length }}</h3>
      <ul>
        <li v-for="item in contentItems" :key="item.id">
          {{ item.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const title = ref('Admin Dashboard');
const description = ref('Manage your content here');
const isLoading = ref(true);
const contentItems = ref([]);

const loadContent = () => {
  setTimeout(() => {
    contentItems.value = [
      { id: 1, title: 'Sample Content 1' },
      { id: 2, title: 'Sample Content 2' },
    ];
    isLoading.value = false;
  }, 1000);
};

onMounted(() => {
  loadContent();
});
</script>

<style scoped>
.admin {
  text-align: center;
}
</style>
