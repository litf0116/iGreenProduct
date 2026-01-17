<template>
  <view class="photo-grid">
    <view
      v-for="(photo, index) in photos"
      :key="index"
      class="photo-item"
      @click="handlePreview(index)"
    >
      <image
        class="photo-image"
        :src="photo"
        mode="aspectFill"
      />
      <view class="photo-remove" @click.stop="handleRemove(index)">
        <text class="remove-icon">×</text>
      </view>
    </view>
    <view
      v-if="photos.length < maxCount"
      class="photo-add"
      @click="handleAdd"
    >
      <text class="add-icon">+</text>
      <text class="add-text">Add Photo</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  maxCount?: number;
}>(), {
  maxCount: 5,
});

const emit = defineEmits<{
  (e: 'change', photos: string[]): void;
  (e: 'preview', index: number): void;
}>();

const photos = ref<string[]>([]);

function handleAdd() {
  if (photos.value.length >= props.maxCount) {
    uni.showToast({
      title: `Maximum ${props.maxCount} photos`,
      icon: 'none',
    });
    return;
  }

  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      photos.value.push(tempFilePath);
      emit('change', photos.value);
      uploadPhoto(tempFilePath, photos.value.length - 1);
    },
  });
}

async function uploadPhoto(filePath: string, index: number) {
  try {
    const result = await uni.uploadFile({
      url: 'http://localhost:8000/api/files/upload',
      filePath,
      name: 'file',
    });

    if (result.statusCode === 200) {
      const data = JSON.parse(result.data);
      if (data.url) {
        photos.value[index] = data.url;
        emit('change', photos.value);
      }
    }
  } catch (error) {
    console.error('Upload failed:', error);
    uni.showToast({ title: 'Failed to upload', icon: 'none' });
  }
}

function handleRemove(index: number) {
  uni.showModal({
    title: 'Remove Photo',
    content: 'Are you sure you want to remove this photo?',
    success: (res) => {
      if (res.confirm) {
        photos.value.splice(index, 1);
        emit('change', photos.value);
      }
    },
  });
}

function handlePreview(index: number) {
  emit('preview', index);
  uni.previewImage({
    urls: photos.value,
    current: index,
  });
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-2;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: $radius-lg;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba($error-color, 0.8);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;

  .remove-icon {
    font-size: 14px;
    color: $white;
  }
}

.photo-add {
  aspect-ratio: 1;
  border: 2px dashed $gray-300;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-1;
  cursor: pointer;

  .add-icon {
    font-size: 24px;
    color: $gray-400;
  }

  .add-text {
    font-size: 10px;
    color: $gray-400;
  }
}
</style>
