<template>
  <div
    class="lg:min-h-screen flex items-center justify-center lg:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-5xl font-semibold text-gray-900 leading-[1.3]">
          Welcome, Login to your account.
        </h2>
      </div>

      <form class="mt-16 space-y-6" @submit.prevent>
        <div class="space-y-4">
          <div>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="Email address"
              @input="authStore.clearError"
            />
          </div>
          <div>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="Password"
              @input="authStore.clearError"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            :disabled="authStore.loading"
            class="btn btn-primary btn-full"
            @click="handleLogin"
          >
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div
          v-if="authStore.error"
          class="bg-red-50 border border-red-200 rounded-md p-4"
        >
          <p class="text-sm text-red-600">{{ authStore.error }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: '',
});

const handleLogin = async () => {
  try {
    const response = await authStore.login(form.value);
    if (response.status === 200) {
      router.push('/');
    }
  } catch (error) {
    // Error is already handled by the auth store and displayed in the template
  }
};
</script>

<style scoped>
label {
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 8px;
  display: block;
}
input[type='text'],
input[type='email'],
input[type='password'],
input[type='tel'],
input[type='date'] {
  display: block;
  width: 100%;
  height: 48px;
  border: 1px solid #ddd;
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 300;
  &:focus {
    outline: none;
    border-color: #313131;
    -webkit-box-shadow: 0 0 0 0.2rem rgba(49, 49, 49, 0.15);
    box-shadow: 0 0 0 0.2rem rgba(49, 49, 49, 0.15);
  }
}
.btn {
  padding: 10px 16px !important;
  border-radius: 999px;
  cursor: pointer;
  min-width: 120px;
  font-size: 18px !important;
  font-weight: 400 !important;
  letter-spacing: 0.5px;
}
.btn.btn-primary {
  background-color: #313131;
  border: 1px solid #313131;
  color: #fafafa;
  &:hover {
    box-shadow: 0 2px 20px 0 rgba(51, 51, 214, 0.4);
  }
}
.btn.btn-full {
  width: 100%;
}
</style>
