import {useCallback, useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {Card} from "./ui/card";
import {Badge} from "./ui/badge";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./ui/tabs";
import {Skeleton} from "./ui/skeleton";
import {Select, SelectContent, SelectItem, SelectTrigger,} from "./ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "./ui/table";
import {Ticket, TicketStatus, TicketType, toAdminStatus, AdminTicketStatus} from "../lib/types";
import {TranslationKey, translations} from "../lib/i18n";
import {useUIStore} from "../store";
import api from "../lib/api";
import {formatDateTime} from "../lib/utils";
import {toast} from "sonner";
import {AlertCircle, Calendar, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Clock, Download, Filter, Plus, Search,} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";

type TimeFilter = "8hours" | "today" | "week" | "month" | "3months" | "all";

const TIME_FILTER_LABELS: Record<TimeFilter, TranslationKey> = {
    "all": "allTime",
    "8hours": "within8Hours",
    "today": "today",
    "week": "thisWeek",
    "month": "thisMonth",
    "3months": "within3Months",
};

function getCreatedAfter(filter: TimeFilter): string | null {
    if (filter === "all") return null;

    const now = new Date();
    let start: Date;

    switch (filter) {
        case "8hours":
            start = new Date(now.getTime() - 8 * 60 * 60 * 1000);
            break;
        case "today":
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case "week":
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case "3months":
            start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            return null;
    }

    const format = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

    return format(start);
}

export function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // 本地状态管理，不使用 dataStore
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        submitted: 0,
        onHold: 0,
        closed: 0,
    });
    const [activeTab, setActiveTab] = useState<TicketType>("corrective");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
    const language = useUIStore((state) => state.language);
    const setSelectedTicket = useUIStore((state) => state.setSelectedTicket);
    const openModal = useUIStore((state) => state.openModal);
    const refreshKey = useUIStore((state) => state.refreshKey);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const t = useCallback((key: TranslationKey) => translations[language][key], [language]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [showExportConfirm, setShowExportConfirm] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [createdAfterDate, setCreatedAfterDate] = useState<string>("");
    const [createdBeforeDate, setCreatedBeforeDate] = useState<string>("");

    useEffect(() => {
        const tab = searchParams.get("type") as TicketType;
        const time = searchParams.get("time") as TimeFilter;
        const status = searchParams.get("status") as TicketStatus | "all";
        const priority = searchParams.get("priority");
        const query = searchParams.get("q");

        if (tab && ["corrective", "preventive", "planned", "problem"].includes(tab)) {
            setActiveTab(tab);
        }
        if (time && ["8hours", "today", "week", "month", "3months", "all"].includes(time)) {
            setTimeFilter(time);
        }
        if (status && ["open", "accepted", "in_progress", "submitted", "on_hold", "closed", "all"].includes(status)) {
            setStatusFilter(status);
        }
        if (priority) {
            setPriorityFilter(priority);
        }
        if (query) {
            setSearchQuery(query);
        }
    }, []);

    const updateSearchParams = useCallback(() => {
        const params: Record<string, string> = {};
        if (activeTab !== "corrective") params.type = activeTab;
        if (timeFilter !== "all") params.time = timeFilter;
        if (statusFilter !== "all") params.status = statusFilter;
        if (priorityFilter !== "all") params.priority = priorityFilter;
        if (searchQuery) params.q = searchQuery;
        setSearchParams(params, {replace: true});
    }, [activeTab, timeFilter, statusFilter, priorityFilter, searchQuery, setSearchParams]);

    // 加载统计数据
    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await api.getTicketStats(activeTab);
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats:", error);
            toast.error(t("failedToLoadStats") || "Failed to load statistics");
        } finally {
            setStatsLoading(false);
        }
    }, [activeTab]);

    // 组件挂载时从 API 加载数据
    // 组件挂载时从 API 加载数据到 dataStore
    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.getTickets({
                page: currentPage,
                size: 20,
                type: activeTab,
                status: statusFilter !== "all" ? statusFilter : undefined,
                priority: priorityFilter !== "all" ? priorityFilter : undefined,
                keyword: searchQuery || undefined,
                createdAfter: createdAfterDate || getCreatedAfter(timeFilter),
                createdBefore: createdBeforeDate || undefined
            });
            setTickets(response.records || []);
            setTotalItems(response.total || 0);
            setTotalPages(Math.ceil((response.total || 0) / 20));
        } catch (error) {
            console.error("Failed to load tickets:", error);
            toast.error(t("failedToLoadTickets") || "Failed to load tickets");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, timeFilter, statusFilter, priorityFilter, searchQuery, currentPage, createdAfterDate, createdBeforeDate, t]);

    // 监听路由变化和刷新触发器，当从其他页面跳转到 dashboard 或数据变更时重新加载数据
    useEffect(() => {
        if (location.pathname === "/dashboard") {
            loadTickets();
            loadStats();
        }
    }, [location.pathname, loadTickets, loadStats, refreshKey]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await api.exportTickets({
                type: activeTab,
                status: statusFilter !== "all" ? statusFilter : undefined,
                priority: priorityFilter !== "all" ? priorityFilter : undefined,
                keyword: searchQuery || undefined,
                createdAfter: createdAfterDate || getCreatedAfter(timeFilter),
                createdBefore: createdBeforeDate || undefined
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tickets_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(t("exportSuccess") || "Export successful");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error(t("exportFailed") || "Export failed");
        } finally {
            setIsExporting(false);
            setShowExportConfirm(false);
        }
    };

    useEffect(() => {
        setCurrentPage(0);
    }, [activeTab, timeFilter, statusFilter, priorityFilter, searchQuery, createdAfterDate, createdBeforeDate]);

    // Filter tickets by time
    const filterByTime = (ticket: Ticket): boolean => {
        if (timeFilter === "all") return true;

        const now = new Date();
        const ticketDate = new Date(ticket.createdAt);
        const diffHours = (now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60);
        const diffDays = diffHours / 24;

        switch (timeFilter) {
            case "8hours":
                return diffHours <= 8;
            case "today":
                return now.toDateString() === ticketDate.toDateString();
            case "week":
                return diffDays <= 7;
            case "month":
                return diffDays <= 30;
            case "3months":
                return diffDays <= 90;
            default:
                return true;
        }
    };

    // Filter and search tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            // Type filter
            if (ticket.type !== activeTab) return false;

            // Time filter
            if (!filterByTime(ticket)) return false;

            // Status filter
            if (statusFilter !== "all" && ticket.status !== statusFilter) return false;

            // Priority filter
            if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    ticket.title.toLowerCase().includes(query) ||
                    ticket.description.toLowerCase().includes(query) ||
                    ticket.id.toLowerCase().includes(query) ||
                    (ticket.assignedToName && ticket.assignedToName.toLowerCase().includes(query))
                );
            }

            return true;
        });
    }, [tickets, activeTab, timeFilter, statusFilter, priorityFilter, searchQuery]);

const getStatusColor = (status: TicketStatus) => {
        const adminStatus = toAdminStatus(status);
        switch (adminStatus) {
            case "open":
                return "bg-blue-500";
            case "in_progress":
                return "bg-orange-500";
            case "submitted":
                return "bg-purple-500";
            case "on_hold":
                return "bg-yellow-500";
            case "closed":
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusBadgeVariant = (status: TicketStatus) => {
        const adminStatus = toAdminStatus(status);
        switch (adminStatus) {
            case "open":
                return "default";
            case "in_progress":
                return "secondary";
            case "submitted":
                return "default";
            case "on_hold":
                return "default";
            case "closed":
                return "outline";
            default:
                return "default";
        }
    };

    const getStatusTranslationKey = (status: TicketStatus): TranslationKey => {
        const adminStatus = toAdminStatus(status);
        const statusMap: Record<AdminTicketStatus, TranslationKey> = {
            "open": "open",
            "in_progress": "inProgress",
            "submitted": "submitted",
            "on_hold": "onHold",
            "closed": "closed",
        };
        return statusMap[adminStatus];
    };

    const getPriorityBadge = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
        switch (priority) {
            case "P1":
            case "urgent":
                return "destructive";
            case "P2":
            case "high":
                return "default";
            case "P3":
            case "medium":
                return "secondary";
            case "P4":
            case "low":
                return "outline";
            default:
                return "default";
        }
    };

    const getPriorityTranslationKey = (priority: string): TranslationKey => {
        if (priority === "P1" || priority === "P2" || priority === "P3" || priority === "P4") {
            return priority as TranslationKey;
        }
        const priorityMap: Record<string, TranslationKey> = {
            "urgent": "urgent",
            "high": "high",
            "medium": "medium",
            "low": "low",
        };
        return priorityMap[priority] || priority as TranslationKey;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-primary">{t("welcomeBack")}</h1>
                    <p className="text-muted-foreground">{t("ticketOverview")}</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowExportConfirm(true)}
                        className="gap-2"
                        disabled={isExporting}
                    >
                        <Download className="h-4 w-4"/>
                        {isExporting ? (t("exporting") || "Exporting...") : (t("export") || "Export")}
                    </Button>
                    <Button onClick={() => navigate("/tickets")} className="gap-2 bg-[#0ea5e9] hover:bg-[#0284c7]">
                        <Plus className="h-4 w-4"/>
                        {t("createTicket")}
                    </Button>
                </div>
            </div>

            <AlertDialog open={showExportConfirm} onOpenChange={setShowExportConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmExport") || "Confirm Export"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirmExportDescription") || "Are you sure you want to export the current filtered tickets to Excel?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExport} disabled={isExporting}>
                            {t("export") || "Export"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Tabs for Ticket Types */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketType)} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                    <TabsTrigger value="corrective">{t("correctiveTickets")}</TabsTrigger>
                    <TabsTrigger value="preventive">{t("preventiveTickets")}</TabsTrigger>
                    <TabsTrigger value="planned">{t("plannedTickets")}</TabsTrigger>
                    <TabsTrigger value="problem">{t("problemTickets")}</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6">
                    {/* Filters - Simplified */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                            {/* Time Filter */}
                            <Select value={timeFilter} onValueChange={(v) => {
                                setTimeFilter(v as TimeFilter);
                                updateSearchParams();
                            }}>
                                <SelectTrigger className="bg-white w-full">
                                    <div className="flex items-center gap-2 truncate">
                                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                                        <span className="truncate">{t(TIME_FILTER_LABELS[timeFilter])}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all">{t("allTime")}</SelectItem>
                                    <SelectItem value="8hours">{t("within8Hours")}</SelectItem>
                                    <SelectItem value="today">{t("today")}</SelectItem>
                                    <SelectItem value="week">{t("thisWeek")}</SelectItem>
                                    <SelectItem value="month">{t("thisMonth")}</SelectItem>
                                    <SelectItem value="3months">{t("within3Months")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(v) => {
                                setStatusFilter(v as TicketStatus | "all");
                                updateSearchParams();
                            }}>
                                <SelectTrigger className="bg-white w-full">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                                        <span className="truncate">
                      {statusFilter === "all" ? t("allStatus") : t(statusFilter as TranslationKey)}
                    </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all">{t("allStatus")}</SelectItem>
                                    <SelectItem value="open">{t("open")}</SelectItem>
                                    <SelectItem value="accepted">{t("accepted")}</SelectItem>
                                    <SelectItem value="in_progress">{t("inProgress")}</SelectItem>
                                    <SelectItem value="submitted">{t("submitted")}</SelectItem>
                                    <SelectItem value="on_hold">{t("onHold")}</SelectItem>
                                    <SelectItem value="closed">{t("closed")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority Filter */}
                            <Select value={priorityFilter} onValueChange={(v) => {
                                setPriorityFilter(v);
                                updateSearchParams();
                            }}>
                                <SelectTrigger className="bg-white w-full">
                                    <div className="flex items-center gap-2 truncate">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                                        <span className="truncate">
                      {priorityFilter === "all" ? t("allPriorities") : t(priorityFilter as TranslationKey)}
                    </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all">{t("allPriorities")}</SelectItem>
                                    <SelectItem value="low">{t("low")}</SelectItem>
                                    <SelectItem value="medium">{t("medium")}</SelectItem>
                                    <SelectItem value="high">{t("high")}</SelectItem>
                                    <SelectItem value="urgent">{t("urgent")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Search */}
                            <div className="relative w-full">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    type="text"
                                    placeholder={t("searchTickets")}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        updateSearchParams();
                                    }}
                                    className="pl-8 bg-white w-full"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(timeFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" || searchQuery || createdAfterDate || createdBeforeDate) && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTimeFilter("all");
                                    setStatusFilter("all");
                                    setPriorityFilter("all");
                                    setSearchQuery("");
                                    setCreatedAfterDate("");
                                    setCreatedBeforeDate("");
                                }}
                                className="shrink-0"
                            >
                                {t("clearFilters")}
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted-foreground">{t("createdAfter") || "Created After"}</label>
                            <Input
                                type="datetime-local"
                                value={createdAfterDate}
                                onChange={(e) => setCreatedAfterDate(e.target.value)}
                                className="bg-white w-full sm:w-auto"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted-foreground">{t("createdBefore") || "Created Before"}</label>
                            <Input
                                type="datetime-local"
                                value={createdBeforeDate}
                                onChange={(e) => setCreatedBeforeDate(e.target.value)}
                                className="bg-white w-full sm:w-auto"
                            />
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {isLoading || statsLoading ? (
                            <>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="p-6 border-l-4 border-l-gray-300">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-20"/>
                                                <Skeleton className="h-8 w-8"/>
                                            </div>
                                            <Skeleton className="h-8 w-8 rounded-full"/>
                                        </div>
                                    </Card>
                                ))}
                            </>
                        ) : (
                            <>
                                <Card className="p-6 border-l-4 border-l-[#0ea5e9]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground">{t("totalTickets")}</p>
                                            <p className="text-primary">{stats.total}</p>
                                        </div>
                                        <ClipboardList className="h-8 w-8 text-[#0ea5e9]"/>
                                    </div>
                                </Card>

                                <Card className="p-6 border-l-4 border-l-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground">{t("open")}</p>
                                            <p className="text-primary">{stats.open}</p>
                                        </div>
                                        <AlertCircle className="h-8 w-8 text-blue-500"/>
                                    </div>
                                </Card>

                                <Card className="p-6 border-l-4 border-l-orange-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground">{t("inProgress")}</p>
                                            <p className="text-primary">{stats.inProgress || 0}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-orange-500"/>
                                    </div>
                                </Card>

                                <Card className="p-6 border-l-4 border-l-purple-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground">{t("submitted")}</p>
                                            <p className="text-primary">{stats.submitted}</p>
                                        </div>
                                        <CheckCircle2 className="h-8 w-8 text-purple-500"/>
                                    </div>
                                </Card>

                                <Card className="p-6 border-l-4 border-l-yellow-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground">{t("onHold")}</p>
                                            <p className="text-primary">{stats.onHold}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-yellow-500"/>
                                    </div>
                                </Card>

                                <Card className="p-6 border-l-4 border-l-green-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground">{t("closed")}</p>
                                            <p className="text-primary">{stats.closed}</p>
                                        </div>
                                        <CheckCircle2 className="h-8 w-8 text-green-500"/>
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>

                    {/* Tickets Table */}
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("ticketId")}</TableHead>
                                        <TableHead>{t("title")}</TableHead>
                                        <TableHead>{t("site")}</TableHead>
                                        <TableHead>{t("status")}</TableHead>
                                        <TableHead>{t("priority")}</TableHead>
                                        <TableHead>{t("assignedToName")}</TableHead>
                                        <TableHead>{t("createdDate")}</TableHead>
                                        <TableHead>{t("dueDate")}</TableHead>
                                        <TableHead>{t("progress")}</TableHead>
                                        <TableHead className="text-right">{t("actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-20"/></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-32"/></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-16"/></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-16"/></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-20"/></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-20"/></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-16"/></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-8 w-12 ml-auto"/></TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    ) : filteredTickets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                {t("noTicketsFound")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTickets.map((ticket) => (
                                            <TableRow
                                                key={ticket.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
                                                    openModal("ticketDetail");
                                                }}
                                            >
                                                <TableCell className="font-medium">
                                                    T{ticket.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{ticket.title}</p>
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {ticket.description}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{ticket.siteName || ticket.siteId || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(ticket.status)}>
                                                        {t(getStatusTranslationKey(ticket.status))}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getPriorityBadge(ticket.priority)}>
                                                        {t(getPriorityTranslationKey(ticket.priority))}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{ticket.assignedToName || "-"}</TableCell>
                                                <TableCell>{formatDateTime(ticket.createdAt)}</TableCell>
                                                <TableCell>
                          <span
                              className={new Date(ticket.dueDate) < new Date() && ticket.status !== "closed" ? "text-red-500 font-medium" : ""}>
                            {formatDateTime(ticket.dueDate)}
                          </span>
                                                </TableCell>
                                                <TableCell>
                                                  {(ticket?.stepValues?.length || 0) > 0 && (
                                                        <div className="flex items-center gap-2 min-w-[100px]">
                                                            <div className="flex-1 bg-muted rounded-full h-2">
                                                                <div
                                                                    className="bg-[#0ea5e9] h-2 rounded-full transition-all"
                                                                    style={{
                                                                      width: `${((ticket?.completedSteps?.length || 0) / (ticket?.stepValues?.length || 1)) * 100}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {ticket.completedSteps.length}
                              </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTicket(ticket);
                                                            openModal("ticketDetail");
                                                        }}
                                                    >
                                                        {t("view")}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {totalItems > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <div className="text-sm text-muted-foreground">
                                    {t("showing") || "Showing"} {currentPage * 20 + 1} - {Math.min((currentPage + 1) * 20, totalItems)} {t("of") || "of"} {totalItems} {t("tickets") || "tickets"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4"/>
                                    </Button>
                                    <span className="text-sm">
                                        {currentPage + 1} / {Math.max(1, totalPages)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(Math.max(0, totalPages - 1), p + 1))}
                                        disabled={currentPage >= Math.max(0, totalPages - 1)}
                                    >
                                        <ChevronRight className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
