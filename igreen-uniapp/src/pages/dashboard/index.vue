<template>
  <view class="dashboard">
    <view class="welcome-section">
      <text class="welcome-title">Hello, {{ userName }}</text>
      <text class="welcome-subtitle">{{ freeToGrabText }}</text>
    </view>

    <view class="stats-section">
      <Card class="stat-card" :hover="false">
        <view class="stat-content">
          <text class="stat-value">{{ stats.completed }}</text>
          <text class="stat-label">Jobs Completed</text>
        </view>
        <view class="stat-icon bg-indigo">
          <text class="icon">✓</text>
        </view>
      </Card>
    </view>

    <view class="active-job-section" v-if="currentJob">
      <view class="section-header">
        <text class="section-title">
          <text class="title-icon">⚡</text>
          {{ currentJobText }}
        </text>
      </view>

      <Card class="active-job-card" :hover="true" @click="handleJobClick">
        <view class="status-stripe" :class="statusColorClass"></view>
        <view class="job-content">
          <view class="job-header">
            <StatusBadge :status="currentJob.status" />
            <text class="job-id">{{ currentJob.id }}</text>
          </view>
          <text class="job-title">{{ currentJob.title }}</text>
          <view class="job-location">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ currentJob.location || currentJob.site }}</text>
          </view>
          <Button class="continue-btn">
            {{ continueJobText }}
          </Button>
        </view>
      </Card>
    </view>

    <view class="active-job-section" v-else>
      <view class="section-header">
        <text class="section-title">
          <text class="title-icon">⚡</text>
          {{ currentJobText }}
        </text>
      </view>
      <Card class="no-job-card">
        <view class="no-job-icon">
          <text class="icon">✓</text>
        </view>
        <text class="no-job-title">{{ noActiveJobsText }}</text>
        <text class="no-job-subtitle">{{ freeToGrabText }}</text>
      </Card>
    </view>

    <view class="opportunities-section">
      <view class="section-header">
        <text class="section-title">
          <text class="title-icon">📍</text>
          {{ nearbyOpportunitiesText }}
        </text>
        <view class="view-all-btn" @click="viewAllTickets">
          <text class="view-all-text">{{ viewAllText }}</text>
        </view>
      </view>

      <view class="opportunities-list" v-if="openTickets.length > 0">
        <Card
          v-for="ticket in openTickets.slice(0, 3)"
          :key="ticket.id"
          class="opportunity-card"
          :hover="true"
          @click="handleTicketClick(ticket)"
        >
          <view class="opportunity-header">
            <PriorityBadge :priority="ticket.priority" />
            <TypeBadge :type="ticket.type" />
            <text class="distance">{{ formatDate(ticket.createdAt) }}</text>
          </view>
          <text class="opportunity-title">{{ ticket.title }}</text>
          <text class="opportunity-location">{{ ticket.location || ticket.site }}</text>
          <view class="opportunity-footer">
            <text class="est-time">
              <text class="est-icon">⏱</text>
              Est. 2h
            </text>
          </view>
        </Card>
      </view>

      <Empty v-else icon="📋" text="No open tickets available" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getUser, getCachedTickets, setCachedTickets, isAuthenticated } from '@/store';
import { api } from '@/utils/api';
import type { Ticket } from '@/types/ticket';
import { Card, Button, Empty } from '@/components/ui';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/tickets';

const emit = defineEmits<{
  (e: 'ticketClick', ticket: Ticket): void;
  (e: 'viewAll'): void;
}>();

const tickets = ref<Ticket[]>(getCachedTickets());
const stats = ref({ total: 0, open: 0, inProgress: 0, completed: 0 });
const user = ref(getUser());

const currentJob = computed(() => {
  const ongoing = tickets.value.filter(t => 
    ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'DEPARTED', 'ARRIVED', 'REVIEW'].includes(t.status)
  );
  return ongoing.length > 0 ? ongoing[0] : null;
});

const openTickets = computed(() =>
  tickets.value.filter(t => t.status === 'OPEN').slice(0, 10)
);

const userName = computed(() => user.value?.name || 'Mike');

const statusColorClass = computed(() => {
  if (!currentJob.value) return '';
  const status = currentJob.value.status;
  if (status === 'REVIEW') return 'bg-purple';
  if (status === 'ON_HOLD') return 'bg-yellow';
  return 'bg-indigo';
});

async function loadData() {
  try {
    const [ticketsResult, statsResult] = await Promise.all([
      api.getTickets({ page: 0, size: 20 }),
      api.getTicketStats()
    ]);
    tickets.value = ticketsResult.records;
    setCachedTickets(ticketsResult.records);
    stats.value = statsResult;
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

function handleJobClick() {
  if (currentJob.value) {
    emit('ticketClick', currentJob.value);
  }
}

function handleTicketClick(ticket: Ticket) {
  emit('ticketClick', ticket);
}

function viewAllTickets() {
  emit('viewAll');
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

const freeToGrabText = 'You are free to grab a new order.';
const currentJobText = 'Current Job';
const continueJobText = 'Continue Job';
const noActiveJobsText = 'No Active Jobs';
const nearbyOpportunitiesText = 'Nearby Opportunities';
const viewAllText = 'View All';

onMounted(() => {
  if (!isAuthenticated()) {
    uni.reLaunch({ url: '/pages/login/index' });
    return;
  }
  user.value = getUser();
  loadData();
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.dashboard {
  padding: $spacing-4;
  padding-bottom: 80px;
  
  @media (min-width: 768px) {
    padding: $spacing-6;
    padding-bottom: $spacing-6;
  }
}

.welcome-section {
  margin-bottom: $spacing-6;
}

.welcome-title {
  font-size: $text-2xl;
  font-weight: $font-weight-bold;
  color: $gray-900;  // slate-900 - matches iGreenApp
  display: block;
}

.welcome-subtitle {
  font-size: $text-sm;
  color: $gray-500;  // slate-500 - matches iGreenApp
  display: block;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-4;
  }
}

.stat-card {
  padding: $spacing-4;
  border: 1px solid $gray-200;  // slate-200
  box-shadow: $shadow-sm;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: $text-2xl;
  font-weight: $font-weight-bold;
  color: $foreground;
  display: block;
}

.stat-label {
  font-size: $text-xs;
  color: $muted-foreground;
  display: block;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-indigo {
    background: $indigo-50;  // indigo-50 - matches iGreenApp
  }

  .icon {
    font-size: 20px;
    color: $indigo-600;  // indigo-600 - matches iGreenApp
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-3;
}

.section-title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  color: $foreground;
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.title-icon {
  font-size: 16px;
  color: $primary;  // green-600 for icons - matches iGreenApp
}

.view-all-btn {
  cursor: pointer;
  
  &:active {
    opacity: 0.7;
  }
}

.view-all-text {
  font-size: $text-xs;
  color: $muted-foreground;
}

.active-job-section {
  margin-bottom: $spacing-6;
}

.active-job-card {
  padding: 0;
  box-shadow: $shadow-lg;
  border: 1px solid $indigo-100;  // indigo-100 - matches iGreenApp
  overflow: hidden;
  position: relative;
  background: $white;
  
  &:active {
    transform: scale(0.98);
  }
}

.status-stripe {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;

  &.bg-indigo {
    background: $indigo-500;  // indigo-500 - matches iGreenApp
  }

  &.bg-purple {
    background: $purple-500;
  }

  &.bg-yellow {
    background: $warning-color;
  }
}

.job-content {
  padding: $spacing-4;
  padding-left: $spacing-5;
}

.job-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-2;
}

.job-id {
  font-size: 12px;
  font-family: monospace;
  color: $gray-400;  // slate-400 - matches iGreenApp
}

.job-title {
  font-size: $text-lg;
  font-weight: $font-weight-bold;
  color: $gray-900;  // slate-900 - matches iGreenApp
  display: block;
  margin-bottom: $spacing-1;
}

.job-location {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  margin-bottom: $spacing-3;
}

.location-icon {
  font-size: 14px;
}

.location-text {
  font-size: $text-sm;
  color: $gray-600;  // slate-600 - matches iGreenApp
}

.continue-btn {
  width: 100%;
  background: $indigo-600;  // indigo-600 - matches iGreenApp
  color: $white;
  height: 40px;
  border-radius: $radius-md;
  
  &:hover {
    background: $indigo-700;  // indigo-700
  }
  
  &:active {
    background: $indigo-700;
  }
}

.no-job-card {
  text-align: center;
  border: 1px dashed $gray-200;  // slate-200
  background: $gray-50;  // slate-50 - matches iGreenApp
  padding: $spacing-6;
}

.no-job-icon {
  width: 48px;
  height: 48px;
  background: $gray-100;  // slate-100 - matches iGreenApp
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $spacing-3;

  .icon {
    font-size: 24px;
    color: $gray-400;  // slate-400 - matches iGreenApp
  }
}

.no-job-title {
  font-size: $text-base;
  font-weight: $font-weight-medium;
  color: $gray-900;  // slate-900 - matches iGreenApp
  display: block;
  margin-bottom: $spacing-1;
}

.no-job-subtitle {
  font-size: $text-sm;
  color: $gray-500;  // slate-500 - matches iGreenApp
  display: block;
}

.opportunities-section {
  margin-bottom: $spacing-6;
}

.opportunities-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.opportunity-card {
  padding: $spacing-4;
  background: $white;
  border: 1px solid $gray-200;
  box-shadow: $shadow-sm;
  
  &:active {
    background: $gray-50;  // slate-50 - matches iGreenApp
  }
}

.opportunity-header {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-bottom: $spacing-2;
}

.distance {
  font-size: 12px;
  color: $gray-400;  // slate-400
  margin-left: auto;
}

.opportunity-title {
  font-size: $text-sm;
  font-weight: $font-weight-semibold;
  color: $gray-900;  // slate-900
  display: block;
  margin-bottom: $spacing-1;
}

.opportunity-location {
  font-size: $text-xs;
  color: $gray-500;  // slate-500
  display: block;
  margin-bottom: $spacing-3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.opportunity-footer {
  border-top: 1px solid $border;
  padding-top: $spacing-3;
  margin-top: $spacing-2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.est-time {
  font-size: $text-xs;
  font-weight: $font-weight-medium;
  color: $gray-600;  // slate-600
  display: flex;
  align-items: center;
  gap: $spacing-1;
}

.est-icon {
  font-size: 12px;
}
</style>
