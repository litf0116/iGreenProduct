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
        <Card class="info-card">
          <InfoRow label="Status">
            <template #value>
              <StatusBadge :status="ticket.status" />
            </template>
          </InfoRow>
          <InfoRow label="Priority">
            <template #value>
              <PriorityBadge :priority="ticket.priority" />
            </template>
          </InfoRow>
          <InfoRow label="Type">
            <template #value>
              <TypeBadge :type="ticket.type" />
            </template>
          </InfoRow>
          <InfoRow label="Location" :value="ticket.location || '-'" />
          <InfoRow label="Reported By" :value="ticket.requesterName || '-'" />
          <InfoRow label="Reported At" :value="formatDateTime(ticket.createdAt)" />
          <InfoRow v-if="ticket.assigneeName" label="Assigned To" :value="ticket.assigneeName" />
        </Card>

        <Card class="section-card">
          <template #header>
            <text class="card-title">Issue Description</text>
          </template>
          <text class="description-title">{{ ticket.title }}</text>
          <text class="description-text">{{ ticket.description }}</text>
        </Card>

        <Card v-if="ticket.steps && ticket.steps.length > 0" class="section-card">
          <template #header>
            <text class="card-title">Maintenance Steps</text>
          </template>
          <StepList :steps="ticket.steps" @toggle="handleToggleStep" />
        </Card>

        <Card v-if="showPhotoSection" class="section-card">
          <template #header>
            <text class="card-title">Photos</text>
          </template>
          <PhotoGrid @change="handlePhotosChange" @preview="handlePreviewPhoto" />
        </Card>

        <ActionCard
          v-if="ticket.status === 'OPEN'"
          type="accept"
          title="New Opportunity"
          subtitle="This ticket is available. Accept it to start the workflow."
          button-text="Accept & Assign to Me"
          :loading="loading"
          @action="handleAccept"
        />

        <ActionCard
          v-else-if="ticket.status === 'ASSIGNED' || ticket.status === 'ACCEPTED'"
          type="depart"
          title="Ready to Depart?"
          subtitle="Confirm when you are leaving for the site."
          button-text="Depart Now"
          :loading="loading"
          @action="handleDepart"
        />

        <ActionCard
          v-else-if="ticket.status === 'DEPARTED'"
          type="arrive"
          title="En Route"
          :subtitle="`You are on the way to ${ticket.location}`"
          button-text="I Have Arrived"
          :loading="loading"
          @action="handleArrive"
        />

        <ActionCard
          v-else-if="ticket.status === 'IN_PROGRESS' || ticket.status === 'ARRIVED'"
          type="complete"
          title="On Site - Work in Progress"
          subtitle="Complete the steps and finish the work"
          button-text="Complete Work"
          :loading="loading"
          @action="handleComplete"
        />

        <Card v-else-if="ticket.status === 'REVIEW'" class="action-card">
          <view class="action-content">
            <view class="action-icon icon-purple">
              <text class="icon">👁</text>
            </view>
            <text class="action-title">Pending Review</text>
            <text class="action-subtitle">Waiting for admin approval</text>
          </view>
        </Card>

        <Card v-else-if="ticket.status === 'COMPLETED'" class="action-card">
          <view class="action-content">
            <view class="action-icon icon-green">
              <text class="icon">✔</text>
            </view>
            <text class="action-title">Work Order Completed</text>
            <text class="action-subtitle">Completed at {{ formatDateTime(ticket.completedAt) }}</text>
          </view>
        </Card>
      </view>
    </scroll-view>

    <view class="loading-overlay" v-if="loading">
      <Loading size="lg" text="Processing..." />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCurrentTicket, setCurrentTicket, getCachedTickets, setCachedTickets } from '@/store';
import { api } from '@/utils/api';
import { formatDateTime } from '@/types/ticket';
import type { Ticket } from '@/types/ticket';
import { Card, Loading, InfoRow } from '@/components/ui';
import { StatusBadge, PriorityBadge, TypeBadge, PhotoGrid, StepList, ActionCard } from '@/components/tickets';

const props = defineProps<{
  id: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const loading = ref(false);
const photos = ref<string[]>([]);
const ticketData = ref<Ticket | null>(getCurrentTicket());
const cachedTickets = ref<Ticket[]>(getCachedTickets());

const ticket = computed(() => ticketData.value);

const showPhotoSection = computed(() => {
  const status = ticket.value?.status;
  return ['DEPARTED', 'IN_PROGRESS', 'ARRIVED', 'REVIEW'].includes(status || '');
});

async function loadTicket(id: string) {
  loading.value = true;
  try {
    // Try to get from cache first
    const cached = cachedTickets.value.find(t => t.id === id);
    if (cached) {
      ticketData.value = cached;
    }
    // Fetch from API
    const data = await api.getTicket(id);
    ticketData.value = data;
    setCurrentTicket(data);
  } catch (error) {
    console.error('Failed to load ticket:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadTicket(props.id);
});

function handleClose() {
  emit('close');
}

async function handleAccept() {
  if (!ticket.value) return;
  loading.value = true;
  try {
    await api.acceptTicket(ticket.value.id);
    await loadTicket(props.id);
    // Update cache
    const updated = await api.getTickets({ page: 0, size: 20 });
    setCachedTickets(updated.records);
    cachedTickets.value = updated.records;
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
    await api.departTicket(ticket.value.id, photo);
    await loadTicket(props.id);
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
    await api.arriveTicket(ticket.value.id, photo);
    await loadTicket(props.id);
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
    await api.completeTicket(ticket.value.id, photo);
    await loadTicket(props.id);
  } catch (error) {
    console.error('Failed to complete ticket:', error);
  } finally {
    loading.value = false;
  }
}

function handleToggleStep(index: number) {
  if (!ticket.value?.steps) return;
  const steps = [...ticket.value.steps];
  steps[index] = { ...steps[index], completed: !steps[index].completed };
  ticket.value.steps = steps;
}

function handlePhotosChange(newPhotos: string[]) {
  photos.value = newPhotos;
}

function handlePreviewPhoto(index: number) {
  uni.previewImage({
    urls: photos.value,
    current: index,
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
  background: $background;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.detail-header {
  height: 56px;
  background: $card;
  border-bottom: 1px solid $border;
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
  color: $foreground;
}

.header-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  color: $foreground;
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

.info-card {
  padding: 0;
}

.section-card {
  padding: 0;

  :deep(.card-header) {
    padding-bottom: 0;
  }
}

.card-title {
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: $muted-foreground;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description-title {
  font-size: $text-base;
  font-weight: $font-weight-bold;
  color: $foreground;
  display: block;
  margin-bottom: $spacing-2;
}

.description-text {
  font-size: $text-sm;
  color: $foreground;
  opacity: 0.7;
  line-height: 1.6;
}

.action-card {
  padding: $spacing-6;
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

  &.icon-purple { background: oklch(39.8% 0.07 227.39 / 10%); }
  &.icon-green { background: oklch(60% 0.118 184.7 / 10%); }

  .icon {
    font-size: 24px;
  }
}

.action-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  color: $foreground;
}

.action-subtitle {
  font-size: $text-sm;
  color: $foreground;
  opacity: 0.7;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: oklch(100% 0 0 / 80%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
</style>
