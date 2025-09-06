<template>
  <div
    :class="cn('px-2 py-1.5 text-sm font-semibold text-gray-900', $attrs.class)"
  >
    <slot />
  </div>
</template>

<script setup>
// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>
