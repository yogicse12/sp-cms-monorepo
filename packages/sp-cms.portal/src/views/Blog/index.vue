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
      <Button @click="showCreateDialog = true">
        <Plus class="w-5 h-5 mr-2" />
        Create Post
      </Button>
    </div>

    <!-- Create Post Dialog -->
    <CreatePostDialog
      v-model:open="showCreateDialog"
      @post-created="handlePostCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '@/components/ui/Button.vue';
import CreatePostDialog from './components/CreatePostDialog.vue';
import { Plus } from 'lucide-vue-next';

const showCreateDialog = ref(false);

const handlePostCreated = postData => {
  console.log('Post created:', postData);
  // You can add additional logic here, like refreshing a post list
};
</script>

<style scoped></style>
