<template>
  <view class="ticket-detail" v-if="ticket">
    <view class="detail-header">
      <view class="header-left" @click="handleClose">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">{{ ticket.id }}</text>
      <view class="header-right"></view>
    </view>

    <scroll-view class="detail-scroll" scroll-y>
      <view class="detail-content">
        <view class="ticket-info-card">
          <view class="info-row">
            <text class="info-label">Status</text>
            <view class="status-badge" :class="getStatusClass(ticket.status)">
              <text class="status-text">{{ getStatusLabel(ticket.status) }}</text>
            </view>
          </view>
          <view class="info-row">
            <text class="info-label">Priority</text>
            <view class="priority-badge" :class="getPriorityClass(ticket.priority)">
              <text class="priority-text">{{ getPriorityLabel(ticket.priority) }}</text>
            </view>
          </view>
          <view class="info-row">
            <text class="info-label">Type</text>
            <view class="type-badge" :class="getTypeClass(ticket.type)">
              <text class="type-text">{{ getTypeLabel(ticket.type) }}</text>
            </view>
          </view>
          <view class="info-row">
            <text class="info-label">Location</text>
            <text class="info-value">{{ ticket.location || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">Reported By</text>
            <text class="info-value">{{ ticket.requesterName || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">Reported At</text>
            <text class="info-value">{{ formatDateTime(ticket.createdAt) }}</text>
          </view>
          <view class="info-row" v-if="ticket.assigneeName">
            <text class="info-label">Assigned To</text>
            <text class="info-value">{{ ticket.assigneeName }}</text>
          </view>
        </view>

        <view class="description-card">
          <text class="card-title">Issue Description</text>
          <text class="description-text">{{ ticket.title }}</text>
          <text class="description-detail">{{ ticket.description }}</text>
        </view>

        <view class="steps-card" v-if="ticket.steps && ticket.steps.length > 0">
          <text class="card-title">Maintenance Steps</text>
          <view class="steps-list">
            <view 
              class="step-item" 
              v-for="(step, index) in ticket.steps" 
              :key="step.id"
            >
              <view class="step-checkbox" :class="{ completed: step.completed }" @click="toggleStep(index)">
                <text class="check-icon">{{ step.completed ? '✓' : '' }}</text>
              </view>
              <text class="step-label">{{ step.label }}</text>
            </view>
          </view>
        </view>

        <view class="photos-card" v-if="showPhotoSection">
          <text class="card-title">Photos</text>
          <view class="photos-grid">
            <view 
              class="photo-item" 
              v-for="(photo, index) in photos" 
              :key="index"
            >
              <image 
                class="photo-image" 
                :src="photo" 
                mode="aspectFill"
                @click="previewPhoto(photo)"
              />
              <view class="photo-remove" @click="removePhoto(index)">
                <text class="remove-icon">×</text>
              </view>
            </view>
            <view class="photo-add" @click="addPhoto" v-if="photos.length < 5">
              <text class="add-icon">+</text>
              <text class="add-text">Add Photo</text>
            </view>
          </view>
        </view>

        <view class="action-card" v-if="ticket.status === 'OPEN'">
          <view class="action-content">
            <view class="action-icon bg-blue">
              <text class="icon">⚡</text>
            </view>
            <view class="action-text">
              <text class="action-title">New Opportunity</text>
              <text class="action-subtitle">This ticket is available. Accept it to start the workflow.</text>
            </view>
          </view>
          <view class="accept-btn" @click="handleAccept">
            <text class="btn-text">Accept & Assign to Me</text>
          </view>
        </view>

        <view class="action-card" v-else-if="ticket.status === 'ASSIGNED' || ticket.status === 'ACCEPTED'">
          <view class="action-content">
            <view class="action-icon bg-indigo">
              <text class="icon">🚗</text>
            </view>
            <view class="action-text">
              <text class="action-title">Ready to Depart?</text>
              <text class="action-subtitle">Confirm when you are leaving for the site.</text>
            </view>
          </view>
          <view class="depart-btn" @click="handleDepart">
            <text class="btn-text">Depart Now</text>
          </view>
        </view>

        <view class="action-card" v-else-if="ticket.status === 'DEPARTED'">
          <view class="action-content">
            <view class="action-icon bg-orange">
              <text class="icon">📍</text>
            </view>
            <view class="action-text">
              <text class="action-title">En Route</text>
              <text class="action-subtitle">You are on the way to {{ ticket.location }}</text>
            </view>
          </view>
          <view class="arrive-btn" @click="handleArrive">
            <text class="btn-text">I Have Arrived</text>
          </view>
        </view>

        <view class="action-card" v-else-if="ticket.status === 'IN_PROGRESS' || ticket.status === 'ARRIVED'">
          <view class="action-content">
            <view class="action-icon bg-green">
              <text class="icon">🔧</text>
            </view>
            <view class="action-text">
              <text class="action-title">On Site - Work in Progress</text>
              <text class="action-subtitle">Complete the steps and finish the work</text>
            </view>
          </view>
          <view class="finish-btn" @click="handleComplete">
            <text class="btn-text">Complete Work</text>
          </view>
        </view>

        <view class="action-card" v-else-if="ticket.status === 'REVIEW'">
          <view class="action-content">
            <view class="action-icon bg-purple">
              <text class="icon">👁</text>
            </view>
            <view class="action-text">
              <text class="action-title">Pending Review</text>
              <text class="action-subtitle">Waiting for admin approval</text>
            </view>
          </view>
        </view>

        <view class="action-card" v-else-if="ticket.status === 'COMPLETED'">
          <view class="action-content">
            <view class="action-icon bg-green">
              <text class="icon">✔</text>
            </view>
            <view class="action-text">
              <text class="action-title">Work Order Completed</text>
              <text class="action-subtitle">Completed at {{ formatDateTime(ticket.completedAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="loading-overlay" v-if="loading">
      <view class="loading-spinner"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTicketStore } from '@/store/modules/tickets';
import { getStatusLabel, getStatusClass, getPriorityLabel, getPriorityClass, getTypeClass, formatDateTime } from '@/utils/helpers';
import { getTypeLabel } from '@/types/ticket';
import { api } from '@/utils/api';

const props = defineProps<{
  id: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const ticketStore = useTicketStore();
const loading = ref(false);
const photos = ref<string[]>([]);

const ticket = computed(() => ticketStore.currentTicket);

const showPhotoSection = computed(() => {
  const status = ticket.value?.status;
  return ['DEPARTED', 'IN_PROGRESS', 'ARRIVED', 'REVIEW'].includes(status || '');
});

onMounted(async () => {
  loading.value = true;
  try {
    await ticketStore.loadTicket(props.id);
  } finally {
    loading.value = false;
  }
});

function handleClose() {
  emit('close');
}

async function handleAccept() {
  if (!ticket.value) return;
  loading.value = true;
  try {
    await ticketStore.acceptTicket(ticket.value.id);
    await ticketStore.loadTicket(props.id);
  } catch (error) {
    console.error('Failed to accept ticket:', error);
  } finally {
    loading.value = false;
  }
}

async function handleDepart() {
  if (!ticket.value) return;
  loading.value = true;
  try {
    const photo = photos.value.length > 0 ? photos.value[0] : undefined;
    await ticketStore.departTicket(ticket.value.id, photo);
    await ticketStore.loadTicket(props.id);
  } catch (error) {
    console.error('Failed to depart:', error);
  } finally {
    loading.value = false;
  }
}

async function handleArrive() {
  if (!ticket.value) return;
  loading.value = true;
  try {
    const photo = photos.value.length > 0 ? photos.value[0] : undefined;
    await ticketStore.arriveTicket(ticket.value.id, photo);
    await ticketStore.loadTicket(props.id);
  } catch (error) {
    console.error('Failed to arrive:', error);
  } finally {
    loading.value = false;
  }
}

async function handleComplete() {
  if (!ticket.value) return;
  loading.value = true;
  try {
    const photo = photos.value.length > 0 ? photos.value[0] : undefined;
    await ticketStore.completeTicket(ticket.value.id, photo);
    await ticketStore.loadTicket(props.id);
  } catch (error) {
    console.error('Failed to complete ticket:', error);
  } finally {
    loading.value = false;
  }
}

function toggleStep(index: number) {
  if (!ticket.value?.steps) return;
  const steps = [...ticket.value.steps];
  steps[index] = { ...steps[index], completed: !steps[index].completed };
  ticket.value.steps = steps;
}

function addPhoto() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      photos.value.push(tempFilePath);
      uploadPhoto(tempFilePath);
    },
  });
}

async function uploadPhoto(filePath: string) {
  const token = uni.getStorageSync('auth_token');
  if (!token) {
    uni.showToast({ title: 'Please login first', icon: 'none' });
    return;
  }

  try {
    const result = await api.uploadFile({ filePath });
    const index = photos.value.indexOf(filePath);
    if (index > -1 && result.url) {
      photos.value[index] = result.url;
    }
  } catch (error) {
    console.error('Failed to upload photo:', error);
    uni.showToast({ title: 'Failed to upload photo', icon: 'none' });
  }
}

function removePhoto(index: number) {
  photos.value.splice(index, 1);
}

function previewPhoto(url: string) {
  uni.previewImage({
    urls: photos.value,
    current: url,
  });
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.ticket-detail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $white;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.detail-header {
  height: 56px;
  background: $white;
  border-bottom: 1px solid $gray-200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-4;
}

.header-left {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 20px;
  color: $gray-700;
  cursor: pointer;
}

.header-title {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $gray-900;
}

.header-right {
  width: 40px;
}

.detail-scroll {
  flex: 1;
  padding: $spacing-4;
  padding-bottom: 80px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.ticket-info-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-xl;
  padding: $spacing-4;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 0;
  border-bottom: 1px solid $gray-50;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: $text-sm;
  color: $gray-500;
}

.info-value {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-900;
  text-align: right;
  max-width: 60%;
}

.status-badge, .priority-badge, .type-badge {
  padding: $spacing-1 $spacing-2;
  border-radius: $radius-full;
  font-size: 12px;
  font-weight: $font-medium;
}

.status-badge {
  &.bg-blue { background: rgba($blue-500, 0.1); color: $blue-600; }
  &.bg-indigo { background: rgba($indigo-500, 0.1); color: $indigo-600; }
  &.bg-orange { background: rgba($orange-500, 0.1); color: $orange-600; }
  &.bg-yellow { background: rgba($yellow-500, 0.1); color: $yellow-600; }
  &.bg-purple { background: rgba($purple-500, 0.1); color: $purple-600; }
  &.bg-green { background: rgba($green-500, 0.1); color: $green-600; }
}

.priority-badge {
  &.priority-P1 { background: rgba($error-color, 0.1); color: $error-color; }
  &.priority-P2 { background: rgba($warning-color, 0.1); color: $warning-color; }
  &.priority-P3 { background: rgba($gray-500, 0.1); color: $gray-600; }
  &.priority-P4 { background: rgba($gray-200, 0.5); color: $gray-500; }
}

.type-badge {
  &.type-CORRECTIVE { background: rgba($orange-500, 0.1); color: $orange-600; }
  &.type-PLANNED { background: rgba($blue-500, 0.1); color: $blue-600; }
  &.type-PREVENTIVE { background: rgba($green-500, 0.1); color: $green-600; }
  &.type-PROBLEM { background: rgba($rose-500, 0.1); color: $rose-600; }
}

.description-card, .steps-card, .photos-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-xl;
  padding: $spacing-4;
}

.card-title {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: $spacing-3;
}

.description-text {
  font-size: $text-base;
  font-weight: $font-bold;
  color: $gray-900;
  display: block;
  margin-bottom: $spacing-2;
}

.description-detail {
  font-size: $text-sm;
  color: $gray-600;
  line-height: 1.6;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.step-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 0;
}

.step-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid $gray-300;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &.completed {
    background: $green-500;
    border-color: $green-500;
  }

  .check-icon {
    font-size: 14px;
    color: $white;
  }
}

.step-label {
  font-size: $text-sm;
  color: $gray-700;
  flex: 1;

  &.completed {
    color: $gray-400;
    text-decoration: line-through;
  }
}

.photos-grid {
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

.action-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-xl;
  padding: $spacing-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-3;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-blue { background: rgba($blue-500, 0.1); }
  &.bg-indigo { background: rgba($indigo-500, 0.1); }
  &.bg-orange { background: rgba($orange-500, 0.1); }
  &.bg-yellow { background: rgba($yellow-500, 0.1); }
  &.bg-purple { background: rgba($purple-500, 0.1); }
  &.bg-green { background: rgba($green-500, 0.1); }

  .icon {
    font-size: 24px;
  }
}

.action-title {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $gray-900;
  display: block;
}

.action-subtitle {
  font-size: $text-sm;
  color: $gray-600;
  max-width: 280px;
}

.accept-btn, .depart-btn, .arrive-btn, .finish-btn {
  width: 100%;
  max-width: 280px;
  height: 48px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:active {
    opacity: 0.8;
  }
}

.accept-btn { background: $blue-600; }
.depart-btn { background: $indigo-600; }
.arrive-btn { background: $orange-600; }
.finish-btn { background: $green-600; }

.btn-text {
  font-size: $text-base;
  font-weight: $font-medium;
  color: $white;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($white, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid $gray-200;
  border-top-color: $blue-500;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
