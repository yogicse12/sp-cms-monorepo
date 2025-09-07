<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      @click="handleOverlayClick"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup>
import { provide } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:open']);

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    emit('update:open', false);
  }
};

const closeDialog = () => {
  emit('update:open', false);
};

// Provide close function to child components
provide('closeDialog', closeDialog);
</script>
