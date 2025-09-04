<template>
  <header class="bg-white ml-64 navbar">
    <div class="pageInfo">
      <h1 class="text-xl font-bold">{{ $route.name }}</h1>
    </div>
    <div class="profile">
      <div class="username">
        <div class="text-secondary font-bold text-right">{{ name }}</div>
        <div class="text-right text-xs">{{ userName }}</div>
      </div>
      <!-- <AvatarComponent :name="name"></AvatarComponent> -->
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
//  import AvatarComponent from '@/components/Common/Avatar.vue';

const name = ref('');
const userName = ref('');

if (localStorage.getItem('user')) {
  const user = JSON.parse(localStorage.getItem('user'));
  name.value = user.name;
  userName.value = user.email;
}
</script>
<style scoped>
.navbar {
  position: fixed;
  top: 0;
  border-bottom: 1px solid #ebebeb;
  width: calc(100% - 16rem);
  height: 60px;
  background-color: #fafafa;
  padding: 4px 24px;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 16px;
}
.navbar .profile {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: 16px;
}
.navbar .profile .user {
  width: 48px;
  height: 48px;
  line-height: 60px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
}
.navbar .profile .user img {
  object-fit: cover;
}
</style>
