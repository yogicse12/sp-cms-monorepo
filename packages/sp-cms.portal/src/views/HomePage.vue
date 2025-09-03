<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
    <div class="mx-auto max-w-md space-y-6 text-center">
      <h1 class="text-4xl font-bold text-gray-900">{{ title }}</h1>
      <p class="text-gray-600">{{ description }}</p>
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p class="mb-4 text-gray-900">Counter: {{ count }}</p>
        <Button @click="incrementCounter" variant="destructive" size="lg" class="w-full">
          Click me!
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '../components/ui/Button.vue';

const title = ref('SP CMS Portal');
const description = ref('Welcome to your Content Management System');
const count = ref(0);

const incrementCounter = () => {
  count.value++;
};
</script>

