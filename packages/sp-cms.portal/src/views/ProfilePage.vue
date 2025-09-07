<template>
  <div class="profile">
    <!-- Profile Image Section -->
    <div class="profile-image-section bg-white px-16 py-12 rounded-lg mb-8">
      <h2 class="text-2xl font-bold mb-8">Profile Image</h2>
      <div class="flex items-center gap-8">
        <div class="relative">
          <div
            class="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-gray-300"
          >
            <img
              v-if="user?.imageUrl || previewUrl"
              :src="previewUrl || getImageUrl(user?.imageUrl)"
              alt="Profile Image"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-500"
            >
              <User :size="48" />
            </div>
          </div>
          <div
            v-if="imageUploading"
            class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
          >
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"
            ></div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex gap-4">
            <Button @click="triggerFileUpload" :disabled="imageUploading">
              {{ imageUploading ? 'Uploading...' : 'Upload New Image' }}
            </Button>
            <Button
              v-if="user?.imageUrl && !imageUploading"
              variant="outline"
              @click="removeImage"
            >
              Remove Image
            </Button>
          </div>
          <p class="text-sm text-gray-500">
            JPG, PNG or GIF. Max size 5MB. Recommended: 400x400px
          </p>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="hidden"
          />
        </div>
      </div>
    </div>

    <div class="profile-section bg-white px-16 py-12 rounded-lg mb-8">
      <h2 class="text-2xl font-bold mb-8">Personal Info</h2>
      <div class="grid grid-cols-3 gap-12">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="text-secondary text-lg font-bold mb-2">Full Name</div>
          <div class="text-lg">{{ user?.name || 'Loading...' }}</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="text-secondary text-lg font-bold mb-2">Email Address</div>
          <div class="text-lg">{{ user?.email || 'Loading...' }}</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="text-secondary text-lg font-bold mb-2">
            Date of Joining
          </div>
          <div class="text-lg">
            {{
              user?.createdAt
                ? dayjs(user.createdAt).format('DD MMMM, YYYY')
                : 'Loading...'
            }}
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
import { User } from 'lucide-vue-next';
import api from '@/services/api.js';

const router = useRouter();

const authStore = useAuthStore();

const user = ref(null);

// Load user data asynchronously
const loadUserData = async () => {
  try {
    await authStore.fetchUserInfo();
    user.value = authStore.getUserData();
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
const imageUploading = ref(false);
const previewUrl = ref('');
const fileInput = ref(null);

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

const getImageUrl = imageUrl => {
  if (!imageUrl) return null;

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a relative URL, prepend the API base URL
  const API_BASE_URL =
    import.meta.env.VITE_ENDPOINT || 'https://sp-cms-api.yogicse12.workers.dev';
  return `${API_BASE_URL}${imageUrl}`;
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleImageUpload = async event => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    await AlertDialogService.alert({
      title: 'Invalid File Type',
      text: 'Please select an image file (JPG, PNG, or GIF)',
      confirmButtonText: 'OK',
      confirmVariant: 'destructive',
    });
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    await AlertDialogService.alert({
      title: 'File Too Large',
      text: 'Image size must be less than 5MB',
      confirmButtonText: 'OK',
      confirmVariant: 'destructive',
    });
    return;
  }

  // Show preview
  const reader = new FileReader();
  reader.onload = e => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // Upload image
  imageUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/api/auth/upload-profile-image', formData);

    if (response.data.success) {
      // Update auth store and local user data
      await authStore.fetchUserInfo();
      user.value = authStore.getUserData();
      previewUrl.value = '';

      await AlertDialogService.alert({
        title: 'Success!',
        text: 'Profile image updated successfully',
        confirmButtonText: 'OK',
      });
    }
  } catch (error) {
    previewUrl.value = '';
    await AlertDialogService.alert({
      title: 'Upload Failed',
      text: error.response?.data?.error || 'Failed to upload image',
      confirmButtonText: 'OK',
      confirmVariant: 'destructive',
    });
  } finally {
    imageUploading.value = false;
    // Clear the file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const removeImage = async () => {
  const result = await AlertDialogService.confirm({
    title: 'Remove Profile Image?',
    text: 'Are you sure you want to remove your profile image?',
    confirmButtonText: 'Yes, Remove',
    cancelButtonText: 'Cancel',
    confirmVariant: 'destructive',
  });

  if (!result.isConfirmed) {
    return;
  }

  imageUploading.value = true;
  try {
    const response = await api.delete('/api/auth/remove-profile-image');

    if (response.data.success) {
      // Update auth store and local user data
      await authStore.fetchUserInfo();
      user.value = authStore.getUserData();

      await AlertDialogService.alert({
        title: 'Image Removed',
        text: 'Your profile image has been removed successfully',
        confirmButtonText: 'OK',
      });
    }
  } catch (error) {
    await AlertDialogService.alert({
      title: 'Remove Failed',
      text: error.response?.data?.error || 'Failed to remove profile image',
      confirmButtonText: 'OK',
      confirmVariant: 'destructive',
    });
  } finally {
    imageUploading.value = false;
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped></style>
