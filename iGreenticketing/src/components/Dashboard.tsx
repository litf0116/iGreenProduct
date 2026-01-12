import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Ticket, TicketStatus, TicketType } from "../lib/types";
import { translations, TranslationKey, Language } from "../lib/i18n";
import { useDataStore, useUIStore } from "../store";
import api from "../lib/api";
import { toast } from "sonner";
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Calendar,
  Filter,
} from "lucide-react";

type TimeFilter = "8hours" | "today" | "week" | "month" | "3months" | "all";

export function Dashboard() {
  const navigate = useNavigate();

  // 从 store 获取数据和状态
  const tickets = useDataStore((state) => state.tickets);
  const setTickets = useDataStore((state) => state.setTickets);
  const language = useUIStore((state) => state.language);
  const setSelectedTicket = useUIStore((state) => state.setSelectedTicket);
  const openModal = useUIStore((state) => state.openModal);

  const t = (key: TranslationKey) => translations[language][key];

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    submitted: 0,
    completed: 0,
    onHold: 0,
  });

  // 加载统计数据
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await api.getTicketStats(activeTab);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [activeTab]);

  // 组件挂载时从 API 加载数据
  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getTickets({ 
        page: 0, 
        size: 100,
        type: activeTab 
      });
      setTickets(response.records || response || []);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      toast.error(t("errorOccurred") || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }, [setTickets, t, activeTab]);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  const [activeTab, setActiveTab] = useState<TicketType>("CORRECTIVE");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

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

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "ASSIGNED":
      case "ACCEPTED":
      case "IN_PROGRESS":
        return "secondary";
      case "SUBMITTED":
        return "default";
      case "COMPLETED":
        return "outline";
      case "ON_HOLD":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === "th" ? "th-TH" : language === "pt" ? "pt-BR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary">{t("welcomeBack")}</h1>
          <p className="text-muted-foreground">{t("ticketOverview")}</p>
        </div>
        <Button onClick={() => navigate("/tickets")} className="gap-2 bg-[#0ea5e9] hover:bg-[#0284c7]">
          <Plus className="h-4 w-4" />
          {t("createTicket")}
        </Button>
      </div>

      {/* Tabs for Ticket Types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketType)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="CORRECTIVE">{t("correctiveTickets")}</TabsTrigger>
          <TabsTrigger value="PREVENTIVE">{t("preventiveTickets")}</TabsTrigger>
          <TabsTrigger value="PLANNED">{t("plannedTickets")}</TabsTrigger>
          <TabsTrigger value="PROBLEM">{t("problemTickets")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters - Simplified */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              {/* Time Filter */}
              <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                <SelectTrigger className="bg-white w-full">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{timeFilter === "all" ? t("allTime") : t("timeRange")}</span>
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
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}>
                <SelectTrigger className="bg-white w-full">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                      {statusFilter === "all" ? t("allStatus") : t(statusFilter as TranslationKey)}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">{t("allStatus")}</SelectItem>
                  <SelectItem value="OPEN">{t("open")}</SelectItem>
                  <SelectItem value="ASSIGNED">{t("assigned")}</SelectItem>
                  <SelectItem value="ACCEPTED">{t("accepted")}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t("inProgress")}</SelectItem>
                  <SelectItem value="SUBMITTED">{t("submitted")}</SelectItem>
                  <SelectItem value="ON_HOLD">{t("onHold")}</SelectItem>
                  <SelectItem value="COMPLETED">{t("closed")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-white w-full">
                  <div className="flex items-center gap-2 truncate">
                    <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("searchTickets")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-white w-full"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(timeFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" || searchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setTimeFilter("all");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setSearchQuery("");
                }}
                className="shrink-0"
              >
                {t("clearFilters")}
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoading || statsLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6 border-l-4 border-l-gray-300">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
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
                <ClipboardList className="h-8 w-8 text-[#0ea5e9]" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{t("open")}</p>
                  <p className="text-primary">{stats.open}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{t("inProgress")}</p>
                  <p className="text-primary">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{t("submitted")}</p>
                  <p className="text-primary">{stats.submitted}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{t("onHold")}</p>
                  <p className="text-primary">{stats.onHold}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{t("closed")}</p>
                  <p className="text-primary">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
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
                    <TableHead>{t("assignedTo")}</TableHead>
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
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-12 ml-auto" /></TableCell>
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
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {ticket.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.site}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(ticket.status)}>
                            {t(ticket.status as TranslationKey)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadge(ticket.priority)}>
                            {t(ticket.priority as TranslationKey)}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.assignedToName}</TableCell>
                        <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell>
                          <span className={new Date(ticket.dueDate) < new Date() && ticket.status !== "closed" ? "text-red-500 font-medium" : ""}>
                            {formatDate(ticket.dueDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {ticket.completedSteps.length > 0 && (
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-[#0ea5e9] h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(ticket.completedSteps.length / (ticket.completedSteps.length + 1)) * 100}%`,
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
