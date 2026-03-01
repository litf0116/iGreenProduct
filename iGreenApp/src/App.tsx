import React, {useEffect, useState} from 'react';
import {Header, MobileNav, Sidebar} from './components/Layout';
import {Dashboard} from './components/Dashboard';
import {TicketList} from './components/TicketList';
import {TicketDetail} from './components/TicketDetail';
import {Profile} from './components/Profile';
import {Login} from './components/Login';
import {Ticket, TicketStatus} from './lib/data';
import {Toaster} from "./components/ui/sonner";
import {toast} from "sonner";
import {api} from './lib/api';
import {clearAuthToken, getAuthToken} from './lib/storage';
import {Button} from "./components/ui/button";
import {RefreshCw} from 'lucide-react';
import {LanguageProvider, useLanguage} from './components/LanguageContext';

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
  group: string;
  id: string;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<UserProfile>({
    name: "Mike Technician",
    email: "mike.tech@volttech.com",
    username: "mike.tech",
    phone: "+1 (555) 123-4567",
    group: "Bangkok Operations (Zone A)",
    id: "TECH-8821"
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const {t} = useLanguage();

  // 检查登录状态并恢复会话
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        try {
          // 验证 token 并获取用户信息
          const userData = await api.getCurrentUser();
          if (userData.success && userData.data) {
            // 转换后端用户数据格式
            const backendUser = userData.data;
            setUser({
              id: backendUser.id,
              name: backendUser.name,
              email: backendUser.email || '',
              username: backendUser.username,
              phone: backendUser.phone || '',
              group: backendUser.groupName || backendUser.groupId || ''
            });
            setIsAuthenticated(true);
          } else {
            // Token 无效，清除
            await clearAuthToken();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          await clearAuthToken();
        }
      }
      setInitializing(false);
    };

    checkAuth();
  }, []);

  const loadTickets = async (reset = false) => {
    if (loadingMore && !reset) return;

    try {
      if (reset) {
        setRefreshing(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const size = 20;
      const page = reset ? 1 : Math.floor(tickets.length / size) + 1;

      // 根据当前视图加载不同的工单列表
      let data;
      switch (currentView) {
        case 'queue':
        case 'dashboard': // Dashboard 也需要加载待接单工单
          data = await api.getPendingTickets();
          setHasMore(false);
          break;
        case 'my-work':
          data = await api.getMyTickets(page, size);
          break;
        case 'history':
          data = await api.getCompletedTickets(page, size);
          break;
        default:
          data = [];
      }

      if (reset) {
        setTickets(data);
      } else {
        setTickets(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      toast.error("Failed to load tickets. Is the backend running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    if (isAuthenticated) {
      loadTickets(true);
    }
  }, [isAuthenticated, currentView]);

  const handleTicketClick = async (ticket: Ticket) => {
    try {
      // Fetch full ticket details from backend
      const fullTicket = await api.getTicket(ticket.id);
      setSelectedTicket(fullTicket);
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
      // Fall back to list data if API fails
      setSelectedTicket(ticket);
    }
  };

  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>, options?: { skipApi?: boolean }) => {
    const previousTickets = [...tickets];
    const targetTicket = tickets.find(t => t.id === id);

    if (!targetTicket) return;

    // 本地乐观更新
    setTickets(prev => prev.map(t =>
      t.id === id ? {...t, ...updates} : t
    ));

    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? {...prev, ...updates} : null);
    }

    // skipApi 默认为 false，调用者可以传 true 跳过 API 调用
    // 用于操作接口（accept/depart/arrive/complete）后刷新，避免重复调用
    if (options?.skipApi) {
      return;
    }

    try {
      await api.updateTicket(id, updates);
    } catch (error) {
      setTickets(previousTickets);
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(targetTicket);
      }
      toast.error("Failed to update ticket");
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    handleUpdateTicket(id, {status: newStatus as TicketStatus});
  };

  const handleLogin = async () => {
    try {
      // 获取用户信息
      const userData = await api.getCurrentUser();
      if (userData.success && userData.data) {
        const backendUser = userData.data;
        setUser({
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email || '',
          username: backendUser.username,
          phone: backendUser.phone || '',
          group: backendUser.groupName || backendUser.groupId || ''
        });
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({...prev, ...updates}));
    toast.success("Profile updated successfully");
  };

  const handleViewRelatedTicket = (ticketId: string) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (targetTicket) {
      setSelectedTicket(targetTicket);
    } else {
      // Try to see if we can fetch it or if it's just not in the list
      // For now, just show error
      toast.error("Related ticket not found in current list.");
    }
  };

  // 不同视图使用不同 API 获取数据，无需本地筛选
  const getFilteredTickets = () => {
    return tickets;
  };

  // Show loading while checking authentication
  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin}/>
        <Toaster/>
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <div className="hidden md:block">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView}/>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <Header/>

        {currentView !== 'profile' && (
          <div className="bg-white border-b px-4 md:px-6 py-2 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              {loading ? "Syncing..." : `Last synced: ${new Date().toLocaleTimeString()}`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadTickets(true)}
                disabled={refreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`}/>
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto relative" id="main-scroll-container">
          {loading && tickets.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500"/>
                <p>Loading workspace...</p>
              </div>
            </div>
          ) : null}

          {currentView === 'dashboard' && (
            <Dashboard
              tickets={tickets}
              onTicketClick={handleTicketClick}
              onViewAllClick={() => setCurrentView('queue')}
            />
          )}

          {currentView === 'queue' && (
            <TicketList
              title={t.queue}
              tickets={getFilteredTickets()}
              onTicketClick={handleTicketClick}
              showAssignee={false}
              onRefresh={() => loadTickets(true)}
              refreshing={refreshing}
              onLoadMore={() => loadTickets(false)}
              hasMore={hasMore}
              loadingMore={loadingMore}
            />
          )}

          {currentView === 'my-work' && (
            <TicketList
              title={t.myWork}
              tickets={getFilteredTickets()}
              onTicketClick={handleTicketClick}
              onLoadMore={() => loadTickets(false)}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onRefresh={() => loadTickets(true)}
              refreshing={refreshing}
            />
          )}

          {currentView === 'history' && (
            <TicketList
              title={t.history}
              tickets={getFilteredTickets()}
              onTicketClick={handleTicketClick}
              onLoadMore={() => loadTickets(false)}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onRefresh={() => loadTickets(true)}
              refreshing={refreshing}
            />
          )}

          {currentView === 'profile' && (
            <Profile
              onLogout={handleLogout}
              user={user}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileNav currentView={currentView} setCurrentView={setCurrentView}/>
      </div>

      <TicketDetail
        ticket={selectedTicket}
        onClose={handleCloseDetail}
        onUpdateTicket={handleUpdateTicket}
        onViewRelatedTicket={handleViewRelatedTicket}
      />

      <Toaster/>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent/>
    </LanguageProvider>
  );
}
