<template>
  <view class="app-container">
    <LoginPage v-if="!userStore.isAuthenticated" @login="handleLogin" />

    <view class="desktop-layout" v-else-if="userStore.isAuthenticated">
      <Sidebar :currentView="currentView" @update:currentView="currentView = $event" />

      <view class="main-container">
        <Header />

        <view class="content-area">
          <DashboardPage v-if="currentView === 'dashboard'" :tickets="ticketStore.tickets" @ticketClick="handleTicketClick" @viewAll="currentView = 'queue'" />

          <TicketListPage v-else-if="currentView === 'queue'" title="Ticket Queue" :tickets="queueTickets" @ticketClick="handleTicketClick" @refresh="handleRefresh" @loadMore="handleLoadMore" />

          <TicketListPage v-else-if="currentView === 'my-work'" title="My Workspace" :tickets="myWorkTickets" @ticketClick="handleTicketClick" @refresh="handleRefresh" @loadMore="handleLoadMore" />

          <TicketListPage v-else-if="currentView === 'history'" title="History" :tickets="historyTickets" @ticketClick="handleTicketClick" @refresh="handleRefresh" @loadMore="handleLoadMore" />

          <ProfilePage v-else-if="currentView === 'profile'" @logout="handleLogout" />
        </view>
      </view>

      <view class="mobile-layout" v-else-if="userStore.isAuthenticated">
        <view class="mobile-content">
          <DashboardPage v-if="currentView === 'dashboard'" :tickets="ticketStore.tickets" @ticketClick="handleTicketClick" @viewAll="currentView = 'queue'" />

          <TicketListPage v-else-if="currentView === 'queue'" title="Ticket Queue" :tickets="queueTickets" @ticketClick="handleTicketClick" @refresh="handleRefresh" @loadMore="handleLoadMore" />

          <TicketListPage v-else-if="currentView === 'my-work'" title="My Workspace" :tickets="myWorkTickets" @ticketClick="handleTicketClick" @refresh="handleRefresh" @loadMore="handleLoadMore" />

          <ProfilePage v-else-if="currentView === 'profile'" @logout="handleLogout" />
        </view>

        <TabBar :currentView="currentView" @update:currentView="currentView = $event" />
      </view>

      <TicketDetailPage v-if="ticketStore.currentTicket" :ticket="ticketStore.currentTicket" @close="handleCloseDetail" @update="handleUpdateTicket" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { useTicketStore } from '@/store/modules/tickets';

const userStore = useUserStore();
const ticketStore = useTicketStore();

const currentView = ref('dashboard');

const queueTickets = computed(() =>
  ticketStore.tickets.filter((t: any) => t.status === 'open')
);

const myWorkTickets = computed(() =>
  ticketStore.tickets.filter((t: any) => ['assigned', 'departed', 'arrived', 'review'].includes(t.status))
);

const historyTickets = computed(() =>
  ticketStore.tickets.filter((t: any) => t.status === 'completed')
);

onMounted(() => {
  userStore.initFromStorage();
  if (userStore.isAuthenticated) {
    ticketStore.loadTickets(true);
  }
});

function handleLogin() {
  ticketStore.loadTickets(true);
}

function handleLogout() {
  userStore.logout();
}

function handleTicketClick(ticket: any) {
  ticketStore.setCurrentTicket(ticket);
}

function handleCloseDetail() {
  ticketStore.setCurrentTicket(null);
}

function handleUpdateTicket(id: string, updates: any) {
  ticketStore.updateTicket(id, updates);
}

function handleRefresh() {
  ticketStore.loadTickets(true);
}

function handleLoadMore() {
  ticketStore.loadTickets(false);
}

const Sidebar = defineAsyncComponent(() => import('@/components/layout/Sidebar.vue'));
const TabBar = defineAsyncComponent(() => import('@/components/layout/TabBar.vue'));
const Header = defineAsyncComponent(() => import('@/components/layout/Header.vue'));
const DashboardPage = defineAsyncComponent(() => import('@/pages/dashboard/index.vue'));
const TicketListPage = defineAsyncComponent(() => import('@/pages/tickets/index.vue'));
const TicketDetailPage = defineAsyncComponent(() => import('@/pages/tickets/detail/index.vue'));
const ProfilePage = defineAsyncComponent(() => import('@/pages/profile/index.vue'));
const LoginPage = defineAsyncComponent(() => import('@/pages/login/index.vue'));
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

page {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #0f172a;
}

.app-container {
  min-height: 100vh;
}

.desktop-layout {
  display: none;
}

@media (min-width: 768px) {
  .desktop-layout {
    display: flex;
    height: 100vh;
  }
}

.sidebar-container {
  flex-shrink: 0;
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
  background: #f8fafc;
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

@media (min-width: 768px) {
  .mobile-layout {
    display: none;
  }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 64px;
}

.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
