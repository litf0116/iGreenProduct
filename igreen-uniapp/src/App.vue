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

      <TicketDetailPage v-if="ticketStore.currentTicket" :id="ticketStore.currentTicket.id" @close="handleCloseDetail" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { useTicketStore } from '@/store/modules/tickets';
import LoginPage from '@/pages/login/index.vue';
import DashboardPage from '@/pages/dashboard/index.vue';
import TicketListPage from '@/pages/tickets/index.vue';
import TicketDetailPage from '@/pages/tickets/detail/index.vue';
import ProfilePage from '@/pages/profile/index.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import TabBar from '@/components/layout/TabBar.vue';
import Header from '@/components/layout/Header.vue';

const userStore = useUserStore();
const ticketStore = useTicketStore();

const currentView = ref('dashboard');

const queueTickets = computed(() =>
  ticketStore.tickets.filter((t: any) => t.status === 'OPEN')
);

const myWorkTickets = computed(() =>
  ticketStore.tickets.filter((t: any) => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'DEPARTED', 'ARRIVED', 'REVIEW'].includes(t.status))
);

const historyTickets = computed(() =>
  ticketStore.tickets.filter((t: any) => t.status === 'COMPLETED')
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
</script>

<style lang="scss">
@import '@/uni.scss';

* {
  box-sizing: border-box;
}

page {
  background-color: $gray-50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: $text-base;
  line-height: 1.5;
  color: $gray-900;
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
  background: $gray-50;
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
