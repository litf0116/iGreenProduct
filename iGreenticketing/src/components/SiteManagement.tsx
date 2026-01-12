import { useState, useRef, useEffect } from "react";
import { Site, SiteLevel, SiteStatus } from "../lib/types";
import { translations, TranslationKey, Language } from "../lib/i18n";
import { useDataStore, useUIStore } from "../store";
import api from "../lib/api";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  FileDown,
  Building2,
  CheckCircle2,
  XCircle,
  Construction,
  Filter,
  Search,
} from "lucide-react";
import { Textarea } from "./ui/textarea";

export function SiteManagement() {
  // 从 store 获取数据和状态
  const sites = useDataStore((state) => state.sites);
  const setSites = useDataStore((state) => state.setSites);
  const createSite = useDataStore((state) => state.createSite);
  const updateSite = useDataStore((state) => state.updateSite);
  const deleteSite = useDataStore((state) => state.deleteSite);
  const language = useUIStore((state) => state.language);

  const t = (key: TranslationKey) => translations[language][key];

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // 组件挂载时从 API 加载数据
  useEffect(() => {
    const loadSites = async () => {
      setIsLoading(true);
      try {
        const response = await api.getSites({ page: 0, size: 100 });
        setSites(response.records || response || []);
      } catch (error) {
        console.error("Failed to load sites:", error);
        toast.error(t("errorOccurred") || "Failed to load sites");
      } finally {
        setIsLoading(false);
      }
    };
    loadSites();
  }, [setSites, language]);

  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    level: "normal" as SiteLevel,
    status: "online" as SiteStatus,
  });

  const handleOpenDialog = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setFormData({
        name: site.name,
        address: site.address,
        level: site.level,
        status: site.status,
      });
    } else {
      setEditingSite(null);
      setFormData({
        name: "",
        address: "",
        level: "normal",
        status: "online",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) return;

    try {
      if (editingSite) {
        await updateSite(editingSite.id, formData);
        toast.success(t("siteUpdated") || "Site updated successfully");
      } else {
        await createSite(formData);
        toast.success(t("siteCreated") || "Site created successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(t("errorOccurred") || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (deletingSiteId) {
      try {
        await deleteSite(deletingSiteId);
        toast.success(t("siteDeleted") || "Site deleted successfully");
        setShowDeleteDialog(false);
        setDeletingSiteId(null);
      } catch (error) {
        toast.error(t("errorOccurred") || "An error occurred");
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sites, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sites_export_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: "Example Site",
        address: "123 Example Street, City, Country",
        level: "normal",
        status: "online",
      },
    ];
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sites_import_template.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          for (const item of data) {
            await createSite({
              name: item.name || "",
              address: item.address || "",
              level: item.level || "normal",
              status: item.status || "online",
            });
          }
          toast.success(`${data.length} sites imported successfully`);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        toast.error("Invalid file format");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || site.level === filterLevel;
    const matchesStatus = filterStatus === "all" || site.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const stats = {
    total: sites.length,
    vip: sites.filter((s) => s.level === "vip").length,
    online: sites.filter((s) => s.status === "online").length,
    offline: sites.filter((s) => s.status === "offline").length,
  };

  const getStatusIcon = (status: SiteStatus) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-4 w-4" />;
      case "offline":
        return <XCircle className="h-4 w-4" />;
      case "underConstruction":
        return <Construction className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: SiteStatus) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "underConstruction":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelColor = (level: SiteLevel) => {
    return level === "vip" ? "bg-purple-500" : "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-primary">{t("siteManagement")}</h2>
          <p className="text-muted-foreground mt-1">
            Manage charging station sites and locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate} size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            {t("downloadTemplate")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t("importSites")}
          </Button>
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("exportSites")}
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addSite")}
          </Button>
        </div>
      </div>

      {/* Filters - Simplified */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          {/* Level Filter */}
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="bg-white w-full">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {filterLevel === "all" ? "All Levels" : t(filterLevel as TranslationKey)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="normal">{t("normal")}</SelectItem>
              <SelectItem value="vip">{t("vip")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white w-full">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {filterStatus === "all" ? "All Status" : t(filterStatus as TranslationKey)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">{t("online")}</SelectItem>
              <SelectItem value="offline">{t("offline")}</SelectItem>
              <SelectItem value="underConstruction">
                {t("underConstruction")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-full md:col-span-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-white w-full"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filterLevel !== "all" || filterStatus !== "all" || searchTerm) && (
          <Button
            variant="outline"
            onClick={() => {
              setFilterLevel("all");
              setFilterStatus("all");
              setSearchTerm("");
            }}
            className="shrink-0"
          >
            {t("clearFilters")}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 border-l-4 border-l-gray-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4 border-l-4 border-l-[#0ea5e9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">{t("totalSites")}</p>
              <p className="text-primary">{stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-[#0ea5e9]" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">{t("vipSites")}</p>
              <p className="text-primary">{stats.vip}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">{t("onlineSites")}</p>
              <p className="text-primary">{stats.online}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">{t("offlineSites")}</p>
              <p className="text-primary">{stats.offline}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
          </>
        )}
      </div>

      {/* Sites Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t("siteName")}</TableHead>
                <TableHead>{t("address")}</TableHead>
                <TableHead>{t("level")}</TableHead>
                <TableHead>{t("status")}</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filteredSites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No sites found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.id}</TableCell>
                    <TableCell>{site.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{site.address}</TableCell>
                    <TableCell>
                      <Badge className={getLevelColor(site.level)}>
                        {t(site.level as TranslationKey)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(site.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(site.status)}
                          {t(site.status as TranslationKey)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(site)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingSiteId(site.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingSite ? t("editSite") : t("addSite")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("siteName")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter site name"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("address")} *</Label>
              <Textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter full address"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("level")}</Label>
                <Select
                  value={formData.level}
                  onValueChange={(v) =>
                    setFormData({ ...formData, level: v as SiteLevel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="normal">{t("normal")}</SelectItem>
                    <SelectItem value="vip">{t("vip")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as SiteStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="online">{t("online")}</SelectItem>
                    <SelectItem value="offline">{t("offline")}</SelectItem>
                    <SelectItem value="underConstruction">
                      {t("underConstruction")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.address}
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteSite")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
