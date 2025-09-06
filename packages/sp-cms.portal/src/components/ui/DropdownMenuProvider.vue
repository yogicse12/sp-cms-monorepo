<template>
  <div class="dropdown-menu-provider" ref="triggerRef">
    <slot
      :isOpen="isOpen"
      :toggle="toggleDropdown"
      :close="closeDropdown"
      :open="openDropdown"
    />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';

const isOpen = ref(false);
const triggerRef = ref(null);

const openDropdown = () => {
  isOpen.value = true;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Provide context to child components
provide('dropdownIsOpen', isOpen);
provide('toggleDropdown', toggleDropdown);
provide('closeDropdown', closeDropdown);
provide('openDropdown', openDropdown);
provide('dropdownTriggerRef', triggerRef);
</script>
