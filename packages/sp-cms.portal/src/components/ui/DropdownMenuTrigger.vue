<template>
  <button
    type="button"
    :class="cn('dropdown-trigger', $attrs.class)"
    @click="toggleDropdown"
    @keydown.enter="toggleDropdown"
    @keydown.space.prevent="toggleDropdown"
    @keydown.escape="closeDropdown"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
  >
    <slot />
  </button>
</template>

<script setup>
import { inject } from 'vue';

const isOpen = inject('dropdownIsOpen');
const toggleDropdown = inject('toggleDropdown');
const closeDropdown = inject('closeDropdown');

// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>

<style scoped>
.dropdown-trigger {
  cursor: pointer;
  outline: none;
}

.dropdown-trigger:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
