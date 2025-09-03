<template>
  <div class="home">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <button @click="incrementCounter">Count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const title = ref('SP CMS Portal');
const description = ref('Welcome to your Content Management System');
const count = ref(0);

const incrementCounter = () => {
  count.value++;
};
</script>
