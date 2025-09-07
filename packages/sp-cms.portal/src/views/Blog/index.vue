<template>
  <div class="blog-management space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Blog Post Manager</h1>
        <p class="mt-1 text-sm text-gray-500">
          Easily create, edit, and organize your blog posts for a streamlined
          publishing experience.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Input
          v-model="searchQuery"
          placeholder="Search posts..."
          size="sm"
          class="w-[200px] bg-white border-[#e4e4e7]"
        />
        <Select v-model="selectedStatus">
          <SelectTrigger class="w-[180px] bg-white border-[#e4e4e7]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        <Button @click="showCreateDialog = true" size="sm">
          <Plus class="w-5 h-5 mr-2" />
          Create Post
        </Button>
      </div>
    </div>

    <!-- Blog Posts Table -->
    <BlogPostsTable
      ref="blogPostsTableRef"
      :status-filter="selectedStatus"
      :search-query="debouncedSearchQuery"
      @create-post="showCreateDialog = true"
    />

    <!-- Create Post Dialog -->
    <CreatePostDialog
      v-model:open="showCreateDialog"
      @post-created="handlePostCreated"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import SelectTrigger from '@/components/ui/SelectTrigger.vue';
import SelectValue from '@/components/ui/SelectValue.vue';
import SelectContent from '@/components/ui/SelectContent.vue';
import SelectItem from '@/components/ui/SelectItem.vue';
import CreatePostDialog from './components/CreatePostDialog.vue';
import BlogPostsTable from './components/BlogPostsTable.vue';
import { Plus } from 'lucide-vue-next';

const showCreateDialog = ref(false);
const blogPostsTableRef = ref(null);
const selectedStatus = ref('all');
const searchQuery = ref('');
const debouncedSearchQuery = ref('');

// Debounce search query
let searchTimeout = null;
watch(searchQuery, newValue => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newValue;
  }, 300); // 300ms debounce delay
});

const handlePostCreated = postData => {
  console.log('Post created:', postData);

  // Refresh the table to show the new post
  if (blogPostsTableRef.value && blogPostsTableRef.value.fetchPosts) {
    blogPostsTableRef.value.fetchPosts();
  }
};
</script>

<style scoped></style>
