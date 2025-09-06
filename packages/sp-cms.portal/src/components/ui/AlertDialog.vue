<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      @click="handleOverlayClick"
    >
      <div
        class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
        @click.stop
      >
        <div class="flex flex-col space-y-2 text-center sm:text-left">
          <div v-if="title" class="text-lg font-semibold">
            {{ title }}
          </div>
          <div v-if="description" class="text-sm text-gray-500">
            {{ description }}
          </div>
        </div>
        <div
          class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
        >
          <Button v-if="showCancel" variant="outline" @click="handleCancel">
            {{ cancelText }}
          </Button>
          <Button :variant="confirmVariant" @click="handleConfirm">
            {{ confirmText }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from './Button.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  confirmVariant: {
    type: String,
    default: 'default',
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:open', 'confirm', 'cancel']);

const isOpen = ref(props.open);

watch(
  () => props.open,
  newValue => {
    isOpen.value = newValue;
  }
);

watch(isOpen, newValue => {
  emit('update:open', newValue);
});

const handleConfirm = () => {
  emit('confirm');
  isOpen.value = false;
};

const handleCancel = () => {
  emit('cancel');
  isOpen.value = false;
};

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleCancel();
  }
};
</script>
