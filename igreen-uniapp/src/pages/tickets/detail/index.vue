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
              <text class="priority-text">{{ ticket.priority }}</text>
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
            <text class="info-value">{{ ticket.requester }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">Reported At</text>
            <text class="info-value">{{ formatDateTime(ticket.createdAt) }}</text>
          </view>
        </view>

        <view class="description-card">
          <text class="card-title">Issue Description</text>
          <text class="description-text">{{ ticket.title }}</text>
          <text class="description-detail">{{ ticket.description }}</text>
        </view>

        <view class="action-card" v-if="ticket.status === 'open'">
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

        <view class="action-card" v-else-if="ticket.status === 'assigned'">
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
            <text class="btn-text">Departure Now</text>
          </view>
        </view>

        <view class="action-card" v-else-if="ticket.status === 'departed'">
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

        <view class="action-card" v-else-if="ticket.status === 'arrived'">
          <view class="action-content">
            <view class="action-icon bg-green">
              <text class="icon">🔧</text>
            </view>
            <view class="action-text">
              <text class="action-title">On Site - Work in Progress</text>
              <text class="action-subtitle">Arrived at {{ formatTime(ticket.history?.arrivedAt) }}</text>
            </view>
          </view>
          <view class="finish-btn" @click="handleFinish">
            <text class="btn-text">Finish Work</text>
          </view>
        </view>

        <view class="action-card" v-else-if="ticket.status === 'review'">
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

        <view class="action-card" v-else-if="ticket.status === 'completed'">
          <view class="action-content">
            <view class="action-icon bg-green">
              <text class="icon">✔</text>
            </view>
            <view class="action-text">
              <text class="action-title">Work Order Completed</text>
              <text class="action-subtitle">Completed at {{ formatDateTime(ticket.history?.completedAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Ticket, TicketStatus, TicketPriority, TicketType } from '@/types/ticket';
import { getTicketTypeLabel, formatDateTime, formatTime } from '@/utils/helpers';

const props = defineProps<{
  ticket: Ticket | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', id: string, updates: Partial<Ticket>): void;
}>();

function getStatusClass(status: TicketStatus): string {
  switch (status) {
    case 'open': return 'bg-blue';
    case 'assigned': return 'bg-indigo';
    case 'departed': return 'bg-orange';
    case 'arrived': return 'bg-yellow';
    case 'review': return 'bg-purple';
    case 'completed': return 'bg-green';
    default: return 'bg-gray';
  }
}

function getStatusLabel(status: TicketStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getPriorityClass(priority: TicketPriority): string {
  return `priority-${priority}`;
}

function getTypeClass(type: TicketType): string {
  return `type-${type}`;
}

function getTypeLabel(type: TicketType): string {
  return getTicketTypeLabel(type);
}

function handleClose() {
  emit('close');
}

function handleAccept() {
  if (props.ticket) {
    emit('update', props.ticket.id, {
      status: 'assigned',
      assignee: 'Mike Technician',
    });
  }
}

function handleDepart() {
  if (props.ticket) {
    emit('update', props.ticket.id, {
      status: 'departed',
      history: {
        ...props.ticket.history,
        departedAt: new Date().toISOString(),
      },
    });
  }
}

function handleArrive() {
  if (props.ticket) {
    emit('update', props.ticket.id, {
      status: 'arrived',
      history: {
        ...props.ticket.history,
        arrivedAt: new Date().toISOString(),
      },
    });
  }
}

function handleFinish() {
  if (props.ticket) {
    emit('update', props.ticket.id, {
      status: 'review',
    });
  }
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
  &.priority-critical { background: rgba($error-color, 0.1); color: $error-color; }
  &.priority-high { background: rgba($warning-color, 0.1); color: $warning-color; }
  &.priority-medium { background: rgba($gray-500, 0.1); color: $gray-600; }
  &.priority-low { background: rgba($gray-200, 0.5); color: $gray-500; }
}

.type-badge {
  &.type-corrective { background: rgba($orange-500, 0.1); color: $orange-600; }
  &.type-planned { background: rgba($blue-500, 0.1); color: $blue-600; }
  &.type-preventive { background: rgba($green-500, 0.1); color: $green-600; }
  &.type-problem { background: rgba($rose-500, 0.1); color: $rose-600; }
}

.description-card {
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
</style>
