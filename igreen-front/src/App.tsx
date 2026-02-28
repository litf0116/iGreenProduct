import {useState, useEffect, useCallback} from "react";
import {Routes, Route, Navigate, useNavigate, useLocation} from "react-router-dom";
import {Language} from "./lib/i18n";
import {translations, TranslationKey} from "./lib/i18n";
import api from "./lib/api";
import {
    Ticket,
    Template,
    Priority,
    Site,
    Group,
    User as UserType,
    SLAConfig,
    ProblemType,
    SiteLevelConfig,
    TicketStatus,
    TicketType,
} from "./lib/types";
import {LanguageSelector} from "./components/LanguageSelector";
import {Dashboard} from "./components/Dashboard";
import {CreateTicket} from "./components/CreateTicket";
import {TemplateManager} from "./components/TemplateManager";
import {TicketDetail} from "./components/TicketDetail";
import {SiteManagement} from "./components/SiteManagement";
import {GroupManager} from "./components/GroupManager";
import {SystemSettings} from "./components/SystemSettings";
import {Login} from "./components/Login";
import {SignUp} from "./components/SignUp";
import {ProtectedRoute} from "./components/ProtectedRoute";
import {AuthProvider, useAuth} from "./hooks/useAuth.tsx";
import {Button} from "./components/ui/button";
import {Card} from "./components/ui/card";
import {Avatar, AvatarFallback} from "./components/ui/avatar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./components/ui/tabs";
import {LogOut} from "lucide-react";
import {Sheet, SheetContent} from "./components/ui/sheet";
import appLogo from "figma:asset/e2d3be716f2b03621853146ef3c8dd02abba30cb.png";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {toast} from "sonner";
import {Toaster} from "./components/ui/sonner";
import {useUIStore, useDataStore} from "./store";

// Layout component with navigation
function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const {currentUser, logout} = useAuth();
    const language = useUIStore((state) => state.language);
    const setLanguage = useUIStore((state) => state.setLanguage);
    const selectedTicket = useUIStore((state) => state.selectedTicket);
    const setSelectedTicket = useUIStore((state) => state.setSelectedTicket);

    // Use data store for tickets and other data
    const tickets = useDataStore((state) => state.tickets);
    const setTickets = useDataStore((state) => state.setTickets);
    const templates = useDataStore((state) => state.templates);
    const setTemplates = useDataStore((state) => state.setTemplates);
    const sites = useDataStore((state) => state.sites);
    const setSites = useDataStore((state) => state.setSites);
    const groups = useDataStore((state) => state.groups);
    const setGroups = useDataStore((state) => state.setGroups);
    const users = useDataStore((state) => state.users);
    const setUsers = useDataStore((state) => state.setUsers);

    const slaConfigs = useDataStore((state) => state.slaConfigs);
    const setSLAConfigs = useDataStore((state) => state.setSLAConfigs);
    const problemTypes = useDataStore((state) => state.problemTypes);
    const setProblemTypes = useDataStore((state) => state.setProblemTypes);
    const siteLevelConfigs = useDataStore((state) => state.siteLevelConfigs);
    const setSiteLevelConfigs = useDataStore((state) => state.setSiteLevelConfigs);

    const t = (key: TranslationKey) => translations[language][key];

    const loadInitialData = useCallback(async () => {
        try {
            const [ticketsRes, templatesRes, sitesRes, groupsRes, usersRes] = await Promise.all([
                api.getTickets({page: 0, size: 100}).catch(() => ({records: []})),
                api.getTemplates().catch(() => []),
                api.getSites({page: 0, size: 100}).catch(() => ({records: []})),
                api.getGroups().catch(() => []),
                api.getUsers({page: 0, size: 100}).catch(() => ({records: []})),
            ]);

            setTickets(Array.isArray(ticketsRes?.records) ? ticketsRes.records : []);
            setTemplates(templatesRes || []);
            setSites(sitesRes.records || sitesRes || []);
            setGroups(groupsRes || []);
            setUsers(usersRes.records || usersRes || []);
        } catch (error) {
            console.error("Failed to load initial data:", error);
            toast.error("Failed to load data");
        }
    }, []);

    const loadConfigData = useCallback(async () => {
        try {
            const [sla, problems, levels] = await Promise.all([
                api.getSLAConfigs().catch(() => []),
                api.getProblemTypes().catch(() => []),
                api.getSiteLevelConfigs().catch(() => []),
            ]);

            setSLAConfigs(sla || []);
            setProblemTypes(problems || []);
            setSiteLevelConfigs(levels || []);
        } catch (error) {
            console.error("Failed to load config data:", error);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadInitialData();
            loadConfigData();
        }
    }, [currentUser, loadInitialData, loadConfigData]);

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case "open":
                return "bg-blue-500";
            case "assigned":
                return "bg-indigo-500";
            case "accepted":
                return "bg-cyan-500";
            case "in_progress":
                return "bg-orange-500";
            case "submitted":
                return "bg-purple-500";
            case "completed":
                return "bg-green-500";
            case "on_hold":
                return "bg-yellow-500";
            case "cancelled":
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
        total: Array.isArray(tickets) ? tickets.length : 0,
        pending: Array.isArray(tickets) ? tickets.filter((t) => t.status === "open").length : 0,
        inProgress: Array.isArray(tickets) ? tickets.filter((t) => t.status === "in_progress" || t.status === "accepted").length : 0,
        completed: Array.isArray(tickets) ? tickets.filter((t) => t.status === "completed").length : 0,
    };

    const handleLogout = () => {
        logout();
        setTickets([]);
        setTemplates([]);
        setSites([]);
        setGroups([]);
        setUsers([]);
        setSelectedTicket(null);
    };

    const handleAddSite = async (siteData: Partial<Site>) => {
        try {
            const newSite = await api.createSite(siteData);
            setSites((prev) => [...(prev.records || prev), newSite]);
            toast.success(t("siteCreated"));
        } catch (error: any) {
            toast.error(error.message || "Failed to create site");
        }
    };

    const handleUpdateSite = async (id: string, siteData: Partial<Site>) => {
        try {
            const updatedSite = await api.updateSite(id, siteData);
            setSites((prev) => prev.map((s) => (s.id === id ? updatedSite : s)));
            toast.success(t("siteUpdated"));
        } catch (error: any) {
            toast.error(error.message || "Failed to update site");
        }
    };

    const handleDeleteSite = async (id: string) => {
        try {
            await api.deleteSite(id);
            setSites((prev) => prev.filter((s) => s.id !== id));
            toast.success(t("siteDeleted"));
        } catch (error: any) {
            toast.error(error.message || "Failed to delete site");
        }
    };

    const handleSaveGroup = async (groupData: Partial<Group>) => {
        try {
            if (groupData.id) {
                const updated = await api.updateGroup(groupData.id, groupData);
                setGroups((prev) => prev.map((g) => (g.id === groupData.id ? updated : g)));
                toast.success(t("groupUpdated"));
            } else {
                const created = await api.createGroup(groupData);
                setGroups((prev) => [...prev, created]);
                toast.success(t("groupCreated"));
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save group");
        }
    };

    const handleDeleteGroup = async (id: string) => {
        try {
            await api.deleteGroup(id);
            setGroups((prev) => prev.filter((g) => g.id !== id));
            toast.success("Group deleted");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete group");
        }
    };

    const handleSaveUser = async (userData: Partial<UserType> & { password?: string }) => {
        try {
            if (userData.id) {
                const updated = await api.updateUser(userData.id, userData);
                setUsers((prev) => prev.map((u) => (u.id === userData.id ? updated : u)));
                toast.success(t("userUpdated"));
            } else {
                const created = await api.createUser(userData);
                setUsers((prev) => [...prev, created]);
                toast.success(t("userCreated"));
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save user");
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await api.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
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
                console.error("Failed to import site:", site.name);
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
                relatedTicketIds: ticketData.relatedTicketIds,
            });

            // 乐观更新：立即添加到本地状态
            setTickets((prev) => {
                const currentTickets = Array.isArray(prev) ? prev : [];
                return [created, ...currentTickets];
            });

            toast.success(t("ticketCreated"));
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to create ticket");
        }
    };

    const handleSaveTemplate = async (templateData: Partial<Template>) => {
        try {
            if (templateData.id) {
                const updated = await api.updateTemplate(templateData.id, templateData);
                setTemplates((prev) => prev.map((t) => (t.id === templateData.id ? updated : t)));
                toast.success("Template updated");
            } else {
                const created = await api.createTemplate(templateData);
                setTemplates((prev) => [...prev, created]);
                toast.success("Template created");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save template");
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        try {
            await api.deleteTemplate(id);
            setTemplates((prev) => prev.filter((t) => t.id !== id));
            toast.success("Template deleted");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete template");
        }
    };

    const handleAcceptTicket = async (ticketId: string, comment?: string) => {
        try {
            const updated = await api.acceptTicket(ticketId, comment);
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.success("Ticket accepted");
        } catch (error: any) {
            toast.error(error.message || "Failed to accept ticket");
        }
    };

    const handleDeclineTicket = async (ticketId: string, reason: string) => {
        try {
            const updated = await api.declineTicket(ticketId, reason);
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.success("Ticket declined");
        } catch (error: any) {
            toast.error(error.message || "Failed to decline ticket");
        }
    };

    const handleHoldTicket = async (ticketId: string, reason: string) => {
        try {
            const updated = await api.updateTicket(ticketId, {status: "ON_HOLD" as TicketStatus});
            await api.addComment(ticketId, reason, "GENERAL");
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.info("Ticket put on hold");
        } catch (error: any) {
            toast.error(error.message || "Failed to hold ticket");
        }
    };

    const handleResumeTicket = async (ticketId: string) => {
        try {
            const updated = await api.updateTicket(ticketId, {status: "IN_PROGRESS" as TicketStatus});
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
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
                status: "assigned" as TicketStatus,
            });
            await api.addComment(ticketId, `Ticket reassigned to ${newAssigneeName}`, "GENERAL");
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.success(`Ticket reassigned to ${newAssigneeName}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to reassign ticket");
        }
    };

    const handleDeparture = async (ticketId: string, photo?: string) => {
        try {
            const updated = await api.departTicket(ticketId, photo);
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.success("Departure marked successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to mark departure");
        }
    };

    const handleArrival = async (ticketId: string, photo?: string) => {
        try {
            const updated = await api.arriveTicket(ticketId, photo);
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.success("Arrival marked successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to mark arrival");
        }
    };

    const handleCompleteTicket = async (ticketId: string, photo: string, cause: string, solution: string) => {
        try {
            const updated = await api.completeTicket(ticketId, photo);
            await api.updateTicket(ticketId, {cause, solution});
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.success("Ticket submitted for confirmation");
        } catch (error: any) {
            toast.error(error.message || "Failed to complete ticket");
        }
    };

    const handleConfirmCompletion = async (ticketId: string) => {
        try {
            const updated = await api.reviewTicket(ticketId);
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.success("Ticket confirmed and closed");
        } catch (error: any) {
            toast.error(error.message || "Failed to confirm completion");
        }
    };

    const handleRejectCompletion = async (ticketId: string, reason: string) => {
        try {
            const updated = await api.updateTicket(ticketId, {status: "IN_PROGRESS" as TicketStatus});
            await api.addComment(ticketId, `Completion rejected: ${reason}`, "COMMENT");
            setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
            setSelectedTicket(null);
            toast.info("Ticket returned to In Progress");
        } catch (error: any) {
            toast.error(error.message || "Failed to reject completion");
        }
    };

    const handleUpdateSLA = async (config: SLAConfig) => {
        try {
            const updated = await api.saveSLAConfig(config);
            setSLAConfigs((prev) => {
                const existing = prev.findIndex((c) => c.priority === config.priority);
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
            setProblemTypes((prev) => [...prev, created]);
            toast.success("Problem type added");
        } catch (error: any) {
            toast.error(error.message || "Failed to add problem type");
        }
    };

    const handleUpdateProblemType = async (type: ProblemType) => {
        try {
            const updated = await api.updateProblemType(type.id, type);
            setProblemTypes((prev) => prev.map((t) => (t.id === type.id ? updated : t)));
            toast.success("Problem type updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to update problem type");
        }
    };

    const handleDeleteProblemType = async (id: string) => {
        try {
            await api.deleteProblemType(id);
            setProblemTypes((prev) => prev.filter((t) => t.id !== id));
            toast.success("Problem type deleted");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete problem type");
        }
    };

    const handleAddSiteLevel = async (level: SiteLevelConfig) => {
        try {
            const created = await api.createSiteLevelConfig(level);
            setSiteLevelConfigs((prev) => [...prev, created]);
            toast.success("Site level added");
        } catch (error: any) {
            toast.error(error.message || "Failed to add site level");
        }
    };

    const handleUpdateSiteLevel = async (level: SiteLevelConfig) => {
        try {
            const updated = await api.updateSiteLevelConfig(level.id, level);
            setSiteLevelConfigs((prev) => prev.map((l) => (l.id === level.id ? updated : l)));
            toast.success("Site level updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to update site level");
        }
    };

    const handleDeleteSiteLevel = async (id: string) => {
        try {
            await api.deleteSiteLevelConfig(id);
            setSiteLevelConfigs((prev) => prev.filter((l) => l.id !== id));
            toast.success("Site level deleted");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete site level");
        }
    };

    const handleUpdateProfile = async (name: string, username: string) => {
        if (!currentUser) return;
        try {
            const updated = await api.updateUser(currentUser.id, {name, username});
            // Note: currentUser is from context, so we don't update it here
            toast.success("Profile updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        }
    };

    // Navigation helper
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
                <div className="container mx-auto px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <img src={appLogo} alt="iGreen+ Logo" className="w-10 h-10 object-contain"/>
                                <span className="text-xl font-bold text-[rgb(0,0,0)] hidden lg:block">iGreen+ Ticket Management</span>
                            </div>

                            <nav className="hidden md:flex items-center gap-1">
                                <Button
                                    variant={isActive("/dashboard") ? "default" : "ghost"}
                                    onClick={() => navigate("/dashboard")}
                                    className={isActive("/dashboard") ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                                >
                                    {t("dashboard")}
                                </Button>
                                <Button
                                    variant={isActive("/tickets") ? "default" : "ghost"}
                                    onClick={() => navigate("/tickets")}
                                    className={isActive("/tickets") ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                                >
                                    {t("tickets")}
                                </Button>
                                <Button
                                    variant={isActive("/sites") ? "default" : "ghost"}
                                    onClick={() => navigate("/sites")}
                                    className={isActive("/sites") ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                                >
                                    {t("sites")}
                                </Button>
                                <Button
                                    variant={isActive("/groups") ? "default" : "ghost"}
                                    onClick={() => navigate("/groups")}
                                    className={isActive("/groups") ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                                >
                                    {t("groups")}
                                </Button>
                                <Button
                                    variant={isActive("/settings") ? "default" : "ghost"}
                                    onClick={() => navigate("/settings")}
                                    className={isActive("/settings") ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"}
                                >
                                    {t("systemSettings")}
                                </Button>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage}/>

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
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLogout();
                                        }}
                                        className="cursor-pointer text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4"/>
                                        {t("logOut")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <nav className="md:hidden flex items-center gap-2 mt-3 overflow-x-auto pb-2">
                        {["/dashboard", "/tickets", "/sites", "/groups", "/settings"].map((path) => (
                            <Button
                                key={path}
                                variant={isActive(path) ? "default" : "ghost"}
                                onClick={() => navigate(path)}
                                className={isActive(path) ? "bg-primary hover:bg-primary/90 flex-1 min-w-fit" : "hover:bg-secondary flex-1 min-w-fit"}
                                size="sm"
                            >
                                {t(path.replace("/", "") as TranslationKey)}
                            </Button>
                        ))}
                    </nav>
                </div>
            </header>

            <div className="container mx-auto px-4 md:px-6 py-6">
                <Routes>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route
                        path="/tickets"
                        element={
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
                                            users={users}
                                            groups={groups}
                                            sites={sites.map((s) => ({id: s.id, name: s.name}))}
                                            tickets={tickets}
                                            language={language}
                                            onSubmit={handleCreateTicket}
                                            onCancel={() => navigate("/dashboard")}
                                        />
                                    </TabsContent>

                                    <TabsContent value="templates" className="p-6 mt-0">
                                        <TemplateManager
                                            language={language}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </Card>
                        }
                    />
                    <Route path="/sites" element={<SiteManagement/>}/>
                    <Route path="/groups" element={<GroupManager/>}/>
                    <Route path="/settings" element={<SystemSettings/>}/>
                </Routes>
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
                            groups={groups}
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

            <Toaster/>
        </div>
    );
}

// Authentication pages
function LoginPage() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState<Language>("en");
    const {login} = useAuth();

    const t = (key: TranslationKey) => translations[language][key];

    const handleLogin = async (username: string, password: string, country: string) => {
        try {
            await login(username, password, country);
            navigate("/dashboard", {replace: true});
        } catch (error: any) {
            throw new Error(error.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed top-4 right-4 z-50">
                <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage}/>
            </div>
            <Login language={language} onLogin={handleLogin} onSwitchToSignUp={() => navigate("/signup")}/>
        </div>
    );
}

function SignUpPage() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState<Language>("en");
    const {signUp} = useAuth();

    const t = (key: TranslationKey) => translations[language][key];

    const handleSignUp = async (
        name: string,
        username: string,
        password: string,
        confirmPassword: string,
        role: string,
        country: string
    ) => {
        try {
            await signUp(name, username, password, confirmPassword, role, country);
            navigate("/dashboard", {replace: true});
        } catch (error: any) {
            throw new Error(error.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed top-4 right-4 z-50">
                <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage}/>
            </div>
            <SignUp language={language} onSignUp={handleSignUp} onSwitchToLogin={() => navigate("/login")}/>
        </div>
    );
}

// Main App component with routing
function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignUpPage/>}/>

            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AppLayout/>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

// Root App component with AuthProvider
export default function App() {
    return (
        <AuthProvider>
            <AppContent/>
        </AuthProvider>
    );
}
