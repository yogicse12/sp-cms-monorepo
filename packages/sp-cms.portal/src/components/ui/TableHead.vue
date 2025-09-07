<template>
  <th
    :class="
      cn(
        'h-10 px-2 text-left align-middle font-medium text-muted-foreground text-[12px] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5',
        $attrs.class
      )
    "
  >
    <slot />
  </th>
</template>

<script setup>
import { cn } from '../../lib/utils';

// This component provides table header cell styling
</script>
