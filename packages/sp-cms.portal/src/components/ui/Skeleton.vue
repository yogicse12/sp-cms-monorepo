<template>
  <div :class="cn('animate-pulse rounded-md bg-muted', $attrs.class)">
    <slot />
  </div>
</template>

<script setup>
import { cn } from '../../lib/utils';

// This component provides skeleton loading placeholders
</script>
