<template>
  <tr
    :class="
      cn(
        'border-b border-[#e4e4e7] transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        $attrs.class
      )
    "
  >
    <slot />
  </tr>
</template>

<script setup>
import { cn } from '../../lib/utils';

// This component provides table row styling with hover effects
</script>
