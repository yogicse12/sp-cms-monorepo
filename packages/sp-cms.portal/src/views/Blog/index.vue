<template>
  <div class="blog-management">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Blog Post Manager</h1>
        <p class="mt-1 text-sm text-gray-500">
          Easily create, edit, and organize your blog posts for a streamlined
          publishing experience.
        </p>
      </div>
      <Button>
        <Plus class="w-5 h-5 mr-2" />
        Create Post
      </Button>
    </div>
  </div>
</template>

<script setup>
import Button from '@/components/ui/Button.vue';
import { Plus } from 'lucide-vue-next';
</script>

<style scoped></style>
