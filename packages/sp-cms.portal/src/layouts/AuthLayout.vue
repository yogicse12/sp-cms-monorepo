<template>
  <div class="login grid lg:grid-cols-5 stretch lg:h-screen items-center">
    <div class="lg:col-span-3">
      <div class="gradient-bg px-8 py-24 lg:h-screen">
        <div
          class="flex flex-col items-center justify-center lg:h-full gap-y-8"
        ></div>
      </div>
    </div>
    <div class="lg:col-span-2">
      <router-view />
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.login .gradient-bg {
  background-image: url('@/assets/images/five-elements-login-wp.jpg');
  background-size: cover;
  width: 100%;
}
.login .brand {
  letter-spacing: 2px;
}
</style>
