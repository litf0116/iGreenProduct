<template>
  <view class="dashboard">
    <view class="welcome-section">
      <text class="welcome-title">Hello, {{ userName }}</text>
      <text class="welcome-subtitle">{{ freeToGrabText }}</text>
    </view>

    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-content">
          <text class="stat-value">{{ stats.completed }}</text>
          <text class="stat-label">Jobs Completed</text>
        </view>
        <view class="stat-icon bg-green">
          <text class="icon">✓</text>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-content">
          <text class="stat-value">{{ stats.open }}</text>
          <text class="stat-label">Open Tickets</text>
        </view>
        <view class="stat-icon bg-blue">
          <text class="icon">⚡</text>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-content">
          <text class="stat-value">{{ stats.inProgress }}</text>
          <text class="stat-label">In Progress</text>
        </view>
        <view class="stat-icon bg-indigo">
          <text class="icon">🔧</text>
        </view>
      </view>
    </view>

    <view class="active-job-section" v-if="currentJob">
      <view class="section-header">
        <text class="section-title">
          <text class="title-icon">⚡</text>
          {{ currentJobText }}
        </text>
      </view>

      <view class="active-job-card" @click="handleJobClick">
        <view class="status-stripe" :class="statusColorClass"></view>
        <view class="job-content">
          <view class="job-header">
            <view class="status-badge" :class="statusBadgeClass">
              <text class="status-text">{{ getStatusLabel(currentJob.status) }}</text>
            </view>
            <text class="job-id">{{ currentJob.id }}</text>
          </view>
          <text class="job-title">{{ currentJob.title }}</text>
          <view class="job-location">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ currentJob.location || currentJob.site }}</text>
          </view>
          <view class="continue-btn">
            <text class="btn-text">{{ continueJobText }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="active-job-section" v-else>
      <view class="section-header">
        <text class="section-title">
          <text class="title-icon">⚡</text>
          {{ currentJobText }}
        </text>
      </view>
      <view class="no-job-card">
        <view class="no-job-icon">
          <text class="icon">✓</text>
        </view>
        <text class="no-job-title">{{ noActiveJobsText }}</text>
        <text class="no-job-subtitle">{{ freeToGrabText }}</text>
      </view>
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
        <view
          v-for="ticket in openTickets.slice(0, 3)"
          :key="ticket.id"
          class="opportunity-card"
          @click="handleTicketClick(ticket)"
        >
          <view class="opportunity-header">
            <view class="priority-badge" :class="getPriorityClass(ticket.priority)">
              <text class="priority-text">{{ ticket.priority }}</text>
            </view>
            <view class="type-badge" :class="getTypeClass(ticket.type)">
              <text class="type-text">{{ getTypeLabel(ticket.type) }}</text>
            </view>
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
        </view>
      </view>

      <view class="empty-state" v-else>
        <text class="empty-text">No open tickets available</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTicketStore } from '@/store/modules/tickets';
import { useUserStore } from '@/store/modules/user';
import type { Ticket, TicketPriority, TicketType } from '@/types/ticket';
import { getStatusLabel, getTypeLabel, getPriorityClass, getTypeClass } from '@/utils/helpers';

const emit = defineEmits<{
  (e: 'ticketClick', ticket: Ticket): void;
  (e: 'viewAll'): void;
}>();

const ticketStore = useTicketStore();
const userStore = useUserStore();

const tickets = computed(() => ticketStore.tickets);
const currentJob = computed(() => ticketStore.currentJob);
const stats = computed(() => ticketStore.stats);
const openTickets = computed(() =>
  tickets.value.filter(t => t.status === 'OPEN').slice(0, 10)
);

const userName = computed(() => userStore.user?.name || 'Engineer');

const statusColorClass = computed(() => {
  if (!currentJob.value) return '';
  const status = currentJob.value.status;
  if (status === 'REVIEW') return 'bg-purple';
  if (status === 'ON_HOLD') return 'bg-yellow';
  return 'bg-indigo';
});

const statusBadgeClass = computed(() => {
  if (!currentJob.value) return '';
  const status = currentJob.value.status.toLowerCase();
  return `badge-${status}`;
});

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
const estTimeText = 'Est.';

onMounted(async () => {
  userStore.initFromStorage();
  if (!userStore.isAuthenticated) {
    uni.reLaunch({ url: '/pages/login/index' });
    return;
  }
  await ticketStore.loadTickets({ reset: true });
  await ticketStore.loadStats();
});
</script>

<script lang="ts">
export default {
  options: {
    styleIsolation: 'shared',
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.dashboard {
  padding: $spacing-4;
  padding-bottom: 80px;
}

.welcome-section {
  margin-bottom: $spacing-6;
}

.welcome-title {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $gray-900;
  display: block;
}

.welcome-subtitle {
  font-size: $text-sm;
  color: $gray-500;
  display: block;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-3;
  margin-bottom: $spacing-6;
}

.stat-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-lg;
  padding: $spacing-4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $gray-900;
  display: block;
}

.stat-label {
  font-size: 10px;
  color: $gray-500;
  display: block;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-green {
    background: rgba($green-500, 0.1);
  }

  &.bg-blue {
    background: rgba($blue-500, 0.1);
  }

  &.bg-indigo {
    background: rgba($indigo-500, 0.1);
  }

  .icon {
    font-size: 16px;
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
  font-weight: $font-semibold;
  color: $gray-900;
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.title-icon {
  font-size: 16px;
}

.view-all-btn {
  cursor: pointer;
}

.view-all-text {
  font-size: $text-xs;
  color: $gray-500;
}

.active-job-section {
  margin-bottom: $spacing-6;
}

.active-job-card {
  background: $white;
  border: 1px solid rgba($indigo-100, 0.5);
  border-radius: $radius-xl;
  padding: $spacing-4;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease;

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
    background: $indigo-500;
  }

  &.bg-purple {
    background: $purple-500;
  }

  &.bg-yellow {
    background: $yellow-500;
  }
}

.job-content {
  padding-left: $spacing-3;
}

.job-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-2;
}

.status-badge {
  padding: $spacing-1 $spacing-2;
  border-radius: $radius-full;
  background: rgba($indigo-500, 0.1);

  &.badge-review {
    background: rgba($purple-500, 0.1);
  }

  &.badge-on_hold {
    background: rgba($yellow-500, 0.1);
  }
}

.status-text {
  font-size: 12px;
  font-weight: $font-medium;
  color: $indigo-700;
  text-transform: capitalize;
}

.job-id {
  font-size: 12px;
  font-family: monospace;
  color: $gray-400;
}

.job-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $gray-900;
  display: block;
  margin-bottom: $spacing-2;
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
  color: $gray-600;
}

.continue-btn {
  width: 100%;
  height: 40px;
  background: $indigo-600;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: $indigo-700;
  }
}

.btn-text {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $white;
}

.no-job-card {
  background: $gray-50;
  border: 1px dashed $gray-200;
  border-radius: $radius-xl;
  padding: $spacing-6;
  text-align: center;
}

.no-job-icon {
  width: 48px;
  height: 48px;
  background: $gray-100;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $spacing-3;

  .icon {
    font-size: 24px;
    color: $gray-400;
  }
}

.no-job-title {
  font-size: $text-base;
  font-weight: $font-medium;
  color: $gray-900;
  display: block;
  margin-bottom: $spacing-1;
}

.no-job-subtitle {
  font-size: $text-sm;
  color: $gray-500;
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
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-xl;
  padding: $spacing-4;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: $gray-50;
  }
}

.opportunity-header {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-bottom: $spacing-2;
}

.priority-badge {
  padding: 2px $spacing-1;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-medium;
  text-transform: capitalize;

  &.priority-p1 {
    background: rgba($error-color, 0.1);
    color: $error-color;
  }

  &.priority-p2 {
    background: rgba($warning-color, 0.1);
    color: $warning-color;
  }

  &.priority-p3 {
    background: rgba($gray-500, 0.1);
    color: $gray-600;
  }

  &.priority-p4 {
    background: rgba($gray-200, 0.5);
    color: $gray-500;
  }
}

.type-badge {
  padding: 2px $spacing-1;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: $font-medium;
  border: 1px solid;

  &.type-corrective {
    background: rgba($orange-500, 0.1);
    color: $orange-600;
    border-color: rgba($orange-200, 0.5);
  }

  &.type-planned {
    background: rgba($blue-500, 0.1);
    color: $blue-600;
    border-color: rgba($blue-200, 0.5);
  }

  &.type-preventive {
    background: rgba($green-500, 0.1);
    color: $green-600;
    border-color: rgba($green-200, 0.5);
  }

  &.type-problem {
    background: rgba($rose-500, 0.1);
    color: $rose-600;
    border-color: rgba($rose-200, 0.5);
  }
}

.distance {
  font-size: 12px;
  color: $gray-400;
  margin-left: auto;
}

.opportunity-title {
  font-size: $text-sm;
  font-weight: $font-semibold;
  color: $gray-900;
  display: block;
  margin-bottom: $spacing-1;
}

.opportunity-location {
  font-size: $text-xs;
  color: $gray-500;
  display: block;
  margin-bottom: $spacing-3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.opportunity-footer {
  border-top: 1px solid $gray-100;
  padding-top: $spacing-3;
  margin-top: $spacing-2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.est-time {
  font-size: $text-xs;
  font-weight: $font-medium;
  color: $gray-600;
  display: flex;
  align-items: center;
  gap: $spacing-1;
}

.est-icon {
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: $spacing-6;
}

.empty-text {
  font-size: $text-sm;
  color: $gray-500;
}
</style>
