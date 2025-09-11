<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="switchClass"
    @click="toggle"
  >
    <span :class="thumbClass" />
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'default',
  },
  class: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
        lg: 'h-7 w-13',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        default: 'h-5 w-5',
        sm: 'h-4 w-4',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const switchClass = computed(() => {
  const baseClasses = switchVariants({ size: props.size });
  const stateClasses = props.modelValue ? 'bg-blue-600' : 'bg-gray-200';

  return cn(baseClasses, stateClasses, props.class);
});

const thumbClass = computed(() => {
  const baseClasses = thumbVariants({ size: props.size });
  const transformClasses = props.modelValue
    ? props.size === 'sm'
      ? 'translate-x-4'
      : props.size === 'lg'
        ? 'translate-x-6'
        : 'translate-x-5'
    : 'translate-x-0';

  return cn(baseClasses, transformClasses);
});
</script>
