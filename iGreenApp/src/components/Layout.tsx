import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  CheckSquare, 
  History, 
  Settings, 
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useLanguage } from './LanguageContext';

export interface LayoutUser {
  name: string;
  username: string;
  role: string;
}

export interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user?: LayoutUser | null;
}

export function Sidebar({ currentView, setCurrentView, user }: SidebarProps) {
  const { t } = useLanguage();
  const userInitials = user?.name?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.name || 'User';
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Engineer';

  const menuItems = [
    { id: 'dashboard', label: t.home, icon: LayoutDashboard },
    { id: 'queue', label: t.queue, icon: Ticket },
    { id: 'my-work', label: t.mine, icon: CheckSquare },
    { id: 'history', label: t.history, icon: History },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-white">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 border">
            <img src="/favicon.png" alt="iGreen+" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight">iGreen+</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${
                currentView === item.id 
                  ? "bg-slate-800 text-white hover:bg-slate-700" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              onClick={() => setCurrentView(item.id)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-slate-800" />
        
        <div className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t.settings}
        </div>
        <Button 
          variant={currentView === 'profile' ? "secondary" : "ghost"}
          className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => setCurrentView('profile')}
        >
          <User className="w-4 h-4" />
          {t.profile}
        </Button>
      </ScrollArea>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-slate-400 truncate">{displayRole}</div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setCurrentView('profile')}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MobileNav({ currentView, setCurrentView }: Omit<SidebarProps, 'user'>) {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', label: t.home, icon: LayoutDashboard },
    { id: 'queue', label: t.queue, icon: Ticket },
    { id: 'my-work', label: t.mine, icon: CheckSquare },
    { id: 'profile', label: t.profile, icon: User }, // Replaced History with Profile for better mobile UX
  ];

  return (
    <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {menuItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
               // TODO: Backend Integration - Navigation
               // Switching views (e.g., to Queue) triggers state change in App.tsx
               setCurrentView(item.id);
            }}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
              isActive ? "text-green-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Header({ user }: { user?: LayoutUser | null }) {
  const { t } = useLanguage();
  const userInitials = user?.name?.charAt(0).toUpperCase() || 'U';
  
  return (
    <header className="h-14 md:h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 border">
          <img src="/favicon.png" alt="iGreen+ Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-bold text-lg tracking-tight">iGreen+</span>
      </div>

      <div className="hidden md:block text-sm text-slate-500">
        {t.organization}: <span className="font-medium text-slate-900">GreenPower Energy</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="md:hidden">
           <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
