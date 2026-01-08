<template>
  <view class="container">
    <view class="header">
      <view>
        <text class="greeting">Welcome Back</text>
        <text class="subtitle">Ticket Overview</text>
      </view>
      <button class="btn-create" size="mini" @click="goToCreate">+ Create</button>
    </view>

    <!-- Stats Grid -->
    <view class="stats-grid">
      <view class="stat-card blue-border">
        <text class="stat-label">Total</text>
        <text class="stat-value text-blue">{{ stats.total }}</text>
      </view>
      <view class="stat-card orange-border">
        <text class="stat-label">In Progress</text>
        <text class="stat-value text-orange">{{ stats.inProgress }}</text>
      </view>
      <view class="stat-card green-border">
        <text class="stat-label">Closed</text>
        <text class="stat-value text-green">{{ stats.completed }}</text>
      </view>
    </view>

    <!-- Tabs -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'corrective' }"
        @click="activeTab = 'corrective'"
      >
        <text>Corrective</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'preventive' }"
        @click="activeTab = 'preventive'"
      >
        <text>Preventive</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'problem' }"
        @click="activeTab = 'problem'"
      >
        <text>Problem</text>
      </view>
    </view>

    <!-- Ticket List -->
    <scroll-view scroll-y class="ticket-list">
      <view 
        v-for="ticket in filteredTickets" 
        :key="ticket.id" 
        class="ticket-card"
      >
        <view class="ticket-header">
          <text class="ticket-id">{{ ticket.id }}</text>
          <text class="ticket-status" :class="getStatusClass(ticket.status)">{{ ticket.status }}</text>
        </view>
        <text class="ticket-title">{{ ticket.title }}</text>
        <text class="ticket-site">{{ ticket.site }}</text>
        <view class="ticket-footer">
          <text class="ticket-priority" :class="getPriorityClass(ticket.priority)">{{ ticket.priority }}</text>
          <text class="ticket-date">{{ ticket.dueDate }}</text>
        </view>
      </view>
      
      <view v-if="filteredTickets.length === 0" class="empty-state">
        <text>No tickets found</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { mockTickets } from '@/common/mockData.js';

const activeTab = ref('corrective');
const tickets = ref(mockTickets);

const filteredTickets = computed(() => {
  return tickets.value.filter(t => t.type === activeTab.value);
});

const stats = computed(() => {
  return {
    total: tickets.value.length,
    inProgress: tickets.value.filter(t => t.status === 'inProgress' || t.status === 'accepted').length,
    completed: tickets.value.filter(t => t.status === 'closed').length
  };
});

const getStatusClass = (status) => {
  const map = {
    open: 'status-blue',
    accepted: 'status-cyan',
    inProgress: 'status-orange',
    closed: 'status-green'
  };
  return map[status] || 'status-gray';
};

const getPriorityClass = (priority) => {
  return priority === 'P1' || priority === 'P2' ? 'priority-high' : 'priority-normal';
};

const goToCreate = () => {
  uni.navigateTo({
    url: '/pages/ticket/create'
  });
};
</script>

<style>
.container {
  padding: 30rpx;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.greeting {
  font-size: 36rpx;
  font-weight: bold;
  color: #0ea5e9;
}

.subtitle {
  font-size: 24rpx;
  color: #64748b;
}

.btn-create {
  background-color: #0ea5e9;
  color: white;
  font-size: 24rpx;
  margin: 0;
}

.stats-grid {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.stat-card {
  flex: 1;
  background-color: white;
  padding: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.05);
  border-left: 8rpx solid #ccc;
}

.blue-border { border-left-color: #0ea5e9; }
.orange-border { border-left-color: #f97316; }
.green-border { border-left-color: #22c55e; }

.stat-label {
  font-size: 24rpx;
  color: #64748b;
  display: block;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
}

.text-blue { color: #0ea5e9; }
.text-orange { color: #f97316; }
.text-green { color: #22c55e; }

.tabs {
  display: flex;
  background-color: #e2e8f0;
  padding: 8rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #64748b;
}

.tab-item.active {
  background-color: white;
  color: #0f172a;
  font-weight: 500;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.ticket-list {
  height: calc(100vh - 400rpx);
}

.ticket-card {
  background-color: white;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.05);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.ticket-id {
  font-weight: bold;
  font-size: 28rpx;
}

.ticket-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  background-color: #f1f5f9;
}

.status-blue { background-color: #e0f2fe; color: #0369a1; }
.status-cyan { background-color: #cffafe; color: #155e75; }
.status-orange { background-color: #ffedd5; color: #c2410c; }
.status-green { background-color: #dcfce7; color: #15803d; }

.ticket-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #334155;
  display: block;
  margin-bottom: 6rpx;
}

.ticket-site {
  font-size: 24rpx;
  color: #64748b;
  display: block;
  margin-bottom: 20rpx;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2rpx solid #f1f5f9;
  padding-top: 20rpx;
}

.ticket-priority {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.priority-high { background-color: #fee2e2; color: #991b1b; }
.priority-normal { background-color: #f1f5f9; color: #475569; }

.ticket-date {
  font-size: 24rpx;
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  color: #94a3b8;
}
</style>
