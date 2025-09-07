<template>
  <div class="post-details">
    <div class="mb-6">
      <Button variant="outline" @click="$router.go(-1)" class="mb-4">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back
      </Button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-gray-500">Loading post...</div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-2">{{ error }}</div>
      <Button @click="loadPost">Retry</Button>
    </div>

    <div v-else-if="post" class="max-w-4xl mx-auto">
      <!-- Post Header -->
      <div class="mb-8">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {{ post.status }}
          </span>
          <span>•</span>
          <span>Created {{ formatDate(post.createdAt) }}</span>
          <span v-if="post.publishedAt">
            • Published {{ formatDate(post.publishedAt) }}
          </span>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{ post.title }}
        </h1>

        <div class="text-lg text-gray-600 mb-4">
          {{ post.excerpt }}
        </div>

        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>By {{ post.author }}</span>
          <span v-if="post.tags" class="flex items-center gap-1">
            <Tag class="w-4 h-4" />
            {{ post.tags }}
          </span>
          <span
            v-if="post.isFeatured"
            class="flex items-center gap-1 text-yellow-600"
          >
            <Star class="w-4 h-4 fill-current" />
            Featured
          </span>
        </div>
      </div>

      <!-- Post Content -->
      <div class="bg-white rounded-lg shadow-sm border p-8">
        <div v-if="post.content" class="prose max-w-none">
          <div v-html="formattedContent"></div>
        </div>
        <div v-else class="text-gray-500 italic text-center py-8">
          No content available. Click "Edit Post" to add content.
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex justify-between items-center">
        <div class="flex gap-3">
          <Button @click="editPost">
            <Edit class="w-4 h-4 mr-2" />
            Edit Post
          </Button>
          <Button
            v-if="post.status === 'draft'"
            @click="publishPost"
            :disabled="publishing"
          >
            <span v-if="publishing">Publishing...</span>
            <span v-else>
              <Globe class="w-4 h-4 mr-2" />
              Publish
            </span>
          </Button>
        </div>

        <Button variant="destructive" @click="deletePost">
          <Trash2 class="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/ui/Button.vue';
import { ArrowLeft, Edit, Globe, Trash2, Tag, Star } from 'lucide-vue-next';
// import api from '@/services/api.js'; // TODO: Uncomment when implementing real API calls

const route = useRoute();
const router = useRouter();

const post = ref(null);
const loading = ref(true);
const error = ref(null);
const publishing = ref(false);

const formattedContent = computed(() => {
  if (!post.value?.content) return '';

  // Simple markdown-like formatting
  return post.value.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
});

const loadPost = async () => {
  loading.value = true;
  error.value = null;

  try {
    // For now, create a mock post since we don't have a get endpoint yet
    const slug = route.params.slug;

    // This would be replaced with an actual API call once you have the endpoint
    // const response = await api.get(`/api/post/${slug}`);
    // post.value = response.data;

    // Mock data for demonstration
    post.value = {
      id: crypto.randomUUID(),
      title: `Blog Post: ${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      slug: slug,
      excerpt:
        'This is a sample excerpt for the blog post created through the dialog.',
      content:
        '# Welcome to Your New Blog Post\n\nThis is the content area where you can write your blog post. You can use **bold** text, *italic* text, and other formatting.\n\n## Features\n\n- Easy editing\n- Markdown support\n- Rich formatting\n\n### Get Started\n\nClick "Edit Post" to start writing your content!',
      author: 'Admin User',
      status: 'draft',
      publishedAt: null,
      updatedAt: new Date().toISOString(),
      scheduledAt: null,
      tags: 'sample,blog,post',
      featuredImage: null,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load post';
  } finally {
    loading.value = false;
  }
};

const formatDate = dateString => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const editPost = () => {
  // Navigate to edit page or open edit modal
  console.log('Edit post:', post.value.id);
  // router.push(`/blog/post/${post.value.slug}/edit`);
  alert('Edit functionality would be implemented here');
};

const publishPost = async () => {
  if (publishing.value) return;

  publishing.value = true;
  try {
    // This would be an API call to update the post status
    // await api.put(`/api/post/${post.value.id}`, { status: 'published' });

    // Mock update
    post.value.status = 'published';
    post.value.publishedAt = new Date().toISOString();

    alert('Post published successfully!');
  } catch (err) {
    alert('Failed to publish post');
  } finally {
    publishing.value = false;
  }
};

const deletePost = async () => {
  if (
    !confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    )
  ) {
    return;
  }

  try {
    // This would be an API call to delete the post
    // await api.delete(`/api/post/${post.value.id}`);

    alert('Post deleted successfully!');
    router.push('/blog');
  } catch (err) {
    alert('Failed to delete post');
  }
};

onMounted(() => {
  loadPost();
});
</script>

<style scoped>
.prose {
  @apply text-gray-700 leading-relaxed;
}

.prose h1,
.prose h2,
.prose h3 {
  @apply text-gray-900;
}
</style>
