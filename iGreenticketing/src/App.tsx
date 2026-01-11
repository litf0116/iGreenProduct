import { useState, useEffect, useCallback } from "react";
import { Language } from "./lib/i18n";
import { translations, TranslationKey } from "./lib/i18n";
import api from "./lib/api";
import {
  Ticket,
  Template,
  Priority,
  TicketComment,
  Site,
  Group,
  User as UserType,
  SLAConfig,
  ProblemType,
  SiteLevelConfig,
  TicketStatus,
  TicketType,
} from "./lib/types";
import { LanguageSelector } from "./components/LanguageSelector";
import { Dashboard } from "./components/Dashboard";
import { CreateTicket } from "./components/CreateTicket";
import { TemplateManager } from "./components/TemplateManager";
import { TicketDetail } from "./components/TicketDetail";
import { SiteManagement } from "./components/SiteManagement";
import { GroupManager } from "./components/GroupManager";
import { SystemSettings } from "./components/SystemSettings";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ClipboardList, LogOut } from "lucide-react";
import { Sheet, SheetContent } from "./components/ui/sheet";
import appLogo from "figma:asset/e2d3be716f2b03621853146ef3c8dd02abba30cb.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";

type View = "dashboard" | "tickets" | "sites" | "groups" | "settings";
type AuthView = "login" | "signup";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [slaConfigs, setSlaConfigs] = useState<SLAConfig[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [siteLevelConfigs, setSiteLevelConfigs] = useState<SiteLevelConfig[]>([]);

  const t = (key: TranslationKey) => translations[language][key];

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        return false;
      }
    }
    setIsAuthenticated(false);
    return false;
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, templatesRes, sitesRes, groupsRes, usersRes] = await Promise.all([
        api.getTickets().catch(() => ({ records: [] })),
        api.getTemplates().catch(() => []),
        api.getSites().catch(() => ({ records: [] })),
        api.getGroups().catch(() => []),
        api.getUsers().catch(() => ({ records: [] })),
      ]);

      setTickets(ticketsRes.records || ticketsRes || []);
      setTemplates(templatesRes || []);
      setSites(sitesRes.records || sitesRes || []);
      setGroups(groupsRes || []);
      setUsers(usersRes.records || usersRes || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConfigData = useCallback(async () => {
    try {
      const [sla, problems, levels] = await Promise.all([
        api.getSLAConfigs().catch(() => []),
        api.getProblemTypes().catch(() => []),
        api.getSiteLevelConfigs().catch(() => []),
      ]);

      setSlaConfigs(sla || []);
      setProblemTypes(problems || []);
      setSiteLevelConfigs(levels || []);
    } catch (error) {
      console.error('Failed to load config data:', error);
    }
  }, []);

  useEffect(() => {
    checkAuth().then((authenticated) => {
      if (authenticated) {
        loadInitialData();
        loadConfigData();
      } else {
        setLoading(false);
      }
    });
  }, [checkAuth, loadInitialData, loadConfigData]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500";
      case "ASSIGNED":
        return "bg-indigo-500";
      case "ACCEPTED":
        return "bg-cyan-500";
      case "IN_PROGRESS":
        return "bg-orange-500";
      case "SUBMITTED":
        return "bg-purple-500";
      case "COMPLETED":
        return "bg-green-500";
      case "ON_HOLD":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      P1: "destructive",
      P2: "destructive",
      P3: "default",
      P4: "secondary",
    };
    return variants[priority] || "default";
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "ACCEPTED").length,
    completed: tickets.filter((t) => t.status === "COMPLETED").length,
  };

  const handleLogin = async (username: string, password: string, country: string) => {
    try {
      await api.login(username, password, country);
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadInitialData();
      await loadConfigData();
      setCurrentView("dashboard");
      toast.success(t("signInSuccess"));
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const handleSignUp = async (name: string, username: string, email: string, password: string, role: string, country: string) => {
    try {
      await api.register({ name, username, email, password, role: role.toUpperCase(), country });
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadInitialData();
      setCurrentView("dashboard");
      toast.success(t("signUpSuccess"));
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTickets([]);
    setTemplates([]);
    setSites([]);
    setGroups([]);
    setUsers([]);
    setCurrentView("dashboard");
    setSelectedTicket(null);
  };

  const handleAddSite = async (siteData: Partial<Site>) => {
    try {
      const newSite = await api.createSite(siteData);
      setSites(prev => [...(prev.records || prev), newSite]);
      toast.success(t("siteCreated"));
    } catch (error: any) {
      toast.error(error.message || "Failed to create site");
    }
  };

  const handleUpdateSite = async (id: string, siteData: Partial<Site>) => {
    try {
      const updatedSite = await api.updateSite(id, siteData);
      setSites(prev => ({
        ...prev,
        records: (prev.records || prev).map(s => s.id === id ? updatedSite : s)
      }));
      toast.success(t("siteUpdated"));
    } catch (error: any) {
      toast.error(error.message || "Failed to update site");
    }
  };

  const handleDeleteSite = async (id: string) => {
    try {
      await api.deleteSite(id);
      setSites(prev => ({
        ...prev,
        records: (prev.records || prev).filter(s => s.id !== id)
      }));
      toast.success(t("siteDeleted"));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete site");
    }
  };

  const handleSaveGroup = async (groupData: Partial<Group>) => {
    try {
      if (groupData.id) {
        const updated = await api.updateGroup(groupData.id, groupData);
        setGroups(prev => prev.map(g => g.id === groupData.id ? updated : g));
        toast.success(t("groupUpdated"));
      } else {
        const created = await api.createGroup(groupData);
        setGroups(prev => [...prev, created]);
        toast.success(t("groupCreated"));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save group");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await api.deleteGroup(id);
      setGroups(prev => prev.filter(g => g.id !== id));
      toast.success("Group deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete group");
    }
  };

  const handleSaveUser = async (userData: Partial<UserType> & { password?: string }) => {
    try {
      if (userData.id) {
        const updated = await api.updateUser(userData.id, userData);
        setUsers(prev => ({
          ...prev,
          records: (prev.records || prev).map(u => u.id === userData.id ? updated : u)
        }));
        toast.success(t("userUpdated"));
      } else {
        const created = await api.createUser(userData);
        setUsers(prev => ({
          ...prev,
          records: [...(prev.records || prev), created]
        }));
        toast.success(t("userCreated"));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers(prev => ({
        ...prev,
        records: (prev.records || prev).filter(u => u.id !== id)
      }));
      toast.success("User deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleImportSites = async (importedSites: Site[]) => {
    for (const site of importedSites) {
      try {
        await api.createSite(site);
      } catch (error) {
        console.error('Failed to import site:', site.name);
      }
    }
    await loadInitialData();
    toast.success(t("importSuccess"));
  };

  const handleCreateTicket = async (ticketData: {
    title: string;
    description: string;
    templateId: string;
    type: TicketType;
    site: string;
    assignedTo: string;
    priority: Priority;
    dueDate: Date;
    relatedTicketIds?: string[];
    problemType?: string;
  }) => {
    try {
      const created = await api.createTicket({
        ...ticketData,
        dueDate: ticketData.dueDate.toISOString(),
      });
      setTickets(prev => [created, ...(prev.records || prev)]);
      toast.success(t("ticketCreated"));
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticket");
    }
  };

  const handleSaveTemplate = async (templateData: Partial<Template>) => {
    try {
      if (templateData.id) {
        const updated = await api.updateTemplate(templateData.id, templateData);
        setTemplates(prev => prev.map(t => t.id === templateData.id ? updated : t));
        toast.success("Template updated");
      } else {
        const created = await api.createTemplate(templateData);
        setTemplates(prev => [...prev, created]);
        toast.success("Template created");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await api.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Template deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete template");
    }
  };

  const handleAcceptTicket = async (ticketId: string, comment?: string) => {
    try {
      const updated = await api.acceptTicket(ticketId, comment);
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success("Ticket accepted");
    } catch (error: any) {
      toast.error(error.message || "Failed to accept ticket");
    }
  };

  const handleDeclineTicket = async (ticketId: string, reason: string) => {
    try {
      const updated = await api.declineTicket(ticketId, reason);
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success("Ticket declined");
    } catch (error: any) {
      toast.error(error.message || "Failed to decline ticket");
    }
  };

  const handleHoldTicket = async (ticketId: string, reason: string) => {
    try {
      const updated = await api.updateTicket(ticketId, { status: "ON_HOLD" as TicketStatus });
      await api.addComment(ticketId, reason, "GENERAL");
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.info("Ticket put on hold");
    } catch (error: any) {
      toast.error(error.message || "Failed to hold ticket");
    }
  };

  const handleResumeTicket = async (ticketId: string) => {
    try {
      const updated = await api.updateTicket(ticketId, { status: "IN_PROGRESS" as TicketStatus });
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success("Ticket resumed");
    } catch (error: any) {
      toast.error(error.message || "Failed to resume ticket");
    }
  };

  const handleReassignTicket = async (ticketId: string, newAssigneeId: string, newAssigneeName: string) => {
    try {
      const updated = await api.updateTicket(ticketId, {
        assignedTo: newAssigneeId,
        status: "ASSIGNED" as TicketStatus
      });
      await api.addComment(ticketId, `Ticket reassigned to ${newAssigneeName}`, "GENERAL");
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success(`Ticket reassigned to ${newAssigneeName}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to reassign ticket");
    }
  };

  const handleDeparture = async (ticketId: string, photo?: string) => {
    try {
      const updated = await api.departTicket(ticketId, photo);
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success("Departure marked successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark departure");
    }
  };

  const handleArrival = async (ticketId: string, photo?: string) => {
    try {
      const updated = await api.arriveTicket(ticketId, photo);
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success("Arrival marked successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark arrival");
    }
  };

  const handleCompleteTicket = async (ticketId: string, photo: string, cause: string, solution: string) => {
    try {
      const updated = await api.completeTicket(ticketId, photo);
      await api.updateTicket(ticketId, { cause, solution });
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success("Ticket submitted for confirmation");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete ticket");
    }
  };

  const handleConfirmCompletion = async (ticketId: string) => {
    try {
      const updated = await api.reviewTicket(ticketId);
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.success("Ticket confirmed and closed");
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm completion");
    }
  };

  const handleRejectCompletion = async (ticketId: string, reason: string) => {
    try {
      const updated = await api.updateTicket(ticketId, { status: "IN_PROGRESS" as TicketStatus });
      await api.addComment(ticketId, `Completion rejected: ${reason}`, "COMMENT");
      setTickets(prev => ({
        ...prev,
        records: (prev.records || prev).map(t => t.id === ticketId ? updated : t)
      }));
      setSelectedTicket(null);
      toast.info("Ticket returned to In Progress");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject completion");
    }
  };

  const handleUpdateSLA = async (config: SLAConfig) => {
    try {
      const updated = await api.createSLAConfig(config);
      setSlaConfigs(prev => {
        const existing = prev.findIndex(c => c.priority === config.priority);
        if (existing >= 0) {
          const newConfigs = [...prev];
          newConfigs[existing] = updated;
          return newConfigs;
        }
        return [...prev, updated];
      });
      toast.success("SLA configuration updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update SLA");
    }
  };

  const handleAddProblemType = async (type: ProblemType) => {
    try {
      const created = await api.createProblemType(type);
      setProblemTypes(prev => [...prev, created]);
      toast.success("Problem type added");
    } catch (error: any) {
      toast.error(error.message || "Failed to add problem type");
    }
  };

  const handleUpdateProblemType = async (type: ProblemType) => {
    try {
      const updated = await api.updateProblemType(type.id, type);
      setProblemTypes(prev => prev.map(t => t.id === type.id ? updated : t));
      toast.success("Problem type updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update problem type");
    }
  };

  const handleDeleteProblemType = async (id: string) => {
    try {
      await api.deleteProblemType(id);
      setProblemTypes(prev => prev.filter(t => t.id !== id));
      toast.success("Problem type deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete problem type");
    }
  };

  const handleAddSiteLevel = async (level: SiteLevelConfig) => {
    try {
      const created = await api.createSiteLevelConfig(level);
      setSiteLevelConfigs(prev => [...prev, created]);
      toast.success("Site level added");
    } catch (error: any) {
      toast.error(error.message || "Failed to add site level");
    }
  };

  const handleUpdateSiteLevel = async (level: SiteLevelConfig) => {
    try {
      const updated = await api.updateSiteLevelConfig(level.id, level);
      setSiteLevelConfigs(prev => prev.map(l => l.id === level.id ? updated : l));
      toast.success("Site level updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update site level");
    }
  };

  const handleDeleteSiteLevel = async (id: string) => {
    try {
      await api.deleteSiteLevelConfig(id);
      setSiteLevelConfigs(prev => prev.filter(l => l.id !== id));
      toast.success("Site level deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete site level");
    }
  };

  const handleUpdateProfile = async (name: string, username: string) => {
    if (!currentUser) return;
    try {
      const updated = await api.updateUser(currentUser.id, { name, username });
      setCurrentUser(updated);
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>

        {authView === "login" ? (
          <Login
            language={language}
            onLogin={handleLogin}
            onSwitchToSignUp={() => setAuthView("signup")}
          />
        ) : (
          <SignUp
            language={language}
            onSignUp={handleSignUp}
            onSwitchToLogin={() => setAuthView("login")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <img src={appLogo} alt="iGreen+ Logo" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold text-[rgb(0,0,0)] hidden lg:block">iGreen+ Ticket Management</span>
              </div>

              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  onClick={() => setCurrentView("dashboard")}
                  className={currentView === "dashboard" ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                >
                  {t("dashboard")}
                </Button>
                <Button
                  variant={currentView === "tickets" ? "default" : "ghost"}
                  onClick={() => setCurrentView("tickets")}
                  className={currentView === "tickets" ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                >
                  {t("tickets")}
                </Button>
                <Button
                  variant={currentView === "sites" ? "default" : "ghost"}
                  onClick={() => setCurrentView("sites")}
                  className={currentView === "sites" ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                >
                  {t("sites")}
                </Button>
                <Button
                  variant={currentView === "groups" ? "default" : "ghost"}
                  onClick={() => setCurrentView("groups")}
                  className={currentView === "groups" ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                >
                  {t("groups")}
                </Button>
                <Button
                  variant={currentView === "settings" ? "default" : "ghost"}
                  onClick={() => setCurrentView("settings")}
                  className={currentView === "settings" ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                >
                  {t("systemSettings")}
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-foreground">{currentUser?.name || "User"}</p>
                      <p className="text-muted-foreground">@{currentUser?.username || "user"}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav className="md:hidden flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            {["dashboard", "tickets", "sites", "groups", "settings"].map((view) => (
              <Button
                key={view}
                variant={currentView === view ? "default" : "ghost"}
                onClick={() => setCurrentView(view as View)}
                className={currentView === view ? "bg-primary hover:bg-primary/90 flex-1 min-w-fit" : "hover:bg-secondary flex-1 min-w-fit"}
                size="sm"
              >
                {t(view)}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6">
        {currentView === "dashboard" && (
          <Dashboard
            tickets={tickets}
            stats={stats}
            language={language}
            onCreateTicket={() => setCurrentView("tickets")}
            onViewTicket={setSelectedTicket}
          />
        )}

        {currentView === "tickets" && (
          <Card className="bg-white">
            <Tabs defaultValue="create" className="w-full">
              <div className="border-b px-6 pt-6">
                <TabsList className="bg-secondary">
                  <TabsTrigger value="create" className="data-[state=active]:bg-white">{t("createTicket")}</TabsTrigger>
                  <TabsTrigger value="templates" className="data-[state=active]:bg-white">{t("templates")}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="create" className="p-6 mt-0">
                <CreateTicket
                  templates={templates}
                  users={users}
                  groups={groups}
                  sites={sites.map(s => ({ id: s.id, name: s.name }))}
                  tickets={tickets}
                  problemTypes={problemTypes}
                  language={language}
                  onSubmit={handleCreateTicket}
                  onCancel={() => setCurrentView("dashboard")}
                />
              </TabsContent>

              <TabsContent value="templates" className="p-6 mt-0">
                <TemplateManager
                  templates={templates}
                  language={language}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {currentView === "sites" && (
          <SiteManagement
            sites={sites}
            language={language}
            onAddSite={handleAddSite}
            onUpdateSite={handleUpdateSite}
            onDeleteSite={handleDeleteSite}
            onImportSites={handleImportSites}
          />
        )}

        {currentView === "groups" && (
          <GroupManager
            groups={groups}
            users={users}
            language={language}
            onSaveGroup={handleSaveGroup}
            onSaveUser={handleSaveUser}
            onDeleteGroup={handleDeleteGroup}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {currentView === "settings" && (
          <SystemSettings
            language={language}
            slaConfigs={slaConfigs}
            problemTypes={problemTypes}
            siteLevelConfigs={siteLevelConfigs}
            onUpdateSLA={handleUpdateSLA}
            onAddProblemType={handleAddProblemType}
            onUpdateProblemType={handleUpdateProblemType}
            onDeleteProblemType={handleDeleteProblemType}
            onAddSiteLevel={handleAddSiteLevel}
            onUpdateSiteLevel={handleUpdateSiteLevel}
            onDeleteSiteLevel={handleDeleteSiteLevel}
          />
        )}
      </div>

      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="w-full md:max-w-3xl overflow-y-auto bg-background p-0">
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              template={templates.find((t) => t.id === selectedTicket.templateId)}
              language={language}
              currentUserId={currentUser?.id || ""}
              users={users}
              onClose={() => setSelectedTicket(null)}
              onAccept={(comment) => handleAcceptTicket(selectedTicket.id, comment)}
              onDecline={(reason) => handleDeclineTicket(selectedTicket.id, reason)}
              onHold={(reason) => handleHoldTicket(selectedTicket.id, reason)}
              onResume={() => handleResumeTicket(selectedTicket.id)}
              onReassign={(newId, newName) => handleReassignTicket(selectedTicket.id, newId, newName)}
              onDeparture={(photo) => handleDeparture(selectedTicket.id, photo)}
              onArrival={(photo) => handleArrival(selectedTicket.id, photo)}
              onComplete={(photo, cause, solution) => handleCompleteTicket(selectedTicket.id, photo, cause, solution)}
              onConfirm={() => handleConfirmCompletion(selectedTicket.id)}
              onReject={(reason) => handleRejectCompletion(selectedTicket.id, reason)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Toaster />
    </div>
  );
}
