<template>
  <div :class="cn('-mx-1 my-1 h-px bg-gray-200', $attrs.class)" />
</template>

<script setup>
// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>
