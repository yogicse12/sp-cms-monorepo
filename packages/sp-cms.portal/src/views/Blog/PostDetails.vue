<template>
  <div
    class="post-details flex flex-col bg-transparent details-wrapper relative"
  >
    <div
      class="flex justify-between items-center header absolute top-0 left-0 right-0 z-10"
    >
      <div>
        <Button size="sm" variant="ghost" @click="router.back()"
          ><ArrowLeft size="16" class="mr-2" />Back to Posts</Button
        >
      </div>
      <div class="flex gap-4 items-center">
        <Button size="sm" variant="outline"
          ><Save size="16" class="mr-2" />Save as draft</Button
        >
        <Button size="sm" variant="default"
          ><CloudUpload size="16" class="mr-2" />Publish Changes</Button
        >
      </div>
    </div>
    <div
      class="flex-1 grid grid-cols-7 gap-4 editor pt-[48px] p-0 overflow-hidden"
    >
      <div class="col-span-5 overflow-y-auto">
        <div
          class="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-full"
        ></div>
      </div>
      <div class="col-span-2 overflow-y-auto">
        <div
          class="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-full"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Button from '@/components/ui/Button.vue';
import { ArrowLeft, Save, CloudUpload } from 'lucide-vue-next';
const router = useRouter();
</script>

<style scoped>
.details-wrapper {
  height: calc(100vh - 106px);
}
</style>
