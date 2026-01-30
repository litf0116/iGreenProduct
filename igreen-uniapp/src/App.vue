<template>
  <view class="app-container">
    <LoginPage v-if="!isAuth" @login="onLoginSuccess" />

    <template v-else>
      <view class="desktop-layout">
        <Sidebar :currentView="currentView" @update:currentView="currentView = $event" />

        <view class="main-container">
          <Header />

          <view class="content-area">
            <DashboardPage v-if="currentView === 'dashboard'" :tickets="tickets" @ticketClick="onTicketClick" @viewAll="currentView = 'queue'" />

            <TicketListPage v-else-if="currentView === 'queue'" title="Ticket Queue" :tickets="queueTickets" @ticketClick="onTicketClick" @refresh="onRefresh" @loadMore="onLoadMore" />

            <TicketListPage v-else-if="currentView === 'my-work'" title="My Workspace" :tickets="myWorkTickets" @ticketClick="onTicketClick" @refresh="onRefresh" @loadMore="onLoadMore" />

            <TicketListPage v-else-if="currentView === 'history'" title="History" :tickets="historyTickets" @ticketClick="onTicketClick" @refresh="onRefresh" @loadMore="onLoadMore" />

            <ProfilePage v-else-if="currentView === 'profile'" @logout="onLogout" />
          </view>
        </view>
      </view>

      <view class="mobile-layout">
        <view class="mobile-content">
          <DashboardPage v-if="currentView === 'dashboard'" :tickets="tickets" @ticketClick="onTicketClick" @viewAll="currentView = 'queue'" />

          <TicketListPage v-else-if="currentView === 'queue'" title="Ticket Queue" :tickets="queueTickets" @ticketClick="onTicketClick" @refresh="onRefresh" @loadMore="onLoadMore" />

          <TicketListPage v-else-if="currentView === 'my-work'" title="My Workspace" :tickets="myWorkTickets" @ticketClick="onTicketClick" @refresh="onRefresh" @loadMore="onLoadMore" />

          <ProfilePage v-else-if="currentView === 'profile'" @logout="onLogout" />
        </view>

        <TabBar :currentView="currentView" @update:currentView="currentView = $event" />
      </view>

      <TicketDetailPage v-if="currentTicketData" :id="currentTicketData.id" @close="onCloseDetail" />
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { isAuthenticated, getUser, setUser, setAuthToken, clearAuth, getCachedTickets, setCachedTickets, getCurrentTicket, setCurrentTicket } from '@/store';
import { api } from '@/utils/api';
import type { Ticket } from '@/types/ticket';
import LoginPage from '@/pages/login/index.vue';
import DashboardPage from '@/pages/dashboard/index.vue';
import TicketListPage from '@/pages/tickets/index.vue';
import TicketDetailPage from '@/pages/tickets/detail/index.vue';
import ProfilePage from '@/pages/profile/index.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import TabBar from '@/components/layout/TabBar.vue';
import Header from '@/components/layout/Header.vue';

const user = ref<any>(getUser());
const isAuth = computed(() => isAuthenticated());
const tickets = ref<Ticket[]>(getCachedTickets());
const currentTicketData = ref<Ticket | null>(getCurrentTicket());
const currentView = ref('dashboard');

const queueTickets = computed(() =>
  tickets.value.filter((t: Ticket) => t.status === 'OPEN')
);

const myWorkTickets = computed(() =>
  tickets.value.filter((t: Ticket) => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'DEPARTED', 'ARRIVED', 'REVIEW'].includes(t.status))
);

const historyTickets = computed(() =>
  tickets.value.filter((t: Ticket) => t.status === 'COMPLETED')
);

onMounted(() => {
  if (isAuth.value) {
    loadTickets(true);
  }
});

async function loadTickets(reset: boolean) {
  try {
    const result = await api.getTickets({ page: 0, size: 20 });
    tickets.value = result.records;
    setCachedTickets(result.records);
  } catch (error) {
    console.error('Failed to load tickets:', error);
  }
}

async function onLoginSuccess() {
  try {
    const userData = await api.getCurrentUser();
    user.value = userData;
    setUser(userData);
    const token = uni.getStorageSync('auth_token');
    if (token) {
      setAuthToken(token);
    }
    await loadTickets(true);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

function onLogout() {
  clearAuth();
  user.value = null;
  tickets.value = [];
  uni.reLaunch({ url: '/pages/login/index' });
}

function onTicketClick(ticket: Ticket) {
  currentTicketData.value = ticket;
  setCurrentTicket(ticket);
}

function onCloseDetail() {
  currentTicketData.value = null;
  setCurrentTicket(null);
}

function onRefresh() {
  loadTickets(true);
}

function onLoadMore() {
  // TODO: Implement pagination
}
</script>

<style lang="scss">
@import '@/uni.scss';

* {
  box-sizing: border-box;
}

page {
  background-color: $background;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: $text-base;
  line-height: 1.5;
  color: $foreground;
}

.app-container {
  min-height: 100vh;
}

.desktop-layout {
  display: none;

  @media (min-width: 768px) {
    display: flex;
    height: 100vh;
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background: $background;
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;

  @media (min-width: 768px) {
    display: none;
  }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 64px;
}
</style>
