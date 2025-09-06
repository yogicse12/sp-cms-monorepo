<template>
  <div
    :class="
      cn(
        'flex h-full w-full items-center justify-center rounded-full bg-[#4a4a4a] text-white font-semibold text-sm',
        $attrs.class
      )
    "
  >
    <slot>
      {{ fallbackText }}
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
});

// Generate initials from name for fallback
const fallbackText = computed(() => {
  if (!props.name) return '?';

  const words = props.name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
});

// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>
