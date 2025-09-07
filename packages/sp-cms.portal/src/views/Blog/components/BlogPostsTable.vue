<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="text-gray-500">Loading posts...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 mb-2">{{ error }}</div>
      <Button @click="fetchPosts" variant="outline">Retry</Button>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="text-center py-8">
      <div class="text-gray-500 mb-4">No blog posts found</div>
      <Button @click="$emit('create-post')">Create Your First Post</Button>
    </div>

    <!-- Posts Table -->
    <div v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Excerpt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="post in posts" :key="post.id">
            <TableCell class="font-medium">
              <div class="max-w-[300px] truncate">{{ post.title }}</div>
            </TableCell>
            <TableCell>
              <div class="max-w-[400px] text-gray-500 truncate">
                {{ post.excerpt }}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex w-[100px] items-center">
                <span
                  :class="getStatusBadgeClass(post.status)"
                  class="inline-flex items-center rounded-md border border-[#e4e4e7] px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase"
                >
                  {{ post.status }}
                </span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <Button
                variant="outline"
                @click="navigateToPost(post.slug)"
                class="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <ArrowRight class="h-4 w-4" />
                <span class="sr-only">View post</span>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-2 py-4">
        <div class="text-sm text-gray-500">
          <span v-if="pagination.totalPages === 1">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </span>
          <span v-else>
            Showing {{ startItem }} to {{ endItem }} of
            {{ pagination.total }} posts
          </span>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="!pagination.hasPrev"
            @click="changePage(pagination.page - 1)"
            class="h-8 px-3"
          >
            Previous
          </Button>

          <div class="flex items-center gap-1">
            <template v-for="page in visiblePages" :key="page">
              <Button
                v-if="page !== '...'"
                variant="outline"
                size="sm"
                :class="{ 'bg-muted': page === pagination.page }"
                @click="changePage(page)"
                class="h-8 w-8 p-0"
              >
                {{ page }}
              </Button>
              <span v-else class="px-2 text-muted-foreground">...</span>
            </template>
          </div>

          <Button
            variant="outline"
            size="sm"
            :disabled="!pagination.hasNext"
            @click="changePage(pagination.page + 1)"
            class="h-8 px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import Table from '@/components/ui/Table.vue';
import TableHeader from '@/components/ui/TableHeader.vue';
import TableBody from '@/components/ui/TableBody.vue';
import TableRow from '@/components/ui/TableRow.vue';
import TableHead from '@/components/ui/TableHead.vue';
import TableCell from '@/components/ui/TableCell.vue';
import Button from '@/components/ui/Button.vue';
import { ArrowRight } from 'lucide-vue-next';
import api from '@/services/api.js';

const router = useRouter();

const props = defineProps({
  statusFilter: {
    type: String,
    default: 'all',
  },
  searchQuery: {
    type: String,
    default: '',
  },
});

const posts = ref([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
});
const loading = ref(false);
const error = ref(null);

defineEmits(['create-post']);

const startItem = computed(() => {
  return pagination.value.total === 0
    ? 0
    : (pagination.value.page - 1) * pagination.value.limit + 1;
});

const endItem = computed(() => {
  return Math.min(
    pagination.value.page * pagination.value.limit,
    pagination.value.total
  );
});

const visiblePages = computed(() => {
  const pages = [];
  const current = pagination.value.page;
  const total = pagination.value.totalPages;

  if (total <= 7) {
    // Show all pages if total is small
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Complex pagination logic
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
  }

  return pages;
});

const getStatusBadgeClass = status => {
  switch (status) {
    case 'published':
      return 'text-green-700 bg-green-50';
    case 'draft':
      return 'text-foreground bg-background';
    case 'archived':
      return 'text-red-700 bg-red-50';
    case 'scheduled':
      return 'text-blue-700 bg-blue-50';
    default:
      return 'text-foreground bg-background';
  }
};

const fetchPosts = async (page = 1) => {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      page,
      limit: pagination.value.limit,
    };

    // Add status filter if not 'all'
    if (props.statusFilter && props.statusFilter !== 'all') {
      params.status = props.statusFilter;
    }

    // Add search query if provided
    if (props.searchQuery && props.searchQuery.trim()) {
      params.search = props.searchQuery.trim();
    }

    const response = await api.get('/api/post/get-with-pagination', {
      params,
    });

    posts.value = response.data.posts;
    pagination.value = response.data.pagination;
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch posts';
    console.error('Failed to fetch posts:', err);
  } finally {
    loading.value = false;
  }
};

const changePage = page => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    fetchPosts(page);
  }
};

const navigateToPost = slug => {
  router.push(`/blog/post/${slug}`);
};

// Expose fetchPosts method for parent component
defineExpose({
  fetchPosts,
});

// Watch for status filter changes
watch(
  () => props.statusFilter,
  () => {
    pagination.value.page = 1; // Reset to first page
    fetchPosts(1);
  }
);

// Watch for search query changes
watch(
  () => props.searchQuery,
  () => {
    pagination.value.page = 1; // Reset to first page
    fetchPosts(1);
  }
);

onMounted(() => {
  fetchPosts();
});
</script>
