<template>
  <view class="dashboard">
    <view class="welcome-section">
      <text class="welcome-title">Hello, Mike</text>
      <text class="welcome-subtitle">{{ freeToGrabText }}</text>
    </view>

    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-content">
          <text class="stat-value">{{ completedToday }}</text>
          <text class="stat-label">{{ jobsCompletedText }}</text>
        </view>
        <view class="stat-icon bg-indigo">
          <text class="icon">✓</text>
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
              <text class="status-text">{{ currentJob.status }}</text>
            </view>
            <text class="job-id">{{ currentJob.id }}</text>
          </view>
          <text class="job-title">{{ currentJob.title }}</text>
          <view class="job-location">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ currentJob.location }}</text>
          </view>
          <view class="continue-btn">
            <text class="btn-text">{{ continueJobText }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="active-job-section" v-else>
      <view class="no-job-card">
        <view class="no-job-icon">
          <text class="icon">⚡</text>
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

      <view class="opportunities-list">
        <view
          v-for="ticket in nearbyTickets"
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
            <text class="distance">2.5km</text>
          </view>
          <text class="opportunity-title">{{ ticket.title }}</text>
          <text class="opportunity-location">{{ ticket.location }}</text>
          <view class="opportunity-footer">
            <text class="est-time">
              <text class="est-icon">⏱</text>
              {{ estTimeText }} 2h
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTicketStore } from '@/store/modules/tickets';
import type { Ticket, TicketPriority, TicketType } from '@/types/ticket';
import { getTicketTypeLabel } from '@/utils/helpers';

const emit = defineEmits<{
  (e: 'ticketClick', ticket: Ticket): void;
  (e: 'viewAll'): void;
}>();

const ticketStore = useTicketStore();

const tickets = computed(() => ticketStore.tickets);
const currentJob = computed(() => ticketStore.currentJob);
const nearbyTickets = computed(() => 
  tickets.value.filter(t => t.status === 'open').slice(0, 3)
);
const completedToday = computed(() => 
  tickets.value.filter(t => t.status === 'completed').length
);

const statusColorClass = computed(() => {
  if (!currentJob.value) return '';
  const status = currentJob.value.status;
  if (status === 'review') return 'bg-purple';
  return 'bg-indigo';
});

const statusBadgeClass = computed(() => {
  if (!currentJob.value) return '';
  const status = currentJob.value.status;
  return `badge-${status}`;
});

function getPriorityClass(priority: TicketPriority): string {
  return `priority-${priority}`;
}

function getTypeClass(type: TicketType): string {
  return `type-${type}`;
}

function getTypeLabel(type: TicketType): string {
  return getTicketTypeLabel(type);
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

const freeToGrabText = 'You are free to grab a new order.';
const jobsCompletedText = 'Jobs Completed';
const currentJobText = 'Current Job';
const continueJobText = 'Continue Job';
const noActiveJobsText = 'No Active Jobs';
const nearbyOpportunitiesText = 'Nearby Opportunities';
const viewAllText = 'View All';
const estTimeText = 'Est.';
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
  margin-bottom: $spacing-6;
}

.stat-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-lg;
  padding: $spacing-6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $gray-900;
  display: block;
}

.stat-label {
  font-size: $text-xs;
  color: $gray-500;
  display: block;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;

  &.bg-indigo {
    background: rgba($indigo-500, 0.1);
  }

  .icon {
    font-size: 24px;
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
  active: scale(0.98);
  transition: transform 0.15s ease;
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

  &.priority-critical {
    background: rgba($error-color, 0.1);
    color: $error-color;
  }

  &.priority-high {
    background: rgba($warning-color, 0.1);
    color: $warning-color;
  }

  &.priority-medium {
    background: rgba($gray-500, 0.1);
    color: $gray-600;
  }

  &.priority-low {
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
</style>
