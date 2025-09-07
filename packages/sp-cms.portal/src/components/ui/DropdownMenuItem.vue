<template>
  <button
    v-if="!href"
    type="button"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full',
        $attrs.class
      )
    "
    :disabled="disabled"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <slot />
  </button>

  <a
    v-else
    :href="href"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        $attrs.class
      )
    "
    @click="handleClick"
  >
    <slot />
  </a>
</template>

<script setup>
import { inject } from 'vue';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  href: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['click']);
const closeDropdown = inject('closeDropdown');

const handleClick = event => {
  if (props.disabled) return;

  emit('click', event);

  // Close dropdown after click (unless prevented)
  if (!event.defaultPrevented) {
    closeDropdown();
  }
};

// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>
