import { useState } from "react";
import { Language } from "./lib/i18n";
import { translations, TranslationKey } from "./lib/i18n";
import { Ticket, Template, Priority, TicketComment, Site, Group, User as UserType, SLAConfig, ProblemType, SiteLevelConfig } from "./lib/types";
import { mockUsers, mockTemplates, mockTickets, mockSites, mockGroups } from "./lib/mockData";
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
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { TicketStatus } from "./lib/types";
import { ClipboardList, AlertCircle, Clock, CheckCircle2, User, LogOut, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./components/ui/sheet";
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

interface UserAccount {
  name: string;
  username: string;
  role: string;
  password: string;
}

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([
    {
      name: "Demo User",
      username: "demo@csenergy.com",
      role: "Maintenance Engineer",
      password: "demo123",
    },
  ]);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [sites, setSites] = useState<Site[]>(mockSites);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [appUsers, setAppUsers] = useState<UserType[]>(mockUsers);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [userName, setUserName] = useState("Demo User");
  const [userUsername, setUserUsername] = useState("demo@csenergy.com");
  const [userRole, setUserRole] = useState("Maintenance Engineer");

  // System Settings State
  const [slaConfigs, setSlaConfigs] = useState<SLAConfig[]>([
    { priority: "P1", responseTime: 1, resolutionTime: 4 },
    { priority: "P2", responseTime: 2, resolutionTime: 8 },
    { priority: "P3", responseTime: 4, resolutionTime: 24 },
    { priority: "P4", responseTime: 8, resolutionTime: 48 },
  ]);

  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([
    { id: "PT1", name: "Hardware Failure", description: "Physical component malfunction" },
    { id: "PT2", name: "Software Bug", description: "Software logic error or crash" },
    { id: "PT3", name: "Network Issue", description: "Connectivity problems" },
  ]);

  const [siteLevelConfigs, setSiteLevelConfigs] = useState<SiteLevelConfig[]>([
    { id: "SL1", name: "normal", description: "Standard site priority", slaMultiplier: 1.0 },
    { id: "SL2", name: "vip", description: "High priority site", slaMultiplier: 0.5 },
  ]);

  const t = (key: TranslationKey) => translations[language][key];
  const currentUserId = "5";

  const handleUpdateSLA = (config: SLAConfig) => {
    setSlaConfigs(prev => prev.map(c => c.priority === config.priority ? config : c));
    toast.success("SLA configuration updated");
  };

  const handleAddProblemType = (type: ProblemType) => {
    setProblemTypes(prev => [...prev, type]);
    toast.success("Problem type added");
  };

  const handleUpdateProblemType = (type: ProblemType) => {
    setProblemTypes(prev => prev.map(t => t.id === type.id ? type : t));
    toast.success("Problem type updated");
  };

  const handleDeleteProblemType = (id: string) => {
    setProblemTypes(prev => prev.filter(t => t.id !== id));
    toast.success("Problem type deleted");
  };

  const handleAddSiteLevel = (level: SiteLevelConfig) => {
    setSiteLevelConfigs(prev => [...prev, level]);
    toast.success("Site level added");
  };

  const handleUpdateSiteLevel = (level: SiteLevelConfig) => {
    setSiteLevelConfigs(prev => prev.map(l => l.id === level.id ? level : l));
    toast.success("Site level updated");
  };

  const handleDeleteSiteLevel = (id: string) => {
    setSiteLevelConfigs(prev => prev.filter(l => l.id !== id));
    toast.success("Site level deleted");
  };

  const handleCreateTicket = (ticketData: {
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
    const template = templates.find((t) => t.id === ticketData.templateId);
    // In real app we might assign to a user within the group or just the group
    // For now, we'll check if assignedTo is a group ID
    const assignedGroup = groups.find(g => g.id === ticketData.assignedTo);
    const assignedUser = appUsers.find((u) => u.id === ticketData.assignedTo);
    
    const assignedName = assignedGroup ? assignedGroup.name : (assignedUser ? assignedUser.name : "Unknown");

    if (!template) return;

    const newTicket: Ticket = {
      id: `T${String(tickets.length + 1).padStart(3, "0")}`,
      title: ticketData.title,
      description: ticketData.description,
      templateId: ticketData.templateId,
      templateName: template.name,
      type: ticketData.type,
      site: ticketData.site,
      status: "open",
      priority: ticketData.priority,
      assignedTo: ticketData.assignedTo,
      assignedToName: assignedName,
      createdBy: currentUserId,
      createdByName: userName,
      createdAt: new Date(),
      dueDate: ticketData.dueDate,
      completedSteps: [],
      stepData: {},
      accepted: false,
      comments: [],
      relatedTicketIds: ticketData.relatedTicketIds,
      problemType: ticketData.problemType,
    };

    setTickets([newTicket, ...tickets]);
    toast.success(t("ticketCreated"));
  };

  const handleSaveTemplate = (templateData: Template | Omit<Template, "id" | "createdAt" | "updatedAt">) => {
    if ("id" in templateData) {
      setTemplates(templates.map(t => t.id === templateData.id ? { ...templateData, updatedAt: new Date() } : t));
    } else {
      const newTemplate: Template = {
        ...templateData,
        id: `TPL${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTemplates([...templates, newTemplate]);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "accepted":
        return "bg-cyan-500";
      case "inProgress":
        return "bg-orange-500";
      case "submitted":
        return "bg-purple-500";
      case "closed":
        return "bg-green-500";
      case "onHold":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      P1: "destructive",
      P2: "destructive",
      P3: "default",
      P4: "secondary",
    };
    return variants[priority] || "default";
  };

  const statusCategories: TicketStatus[] = ["open", "accepted", "inProgress", "onHold", "submitted", "closed"];
  
  const handleAcceptTicket = (ticketId: string, comment: string) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newComment: TicketComment = {
            id: `C${Date.now()}`,
            userId: currentUserId,
            userName: userName,
            comment: comment || "Accepted ticket and started work",
            createdAt: new Date(),
            type: "accept",
          };
          return {
            ...ticket,
            status: "inProgress" as TicketStatus,
            accepted: true,
            acceptedAt: new Date(),
            comments: [...ticket.comments, newComment],
          };
        }
        return ticket;
      })
    );
    setSelectedTicket(null);
  };

  const handleDeclineTicket = (ticketId: string, reason: string) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newComment: TicketComment = {
            id: `C${Date.now()}`,
            userId: currentUserId,
            userName: userName,
            comment: reason,
            createdAt: new Date(),
            type: "decline",
          };
          return {
            ...ticket,
            status: "cancelled" as TicketStatus,
            comments: [...ticket.comments, newComment],
          };
        }
        return ticket;
      })
    );
    setSelectedTicket(null);
  };

  const handleHoldTicket = (ticketId: string, reason: string) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newComment: TicketComment = {
            id: `C${Date.now()}`,
            userId: currentUserId,
            userName: userName,
            comment: reason,
            createdAt: new Date(),
            type: "general",
          };
          return {
            ...ticket,
            status: "onHold" as TicketStatus,
            comments: [...ticket.comments, newComment],
          };
        }
        return ticket;
      })
    );
    setSelectedTicket(null);
    toast.info("Ticket put on hold");
  };

  const handleResumeTicket = (ticketId: string) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newComment: TicketComment = {
            id: `C${Date.now()}`,
            userId: currentUserId,
            userName: userName,
            comment: "Ticket resumed from hold",
            createdAt: new Date(),
            type: "general",
          };
          return {
            ...ticket,
            status: "inProgress" as TicketStatus,
            comments: [...ticket.comments, newComment],
          };
        }
        return ticket;
      })
    );
    setSelectedTicket(null);
    toast.success("Ticket resumed");
  };

  const handleReassignTicket = (ticketId: string, newAssigneeId: string, newAssigneeName: string) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newComment: TicketComment = {
            id: `C${Date.now()}`,
            userId: currentUserId,
            userName: userName,
            comment: `Ticket reassigned to ${newAssigneeName}`,
            createdAt: new Date(),
            type: "general",
          };
          return {
            ...ticket,
            assignedTo: newAssigneeId,
            assignedToName: newAssigneeName,
            status: "open" as TicketStatus,
            accepted: false,
            acceptedAt: undefined,
            departureAt: undefined,
            departurePhoto: undefined,
            arrivalAt: undefined,
            arrivalPhoto: undefined,
            comments: [...ticket.comments, newComment],
          };
        }
        return ticket;
      })
    );
    setSelectedTicket(null);
    toast.success(`Ticket reassigned to ${newAssigneeName}`);
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "inProgress" || t.status === "accepted").length,
    completed: tickets.filter((t) => t.status === "closed").length,
  };

  const handleUpdateProfile = (name: string, username: string) => {
    setUserName(name);
    setUserUsername(username);
  };

  const handleLogin = async (username: string, password: string) => {
    // Simulate async login
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    setUserName(user.name);
    setUserUsername(user.username);
    setUserRole(user.role);
    setIsAuthenticated(true);
    setCurrentView("dashboard");
    toast.success(t("signInSuccess"));
  };

  const handleSignUp = async (name: string, username: string, password: string, role: string) => {
    // Simulate async signup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    const newUser: UserAccount = { name, username, role, password };
    setUsers([...users, newUser]);
    setUserName(name);
    setUserUsername(username);
    setUserRole(role);
    setIsAuthenticated(true);
    toast.success(t("signUpSuccess"));
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setIsAuthenticated(false);
    setCurrentView("dashboard");
    setSelectedTicket(null);
  };

  const handleAddSite = (siteData: Omit<Site, "id" | "createdAt" | "updatedAt">) => {
    const newSite: Site = {
      ...siteData,
      id: `S${String(sites.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSites([...sites, newSite]);
    toast.success(t("siteCreated"));
  };

  const handleUpdateSite = (id: string, siteData: Omit<Site, "id" | "createdAt" | "updatedAt">) => {
    setSites(
      sites.map((site) =>
        site.id === id
          ? { ...site, ...siteData, updatedAt: new Date() }
          : site
      )
    );
    toast.success(t("siteUpdated"));
  };

  const handleDeleteSite = (id: string) => {
    setSites(sites.filter((site) => site.id !== id));
    toast.success(t("siteDeleted"));
  };

  const handleSaveGroup = (groupData: Partial<Group>) => {
    if (groupData.id) {
      setGroups(groups.map(g => g.id === groupData.id ? { ...g, ...groupData, updatedAt: new Date() } as Group : g));
      toast.success(t("groupUpdated"));
    } else {
      const newGroup: Group = {
        id: `G${Date.now()}`,
        name: groupData.name || "",
        description: groupData.description || "",
        tags: groupData.tags || [],
        status: groupData.status || "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setGroups([...groups, newGroup]);
      toast.success(t("groupCreated"));
    }
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
    toast.success("Group deleted");
  };

  const handleSaveUser = (userData: Partial<UserType> & { password?: string }) => {
    if (userData.id) {
      setAppUsers(appUsers.map(u => u.id === userData.id ? { ...u, ...userData } as UserType : u));
      toast.success(t("userUpdated"));
    } else {
      const newUser: UserType = {
        id: `U${Date.now()}`,
        name: userData.name || "",
        username: userData.username || "",
        role: userData.role || "engineer",
        groupId: userData.groupId,
        status: userData.status || "active",
        createdAt: new Date(),
      };
      setAppUsers([...appUsers, newUser]);
      // Also add to users array for login simulation if needed, though users state is for UserAccount type
      // For now we keep them separate or we should merge them.
      // The `users` state is used for authentication simulation, while `appUsers` is for management.
      // Let's add to authentication users too for consistency in this demo.
      if (userData.username && userData.password) {
        setUsers([...users, {
          name: userData.name || "",
          email: userData.username, // Using username as email for login in this mock
          role: userData.role === "engineer" ? "Maintenance Engineer" : (userData.role === "manager" ? "Supervisor" : "Admin"),
          password: userData.password,
        }]);
      }
      toast.success(t("userCreated"));
    }
  };

  const handleDeleteUser = (id: string) => {
    setAppUsers(appUsers.filter(u => u.id !== id));
    toast.success("User deleted");
  };

  const handleImportSites = (importedSites: Site[]) => {
    setSites([...sites, ...importedSites]);
    toast.success(t("importSuccess"));
  };

  const handleDeparture = (ticketId: string, photo?: string) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              departureAt: new Date(),
              departurePhoto: photo,
              status: "inProgress" as TicketStatus,
            }
          : ticket
      )
    );
    setSelectedTicket(null);
    toast.success("Departure marked successfully");
  };

  const handleArrival = (ticketId: string, photo?: string) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              arrivalAt: new Date(),
              arrivalPhoto: photo,
            }
          : ticket
      )
    );
    setSelectedTicket(null);
    toast.success("Arrival marked successfully");
  };

  const handleCompleteTicket = (ticketId: string, photo: string, cause: string, solution: string) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: "submitted" as TicketStatus,
              completionPhoto: photo,
              cause,
              solution,
            }
          : ticket
      )
    );
    setSelectedTicket(null);
    toast.success("Ticket submitted for confirmation");
  };

  const handleConfirmCompletion = (ticketId: string) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newComment: TicketComment = {
            id: `C${Date.now()}`,
            userId: currentUserId,
            userName: userName,
            comment: "Ticket completion confirmed",
            createdAt: new Date(),
            type: "general",
          };
          return {
            ...ticket,
            status: "closed" as TicketStatus,
            comments: [...ticket.comments, newComment],
          };
        }
        return ticket;
      })
    );
    setSelectedTicket(null);
    toast.success("Ticket confirmed and closed");
  };

  const handleRejectCompletion = (ticketId: string, reason: string) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newComment: TicketComment = {
            id: `C${Date.now()}`,
            userId: currentUserId,
            userName: userName,
            comment: `Completion rejected: ${reason}`,
            createdAt: new Date(),
            type: "general",
          };
          return {
            ...ticket,
            status: "inProgress" as TicketStatus,
            comments: [...ticket.comments, newComment],
          };
        }
        return ticket;
      })
    );
    setSelectedTicket(null);
    toast.info("Ticket returned to In Progress");
  };

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Language Selector - Fixed Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>

        {authView === "login" ? (
          <Login
            language={language}
            onLogin={handleLogin} // handleLogin now accepts (username, password)
            onSwitchToSignUp={() => setAuthView("signup")}
          />
        ) : (
          <SignUp
            language={language}
            onSignUp={handleSignUp} // handleSignUp now accepts (name, username, password, role)
            onSwitchToLogin={() => setAuthView("login")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <img src={appLogo} alt="iGreen+ Logo" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold text-[rgb(0,0,0)] hidden lg:block">iGreen+ Ticket Management</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  onClick={() => setCurrentView("dashboard")}
                  className={
                    currentView === "dashboard"
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-secondary"
                  }
                >
                  {t("dashboard")}
                </Button>
                <Button
                  variant={currentView === "tickets" ? "default" : "ghost"}
                  onClick={() => setCurrentView("tickets")}
                  className={
                    currentView === "tickets"
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-secondary"
                  }
                >
                  {t("tickets")}
                </Button>
                <Button
                  variant={currentView === "sites" ? "default" : "ghost"}
                  onClick={() => setCurrentView("sites")}
                  className={
                    currentView === "sites"
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-secondary"
                  }
                >
                  {t("sites")}
                </Button>
                <Button
                  variant={currentView === "groups" ? "default" : "ghost"}
                  onClick={() => {
                    // Backend Integration: Fetch groups data when navigating to Groups view
                    // API: GET /api/groups
                    setCurrentView("groups")
                  }}
                  className={
                    currentView === "groups"
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-secondary"
                  }
                >
                  {t("groups")}
                </Button>
                <Button
                  variant={currentView === "settings" ? "default" : "ghost"}
                  onClick={() => setCurrentView("settings")}
                  className={
                    currentView === "settings"
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-secondary"
                  }
                >
                  {t("systemSettings")}
                </Button>
              </nav>
            </div>

            {/* Right: Language + Account */}
            <div className="flex items-center gap-3">
              <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />

              {/* Account Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-foreground">{userName}</p>
                      <p className="text-muted-foreground">@{userUsername}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }} 
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              onClick={() => setCurrentView("dashboard")}
              className={
                currentView === "dashboard"
                  ? "bg-primary hover:bg-primary/90 flex-1 min-w-fit"
                  : "hover:bg-secondary flex-1 min-w-fit"
              }
              size="sm"
            >
              {t("dashboard")}
            </Button>
            <Button
              variant={currentView === "tickets" ? "default" : "ghost"}
              onClick={() => setCurrentView("tickets")}
              className={
                currentView === "tickets"
                  ? "bg-primary hover:bg-primary/90 flex-1 min-w-fit"
                  : "hover:bg-secondary flex-1 min-w-fit"
              }
              size="sm"
            >
              {t("tickets")}
            </Button>
            <Button
              variant={currentView === "sites" ? "default" : "ghost"}
              onClick={() => setCurrentView("sites")}
              className={
                currentView === "sites"
                  ? "bg-primary hover:bg-primary/90 flex-1 min-w-fit"
                  : "hover:bg-secondary flex-1 min-w-fit"
              }
              size="sm"
            >
              {t("sites")}
            </Button>
            <Button
              variant={currentView === "groups" ? "default" : "ghost"}
              onClick={() => setCurrentView("groups")}
              className={
                currentView === "groups"
                  ? "bg-primary hover:bg-primary/90 flex-1 min-w-fit"
                  : "hover:bg-secondary flex-1 min-w-fit"
              }
              size="sm"
            >
              {t("groups")}
            </Button>
            <Button
              variant={currentView === "settings" ? "default" : "ghost"}
              onClick={() => setCurrentView("settings")}
              className={
                currentView === "settings"
                  ? "bg-primary hover:bg-primary/90 flex-1 min-w-fit"
                  : "hover:bg-secondary flex-1 min-w-fit"
              }
              size="sm"
            >
              {t("systemSettings")}
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <Dashboard
            tickets={tickets}
            language={language}
            onCreateTicket={() => setCurrentView("tickets")}
            onViewTicket={setSelectedTicket}
          />
        )}

        {/* Tickets View */}
        {currentView === "tickets" && (
          <Card className="bg-white">
            <Tabs defaultValue="create" className="w-full">
              <div className="border-b px-6 pt-6">
                <TabsList className="bg-secondary">
                  <TabsTrigger value="create" className="data-[state=active]:bg-white">
                    {t("createTicket")}
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="data-[state=active]:bg-white">
                    {t("templates")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="create" className="p-6 mt-0">
                <CreateTicket
                  templates={templates}
                  users={appUsers}
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

        {/* Sites View */}
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

        {/* Groups View */}
        {currentView === "groups" && (
          <GroupManager
            groups={groups}
            users={appUsers}
            language={language}
            onSaveGroup={handleSaveGroup}
            onSaveUser={handleSaveUser}
            onDeleteGroup={handleDeleteGroup}
            onDeleteUser={handleDeleteUser}
          />
        )}
        {/* Settings View */}
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

      {/* Ticket Detail Sheet */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="w-full md:max-w-3xl overflow-y-auto bg-background p-0">
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              template={templates.find((t) => t.id === selectedTicket.templateId)}
              language={language}
              currentUserId={currentUserId}
              users={appUsers}
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
