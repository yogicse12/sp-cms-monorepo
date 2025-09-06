<template>
  <div class="profile">
    <div class="profile-section bg-white px-16 py-12 rounded-lg mb-8">
      <h2 class="text-2xl font-bold mb-8">Personal Info</h2>
      <div class="grid grid-cols-3 gap-12">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="text-secondary text-lg font-bold mb-2">Full Name</div>
          <div class="text-lg">{{ user.name }}</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="text-secondary text-lg font-bold mb-2">Email Address</div>
          <div class="text-lg">{{ user.email }}</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="text-secondary text-lg font-bold mb-2">
            Date of Joining
          </div>
          <div class="text-lg">
            {{ dayjs(user.createdAt).format('DD MMMM, YYYY') }}
          </div>
        </div>
      </div>
    </div>
    <div class="change-password bg-white px-16 py-12 rounded-lg">
      <h2 class="text-2xl font-bold mb-8">Change Your Password</h2>
      <div class="grid grid-cols-3 gap-12">
        <Input
          v-model="password.currentPassword"
          type="password"
          placeholder="Current Password *"
          :class="errors.currentPassword ? 'border-red-500' : ''"
        />
        <Input
          v-model="password.newPassword"
          type="password"
          placeholder="New Password *"
          :class="errors.newPassword ? 'border-red-500' : ''"
        />
        <Input
          v-model="password.confirmPassword"
          type="password"
          placeholder="Confirm Password *"
          :class="errors.confirmPassword ? 'border-red-500' : ''"
        />
      </div>
      <!-- Error messages -->
      <div
        v-if="
          errors.currentPassword || errors.newPassword || errors.confirmPassword
        "
        class="mt-4 space-y-2"
      >
        <p v-if="errors.currentPassword" class="text-red-500 text-sm">
          {{ errors.currentPassword }}
        </p>
        <p v-if="errors.newPassword" class="text-red-500 text-sm">
          {{ errors.newPassword }}
        </p>
        <p v-if="errors.confirmPassword" class="text-red-500 text-sm">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <div class="mt-8">
        <Button @click="handleChangePassword" :disabled="isLoading">
          {{ isLoading ? 'Changing...' : 'Change Password' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import AlertDialogService from '@/composables/useAlertDialog';

const router = useRouter();

const authStore = useAuthStore();

const user = ref(null);

// Load user data asynchronously
const loadUserData = async () => {
  try {
    user.value = await authStore.getUserData();
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
};

// Load user data on component mount
loadUserData();

const password = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const errors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const isLoading = ref(false);

const validateForm = () => {
  // Clear previous errors
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  let isValid = true;

  // Validate current password
  if (
    !password.value.currentPassword ||
    password.value.currentPassword.trim() === ''
  ) {
    errors.value.currentPassword = 'Current password is required';
    isValid = false;
  }

  // Validate new password
  if (!password.value.newPassword || password.value.newPassword.trim() === '') {
    errors.value.newPassword = 'New password is required';
    isValid = false;
  }

  // Validate new password length
  if (password.value.newPassword.length < 8) {
    errors.value.newPassword = 'Password must be at least 8 characters';
    isValid = false;
  }

  // Validate confirm password
  if (
    !password.value.confirmPassword ||
    password.value.confirmPassword.trim() === ''
  ) {
    errors.value.confirmPassword = 'Confirm password is required';
    isValid = false;
  }

  // Validate confirm password
  if (password.value.newPassword !== password.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

const handleChangePassword = async () => {
  if (!validateForm()) {
    return;
  }

  // Show confirmation dialog before changing password
  const result = await AlertDialogService.confirm({
    title: 'Change Password?',
    text: 'Are you sure you want to change your password? You will be logged out after the change.',
    confirmButtonText: 'Yes, Change Password',
    cancelButtonText: 'Cancel',
    confirmVariant: 'default',
  });

  if (!result.isConfirmed) {
    return;
  }

  isLoading.value = true;
  try {
    const response = await authStore.changePassword(password.value);
    if (response) {
      await AlertDialogService.alert({
        title: 'Password Changed!',
        text: 'Your password has been successfully changed. You will be logged out.',
        confirmButtonText: 'OK',
      });
      logout();
    }
  } catch (error) {
    await AlertDialogService.alert({
      title: 'Error',
      text: error.response?.data?.error || 'Failed to change password',
      confirmButtonText: 'OK',
      confirmVariant: 'destructive',
    });
  } finally {
    isLoading.value = false;
    password.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped></style>
