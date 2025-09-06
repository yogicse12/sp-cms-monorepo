<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="contentRef"
      :class="
        cn(
          'absolute z-50 min-w-[12rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-900 shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          $attrs.class
        )
      "
      :style="positionStyle"
      @click="handleContentClick"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup>
import { inject, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

const props = defineProps({
  align: {
    type: String,
    default: 'center', // 'start', 'center', 'end'
  },
  side: {
    type: String,
    default: 'bottom', // 'top', 'right', 'bottom', 'left'
  },
  sideOffset: {
    type: Number,
    default: 4,
  },
});

const isOpen = inject('dropdownIsOpen');
const closeDropdown = inject('closeDropdown');
const triggerRef = inject('dropdownTriggerRef');

const contentRef = ref(null);
const positionStyle = ref({});

// Calculate position based on trigger element
const calculatePosition = async () => {
  if (!triggerRef.value || !contentRef.value) return;

  await nextTick();

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const contentRect = contentRef.value.getBoundingClientRect();

  let top = 0;
  let left = 0;

  // Calculate vertical position
  if (props.side === 'bottom') {
    top = triggerRect.bottom + props.sideOffset;
  } else if (props.side === 'top') {
    top = triggerRect.top - contentRect.height - props.sideOffset;
  }

  // Calculate horizontal position
  if (props.align === 'start') {
    left = triggerRect.left;
  } else if (props.align === 'end') {
    left = triggerRect.right - contentRect.width;
  } else {
    // center
    left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
  }

  // Ensure dropdown stays within viewport
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  if (left < 0) left = 8;
  if (left + contentRect.width > viewport.width) {
    left = viewport.width - contentRect.width - 8;
  }
  if (top < 0) top = 8;
  if (top + contentRect.height > viewport.height) {
    top = viewport.height - contentRect.height - 8;
  }

  positionStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 50,
  };
};

// Handle clicks inside content (don't close dropdown)
const handleContentClick = event => {
  event.stopPropagation();
};

// Handle clicks outside dropdown
const handleClickOutside = event => {
  if (
    contentRef.value &&
    !contentRef.value.contains(event.target) &&
    triggerRef.value &&
    !triggerRef.value.contains(event.target)
  ) {
    closeDropdown();
  }
};

// Handle escape key
const handleEscape = event => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown();
  }
};

// Watch for open state changes to calculate position
watch(isOpen, newIsOpen => {
  if (newIsOpen) {
    nextTick(() => {
      calculatePosition();
    });
  }
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
  window.addEventListener('scroll', calculatePosition);
  window.addEventListener('resize', calculatePosition);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
  window.removeEventListener('scroll', calculatePosition);
  window.removeEventListener('resize', calculatePosition);
});

// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

@keyframes zoomOut {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.95);
  }
}
</style>
