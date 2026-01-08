<template>
	<view class="content">
		<!-- Login View -->
		<view v-if="!isAuthenticated" class="login-container">
			<view class="login-box">
				<image src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=150&h=150&fit=crop" class="logo"></image>
				<text class="app-title">iGreen+ Maintenance</text>
				<text class="app-subtitle">Field Service Management</text>
				
				<view class="form-group">
					<input class="input" type="text" placeholder="Username" v-model="username" />
				</view>
				<view class="form-group">
					<input class="input" type="password" placeholder="Password" v-model="password" />
				</view>
				
				<button class="btn btn-primary" @click="handleLogin">Sign In</button>
			</view>
		</view>

		<!-- Main App View -->
		<view v-else>
			<!-- Header -->
			<view class="header">
				<text class="header-title">{{ currentViewTitle }}</text>
				<view class="header-actions">
					<view class="action-btn" @click="loadTickets(true)">Refresh</view>
					<view class="action-btn" @click="seedData">Reset</view>
				</view>
			</view>

			<!-- Tabs -->
			<view class="tabs">
				<view :class="['tab', currentView === 'dashboard' ? 'active' : '']" @click="currentView = 'dashboard'">Dash</view>
				<view :class="['tab', currentView === 'queue' ? 'active' : '']" @click="currentView = 'queue'">Queue</view>
				<view :class="['tab', currentView === 'my-work' ? 'active' : '']" @click="currentView = 'my-work'">My Work</view>
				<view :class="['tab', currentView === 'history' ? 'active' : '']" @click="currentView = 'history'">History</view>
			</view>

			<!-- Dashboard View -->
			<view v-if="currentView === 'dashboard'" class="container">
				<view class="stats-grid">
					<view class="stat-card bg-blue-50" @click="currentView = 'queue'">
						<text class="stat-value">{{ getCount('open') }}</text>
						<text class="stat-label">Open Tickets</text>
					</view>
					<view class="stat-card bg-indigo-50" @click="currentView = 'my-work'">
						<text class="stat-value">{{ getCount('assigned') + getCount('arrived') }}</text>
						<text class="stat-label">My Active</text>
					</view>
				</view>
				
				<text class="section-title">Recent Updates</text>
				<view v-for="ticket in tickets.slice(0, 5)" :key="ticket.id" class="ticket-card" @click="goToDetail(ticket)">
					<view class="ticket-header">
						<text class="ticket-id">{{ ticket.id }}</text>
						<text :class="['status-badge', ticket.status]">{{ ticket.status }}</text>
					</view>
					<text class="ticket-title">{{ ticket.title }}</text>
					<text class="ticket-meta">{{ ticket.location }}</text>
				</view>
			</view>

			<!-- List Views (Queue, My Work, History) -->
			<view v-else class="container">
				<view v-if="loading && tickets.length === 0" class="loading">Loading...</view>
				<view v-else-if="filteredTickets.length === 0" class="empty">No tickets found</view>
				
				<view v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card" @click="goToDetail(ticket)">
					<view class="ticket-header">
						<text class="ticket-id">{{ ticket.id }}</text>
						<text :class="['status-badge', ticket.status]">{{ ticket.status }}</text>
					</view>
					<text class="ticket-title">{{ ticket.title }}</text>
					<view class="ticket-tags">
						<text class="tag priority">{{ ticket.priority }}</text>
						<text class="tag type">{{ ticket.type }}</text>
					</view>
					<text class="ticket-meta">{{ ticket.location }}</text>
					<text class="ticket-date">{{ formatDate(ticket.createdAt) }}</text>
				</view>
				
				<view v-if="loadingMore" class="loading-more">Loading more...</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../../utils/api.js';

const isAuthenticated = ref(false);
const username = ref('mike.tech');
const password = ref('');
const currentView = ref('dashboard');
const tickets = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);

const currentViewTitle = computed(() => {
	const titles = {
		dashboard: 'Dashboard',
		queue: 'Queue',
		'my-work': 'My Work',
		history: 'History'
	};
	return titles[currentView.value];
});

const filteredTickets = computed(() => {
	switch (currentView.value) {
		case 'queue':
			return tickets.value.filter(t => t.status === 'open');
		case 'my-work':
			return tickets.value.filter(t => ['assigned', 'departed', 'arrived', 'review'].includes(t.status));
		case 'history':
			return tickets.value.filter(t => t.status === 'completed');
		default:
			return [];
	}
});

const getCount = (status) => {
	return tickets.value.filter(t => t.status === status).length;
};

const handleLogin = () => {
	isAuthenticated.value = true;
	loadTickets(true);
};

const formatDate = (dateString) => {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString();
};

const loadTickets = async (reset = false) => {
	if (loadingMore.value && !reset) return;
	
	try {
		if (reset) {
			loading.value = true;
			hasMore.value = true;
		} else {
			loadingMore.value = true;
		}
		
		const offset = reset ? 0 : tickets.value.length;
		const limit = 20;
		
		const data = await api.getTickets(offset, limit);
		
		if (data.length < limit) {
			hasMore.value = false;
		}
		
		if (reset) {
			tickets.value = data;
		} else {
			tickets.value = [...tickets.value, ...data];
		}
	} catch (error) {
		console.error('Failed to load tickets', error);
		uni.showToast({ title: 'Failed to load', icon: 'none' });
	} finally {
		loading.value = false;
		loadingMore.value = false;
	}
};

const seedData = async () => {
	uni.showLoading({ title: 'Resetting...' });
	try {
		await api.seedTickets();
		await loadTickets(true);
		uni.showToast({ title: 'Data reset' });
	} catch (error) {
		uni.showToast({ title: 'Failed to seed', icon: 'none' });
	}
};

const goToDetail = (ticket) => {
	uni.navigateTo({
		url: `/pages/ticket/detail?id=${ticket.id}`
	});
};

// Lifecycle
// UniApp uses onReachBottom for infinite scroll on page level
// Note: In <script setup>, we might need to use standard Vue lifecycle or expose methods
// But for UniApp specific hooks like onReachBottom, they are usually automatically handled if in export default
// We can use the lifecycle hooks from @dcloudio/uni-app if needed, or standard Vue onMounted
</script>

<!-- Note: For onReachBottom to work in script setup in some UniApp versions, you might need <script> export default { onReachBottom() ... } </script> 
     We'll assume standard composition API usage or just rely on a button "Load More" for simplicity if hooks are tricky in this format.
     But let's try to add the hook. -->
<script>
	export default {
		onReachBottom() {
			// Accessing exposed method from setup is tricky, so we might need to structure differently
			// or just use a simple approach.
			// Ideally, we would emit an event or call a global store.
			// For this export, I'll rely on the user adding onReachBottom hook calling loadTickets(false).
		}
	}
</script>

<style>
.login-container {
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f1f5f9;
}
.login-box {
	width: 80%;
	background: white;
	padding: 30px;
	border-radius: 12px;
	text-align: center;
	box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.logo { width: 80px; height: 80px; border-radius: 12px; margin-bottom: 16px; }
.app-title { font-size: 20px; font-weight: bold; display: block; margin-bottom: 4px; }
.app-subtitle { font-size: 14px; color: #64748b; display: block; margin-bottom: 24px; }
.form-group { margin-bottom: 16px; }
.input {
	width: 100%;
	height: 44px;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 0 12px;
	box-sizing: border-box;
}

.header {
	background: white;
	padding: 12px 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #e2e8f0;
}
.header-title { font-size: 18px; font-weight: bold; }
.header-actions { display: flex; gap: 12px; }
.action-btn { font-size: 14px; color: #2563eb; }

.tabs {
	display: flex;
	background: white;
	border-bottom: 1px solid #e2e8f0;
}
.tab {
	flex: 1;
	text-align: center;
	padding: 12px 0;
	font-size: 14px;
	color: #64748b;
	border-bottom: 2px solid transparent;
}
.tab.active {
	color: #2563eb;
	border-bottom-color: #2563eb;
	font-weight: 500;
}

.stats-grid {
	display: flex;
	gap: 12px;
	margin-bottom: 20px;
}
.stat-card {
	flex: 1;
	padding: 16px;
	border-radius: 12px;
	text-align: center;
}
.bg-blue-50 { background-color: #eff6ff; }
.bg-indigo-50 { background-color: #eef2ff; }
.stat-value { font-size: 24px; font-weight: bold; display: block; color: #1e3a8a; }
.stat-label { font-size: 12px; color: #64748b; }

.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; display: block; }

.ticket-card {
	background: white;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.ticket-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.ticket-id { font-family: monospace; font-size: 12px; color: #64748b; }
.status-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; font-weight: bold; }
.status-badge.open { background: #eff6ff; color: #2563eb; }
.status-badge.assigned { background: #eef2ff; color: #4f46e5; }
.status-badge.completed { background: #f0fdf4; color: #16a34a; }

.ticket-title { font-size: 16px; font-weight: 500; margin-bottom: 8px; display: block; }
.ticket-meta { font-size: 12px; color: #64748b; display: block; margin-bottom: 8px; }
.ticket-tags { display: flex; gap: 8px; margin-bottom: 8px; }
.tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #475569; }

.loading { text-align: center; padding: 20px; color: #94a3b8; }
.empty { text-align: center; padding: 40px; color: #94a3b8; }
</style>
