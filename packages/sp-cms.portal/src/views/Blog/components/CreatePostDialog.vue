<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Blog Post</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <label for="title" class="text-sm font-medium leading-none">
            Title *
          </label>
          <Input
            id="title"
            v-model="form.title"
            placeholder="Enter blog post title..."
            required
            :disabled="loading"
            size="sm"
          />
        </div>

        <div class="space-y-2">
          <label for="excerpt" class="text-sm font-medium leading-none">
            Excerpt *
          </label>
          <Textarea
            id="excerpt"
            v-model="form.excerpt"
            placeholder="Write a brief excerpt for your blog post..."
            required
            :disabled="loading"
            class="resize-none"
            rows="3"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="$emit('update:open', false)"
            :disabled="loading"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="loading || !isFormValid">
            <span v-if="loading">Creating...</span>
            <span v-else>Create Post</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from '@/components/ui/Dialog.vue';
import DialogContent from '@/components/ui/DialogContent.vue';
import DialogHeader from '@/components/ui/DialogHeader.vue';
import DialogTitle from '@/components/ui/DialogTitle.vue';
import DialogFooter from '@/components/ui/DialogFooter.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import api from '@/services/api.js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:open', 'post-created']);
const router = useRouter();

const form = ref({
  title: '',
  excerpt: '',
});

const loading = ref(false);

const isFormValid = computed(() => {
  return (
    form.value.title.trim().length >= 3 &&
    form.value.excerpt.trim().length >= 10
  );
});

const resetForm = () => {
  form.value = {
    title: '',
    excerpt: '',
  };
};

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return;

  loading.value = true;

  try {
    const response = await api.post('/api/post/add', {
      title: form.value.title.trim(),
      excerpt: form.value.excerpt.trim(),
    });

    const { id, slug } = response.data;

    // Emit success event
    emit('post-created', { id, slug });

    // Close dialog
    emit('update:open', false);

    // Reset form
    resetForm();

    // Navigate to post details page
    router.push(`/blog/post/${slug}`);
  } catch (error) {
    console.error('Failed to create post:', error);

    // You could add a toast notification here
    alert(
      error.response?.data?.error ||
        'Failed to create blog post. Please try again.'
    );
  } finally {
    loading.value = false;
  }
};

// Reset form when dialog closes
const closeDialog = inject('closeDialog');
if (closeDialog) {
  // Watch for dialog close to reset form
  watch(
    () => props.open,
    newVal => {
      if (!newVal) {
        resetForm();
      }
    }
  );
}
</script>
