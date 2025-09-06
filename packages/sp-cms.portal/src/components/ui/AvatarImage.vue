<template>
  <img
    v-if="!hasError && src"
    :src="src"
    :alt="alt"
    :class="cn('aspect-square h-full w-full', $attrs.class)"
    @error="handleError"
    @load="handleLoad"
  />
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
});

const hasError = ref(false);

const handleError = () => {
  hasError.value = true;
};

const handleLoad = () => {
  hasError.value = false;
};

// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>
