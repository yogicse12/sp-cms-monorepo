<template>
  <div class="rounded-md border border-[#e4e4e7] bg-white">
    <div class="relative w-full overflow-auto">
      <table :class="cn('w-full caption-bottom text-sm', $attrs.class)">
        <slot />
      </table>
    </div>
  </div>
</template>

<script setup>
import { cn } from '../../lib/utils';

// This component provides the base table wrapper with border and overflow handling
</script>
