<template>
  <td
    :class="
      cn(
        'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5',
        $attrs.class
      )
    "
  >
    <slot />
  </td>
</template>

<script setup>
import { cn } from '../../lib/utils';

// This component provides table data cell styling
</script>
