<template>
  <div
    :class="
      cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        $attrs.class
      )
    "
  >
    <AvatarImage v-if="src" :src="src" :alt="alt" />
    <AvatarFallback v-else :name="fallback" />
  </div>
</template>

<script setup>
import AvatarImage from './AvatarImage.vue';
import AvatarFallback from './AvatarFallback.vue';

defineProps({
  src: {
    type: String,
    default: null,
  },
  alt: {
    type: String,
    default: '',
  },
  fallback: {
    type: String,
    default: '',
  },
});

// Utility function for class merging (similar to shadcn UI)
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>
