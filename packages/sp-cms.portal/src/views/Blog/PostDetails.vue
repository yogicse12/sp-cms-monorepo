<template>
  <div
    class="post-details flex flex-col bg-transparent details-wrapper relative"
  >
    <div
      class="flex justify-between items-center header absolute top-0 left-0 right-0 z-10"
    >
      <div>
        <Button size="sm" variant="ghost" @click="router.back()"
          ><ArrowLeft size="16" class="mr-2" />Back to Posts</Button
        >
      </div>
      <div class="flex gap-4 items-center">
        <Button
          size="sm"
          variant="outline"
          @click="saveAsDraft"
          :disabled="isLoading"
        >
          <Save size="16" class="mr-2" />
          {{ isLoading ? 'Saving...' : 'Save as draft' }}
        </Button>
        <Button
          size="sm"
          variant="default"
          @click="publishPost"
          :disabled="isLoading"
        >
          <CloudUpload size="16" class="mr-2" />
          {{ isLoading ? 'Publishing...' : 'Publish Changes' }}
        </Button>
      </div>
    </div>
    <!-- Error display -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mt-[48px] mb-4 mx-4"
    >
      <div class="flex items-center">
        <div class="text-red-600 text-sm">{{ error }}</div>
      </div>
    </div>

    <!-- Loading spinner -->
    <div
      v-if="isLoading && !article.title"
      class="flex items-center justify-center pt-[48px] p-4"
    >
      <div class="text-gray-600">Loading post details...</div>
    </div>

    <div
      v-else
      class="flex-1 grid grid-cols-7 gap-4 editor pt-[48px] p-0 overflow-hidden"
    >
      <div class="col-span-5 overflow-y-auto">
        <div class="min-h-full h-full">
          <ContentEditor
            id="content"
            v-model="article.content"
            :display-mode="displayMode"
            class="h-full"
          />
        </div>
      </div>
      <div class="col-span-2 overflow-y-auto">
        <div class="bg-white rounded-lg p-4 border border-gray-200 min-h-full">
          <h2 class="text-lg font-semibold mb-4">Post Details</h2>
          <div class="mb-4">
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-2"
              >Title</label
            >
            <Input id="title" v-model="article.title"></Input>
          </div>
          <div class="mb-4">
            <label
              for="excerpt"
              class="block text-sm font-medium text-gray-700 mb-2"
              >Excerpt</label
            >
            <Textarea
              id="excerpt"
              v-model="article.excerpt"
              class="resize-none h-[112px]"
            ></Textarea>
          </div>
          <div class="mb-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700"
                >Featured Post</label
              >
              <Switch v-model="article.isFeatured" size="default" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Dialog -->
    <Dialog v-model:open="successDialog.open">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Check size="20" class="text-green-600" />
            {{ successDialog.title }}
          </DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <p class="text-gray-600">{{ successDialog.message }}</p>
        </div>
        <DialogFooter>
          <Button @click="successDialog.open = false" size="sm"> Close </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ContentEditor from '@/components/common/ContentEditor.vue';
import { useRouter } from 'vue-router';
import Button from '@/components/ui/Button.vue';
import { ArrowLeft, Save, CloudUpload, Check } from 'lucide-vue-next';
import api from '@/services/api.js';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Dialog from '@/components/ui/Dialog.vue';
import DialogContent from '@/components/ui/DialogContent.vue';
import DialogHeader from '@/components/ui/DialogHeader.vue';
import DialogTitle from '@/components/ui/DialogTitle.vue';
import DialogFooter from '@/components/ui/DialogFooter.vue';
import Switch from '@/components/ui/Switch.vue';

const router = useRouter();

const article = ref({
  title: '',
  excerpt: '',
  content: '',
  status: 'draft',
  tags: '',
  featuredImage: null,
  isFeatured: false,
});
const displayMode = ref('EDIT');
const isLoading = ref(false);
const error = ref(null);
const successDialog = ref({
  open: false,
  title: '',
  message: '',
});

const getPostDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const postId = router.currentRoute.value.params.id;
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const { data } = await api.get(`/api/post/fetch/${postId}`);

    if (data) {
      article.value = {
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        status: data.status || 'draft',
        tags: data.tags || '',
        featuredImage: data.featuredImage || null,
        isFeatured: data.isFeatured || false,
      };
    }
  } catch (err) {
    error.value =
      err.response?.data?.error || err.message || 'Failed to load post details';
    console.error('Error loading post details:', err);
  } finally {
    isLoading.value = false;
  }
};

const saveAsDraft = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const postId = router.currentRoute.value.params.id;
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (!article.value.title || !article.value.excerpt) {
      throw new Error('Title and excerpt are required');
    }

    const updateData = {
      title: article.value.title,
      excerpt: article.value.excerpt,
      content: article.value.content,
      status: 'draft',
      tags: article.value.tags,
      featuredImage: article.value.featuredImage,
      isFeatured: article.value.isFeatured,
    };

    const response = await api.put(`/api/post/update/${postId}`, updateData);

    if (response.data && response.data.success) {
      article.value = {
        title: response.data.post.title || '',
        excerpt: response.data.post.excerpt || '',
        content: response.data.post.content || '',
        status: response.data.post.status || 'draft',
        tags: response.data.post.tags || '',
        featuredImage: response.data.post.featuredImage || null,
        isFeatured: response.data.post.isFeatured || false,
      };

      successDialog.value = {
        open: true,
        title: 'Success!',
        message: 'Post saved as draft successfully',
      };
    }
  } catch (err) {
    error.value =
      err.response?.data?.error || err.message || 'Failed to save post';
    console.error('Error saving post as draft:', err);
  } finally {
    isLoading.value = false;
  }
};

const publishPost = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const postId = router.currentRoute.value.params.id;
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (
      !article.value.title ||
      !article.value.excerpt ||
      !article.value.content
    ) {
      throw new Error('Title, excerpt, and content are required to publish');
    }

    const updateData = {
      title: article.value.title,
      excerpt: article.value.excerpt,
      content: article.value.content,
      status: 'published',
      tags: article.value.tags,
      featuredImage: article.value.featuredImage,
      isFeatured: article.value.isFeatured,
    };

    const response = await api.put(`/api/post/update/${postId}`, updateData);

    if (response.data && response.data.success) {
      article.value = {
        title: response.data.post.title || '',
        excerpt: response.data.post.excerpt || '',
        content: response.data.post.content || '',
        status: response.data.post.status || 'published',
        tags: response.data.post.tags || '',
        featuredImage: response.data.post.featuredImage || null,
        isFeatured: response.data.post.isFeatured || false,
      };

      successDialog.value = {
        open: true,
        title: 'Success!',
        message: 'Post published successfully',
      };
    }
  } catch (err) {
    error.value =
      err.response?.data?.error || err.message || 'Failed to publish post';
    console.error('Error publishing post:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getPostDetails();
});
</script>

<style scoped>
.details-wrapper {
  height: calc(100vh - 106px);
}

.editor {
  min-height: 0;
}
</style>
