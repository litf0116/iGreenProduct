import { useState, useEffect } from "react";
import { SLAConfig, ProblemType, SiteLevelConfig, Priority } from "../lib/types";
import { translations, TranslationKey, Language } from "../lib/i18n";
import { useDataStore, useUIStore } from "../store";
import api from "../lib/api";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
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
import { Edit, Plus, Trash2, Settings, Clock, AlertTriangle, MapPin } from "lucide-react";

export function SystemSettings() {
  // 从 store 获取数据和状态
  const slaConfigs = useDataStore((state) => state.slaConfigs);
  const problemTypes = useDataStore((state) => state.problemTypes);
  const siteLevelConfigs = useDataStore((state) => state.siteLevelConfigs);
  const setSLAConfigs = useDataStore((state) => state.setSLAConfigs);
  const setProblemTypes = useDataStore((state) => state.setProblemTypes);
  const setSiteLevelConfigs = useDataStore((state) => state.setSiteLevelConfigs);
  const updateSLAConfig = useDataStore((state) => state.updateSLAConfig);
  const createProblemType = useDataStore((state) => state.createProblemType);
  const updateProblemType = useDataStore((state) => state.updateProblemType);
  const deleteProblemType = useDataStore((state) => state.deleteProblemType);
  const createSiteLevelConfig = useDataStore((state) => state.createSiteLevelConfig);
  const updateSiteLevelConfig = useDataStore((state) => state.updateSiteLevelConfig);
  const deleteSiteLevelConfig = useDataStore((state) => state.deleteSiteLevelConfig);
  const language = useUIStore((state) => state.language);

  const t = (key: TranslationKey) => translations[language][key];

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // 组件挂载时从 API 加载数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [slaRes, problemsRes, levelsRes] = await Promise.all([
          api.getSLAConfigs().catch(() => []),
          api.getProblemTypes().catch(() => []),
          api.getSiteLevelConfigs().catch(() => []),
        ]);
        setSLAConfigs(slaRes || []);
        setProblemTypes(problemsRes || []);
        setSiteLevelConfigs(levelsRes || []);
      } catch (error) {
        console.error("Failed to load config data:", error);
        toast.error(t("errorOccurred") || "Failed to load configuration");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setSLAConfigs, setProblemTypes, setSiteLevelConfigs, language]);
  const [activeTab, setActiveTab] = useState("sla");

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"problem" | "level" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Dialog States
  const [showProblemDialog, setShowProblemDialog] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemType | null>(null);
  const [problemForm, setProblemForm] = useState({ name: "", description: "" });

  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<SiteLevelConfig | null>(null);
  const [levelForm, setLevelForm] = useState({ levelName: "", description: "", maxConcurrentTickets: 5, escalationTimeHours: 4 });

  const [editingSLA, setEditingSLA] = useState<SLAConfig | null>(null);
  const [showSLADialog, setShowSLADialog] = useState(false);
  const [slaForm, setSLAForm] = useState({ responseTimeMinutes: 60, completionTimeHours: 4 });

  // Handlers
  const handleOpenProblemDialog = (type?: ProblemType) => {
    if (type) {
      setEditingProblem(type);
      setProblemForm({ name: type.name, description: type.description });
    } else {
      setEditingProblem(null);
      setProblemForm({ name: "", description: "" });
    }
    setShowProblemDialog(true);
  };

  const handleSaveProblem = async () => {
    if (!problemForm.name) return;

    try {
      if (editingProblem) {
        await updateProblemType({ ...editingProblem, ...problemForm });
        toast.success("Problem type updated successfully");
      } else {
        await createProblemType({ id: `PT${Date.now()}`, ...problemForm });
        toast.success("Problem type created successfully");
      }
      setShowProblemDialog(false);
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleOpenLevelDialog = (level?: SiteLevelConfig) => {
    if (level) {
      setEditingLevel(level);
      setLevelForm({ levelName: level.levelName, description: level.description, maxConcurrentTickets: level.maxConcurrentTickets, escalationTimeHours: level.escalationTimeHours });
    } else {
      setEditingLevel(null);
      setLevelForm({ levelName: "", description: "", maxConcurrentTickets: 5, escalationTimeHours: 4 });
    }
    setShowLevelDialog(true);
  };

  const handleSaveLevel = async () => {
    if (!levelForm.levelName) return;

    try {
      if (editingLevel) {
        await updateSiteLevelConfig({ ...editingLevel, ...levelForm });
        toast.success("Site level updated successfully");
      } else {
        await createSiteLevelConfig({ id: `SL${Date.now()}`, ...levelForm });
        toast.success("Site level created successfully");
      }
      setShowLevelDialog(false);
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleOpenSLADialog = (config: SLAConfig) => {
    setEditingSLA(config);
    setSLAForm({ responseTimeMinutes: config.responseTimeMinutes, completionTimeHours: config.completionTimeHours });
    setShowSLADialog(true);
  };

  const handleSaveSLA = async () => {
    if (editingSLA) {
      try {
        await updateSLAConfig({ ...editingSLA, ...slaForm });
        toast.success("SLA updated successfully");
        setShowSLADialog(false);
      } catch (error) {
        toast.error("An error occurred");
      }
    }
  };

  const handleDeleteProblemClick = (id: string) => {
    setDeleteType("problem");
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteLevelClick = (id: string) => {
    setDeleteType("level");
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === "problem" && deleteId) {
        await deleteProblemType(deleteId);
        toast.success("Problem type deleted successfully");
      } else if (deleteType === "level" && deleteId) {
        await deleteSiteLevelConfig(deleteId);
        toast.success("Site level deleted successfully");
      }
      setDeleteDialogOpen(false);
      setDeleteType(null);
      setDeleteId(null);
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-primary text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            {t("systemSettings")}
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure system parameters, SLAs, and classifications
          </p>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(val) => {
          // Backend Integration: Fetch data for the selected tab (SLA, Problem Types, or Levels)
          // API: GET /api/system-settings/:tab
          setActiveTab(val);
        }} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sla" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            SLA Configuration
          </TabsTrigger>
          <TabsTrigger value="problems" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Problem Types
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Site Levels
          </TabsTrigger>
        </TabsList>

        {/* SLA Content */}
        <TabsContent value="sla" className="mt-6">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Priority-based SLA</h3>
              <p className="text-sm text-muted-foreground">
                Define expected response and resolution times for each priority level.
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Response Time (Hours)</TableHead>
                  <TableHead>Resolution Time (Hours)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {slaConfigs.map((config) => (
                      <TableRow key={config.priority}>
                        <TableCell className="font-medium">
                          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            config.priority === "P1" || config.priority === "P2" ? "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80" :
                            config.priority === "P3" ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" :
                            "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}>
                            {config.priority}
                          </div>
                        </TableCell>
                        <TableCell>{config.responseTimeMinutes}m</TableCell>
                        <TableCell>{config.completionTimeHours}h</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenSLADialog(config)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Problem Types Content */}
        <TabsContent value="problems" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Problem Management Types</h3>
                <p className="text-sm text-muted-foreground">
                  Classify different types of problems for reporting and filtering.
                </p>
              </div>
              <Button onClick={() => handleOpenProblemDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {problemTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenProblemDialog(type)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProblemClick(type.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {problemTypes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No problem types defined.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Site Levels Content */}
        <TabsContent value="levels" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Site Level Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Define site importance levels and their impact on SLAs.
                </p>
              </div>
              <Button onClick={() => handleOpenLevelDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>SLA Multiplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {siteLevelConfigs.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell className="font-medium">{level.levelName}</TableCell>
                        <TableCell>{level.description}</TableCell>
                        <TableCell>x{level.maxConcurrentTickets}</TableCell>
                        <TableCell>{level.escalationTimeHours}h</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenLevelDialog(level)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLevelClick(level.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType === "problem" ? "problem type" : "site level"} and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs */}
      
      {/* SLA Edit Dialog */}
      <Dialog open={showSLADialog} onOpenChange={setShowSLADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit SLA for {editingSLA?.priority}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Response Time (Minutes)</Label>
              <Input 
                type="number" 
                min="0"
                value={slaForm.responseTimeMinutes} 
                onChange={(e) => setSLAForm({...slaForm, responseTimeMinutes: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Completion Time (Hours)</Label>
              <Input 
                type="number" 
                min="0"
                value={slaForm.completionTimeHours} 
                onChange={(e) => setSLAForm({...slaForm, completionTimeHours: Number(e.target.value)})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSLADialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSLA}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Problem Type Dialog */}
      <Dialog open={showProblemDialog} onOpenChange={setShowProblemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProblem ? "Edit Problem Type" : "Add Problem Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={problemForm.name} 
                onChange={(e) => setProblemForm({...problemForm, name: e.target.value})} 
                placeholder="e.g., Hardware Failure"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                value={problemForm.description} 
                onChange={(e) => setProblemForm({...problemForm, description: e.target.value})} 
                placeholder="Description of this problem type"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProblemDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProblem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Site Level Dialog */}
      <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLevel ? "Edit Site Level" : "Add Site Level"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={levelForm.levelName} 
                onChange={(e) => setLevelForm({...levelForm, levelName: e.target.value})} 
                placeholder="e.g., VIP"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                value={levelForm.description} 
                onChange={(e) => setLevelForm({...levelForm, description: e.target.value})} 
                placeholder="Description of this level"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Concurrent Tickets</Label>
              <Input 
                type="number"
                min="1"
                value={levelForm.maxConcurrentTickets} 
                onChange={(e) => setLevelForm({...levelForm, maxConcurrentTickets: Number(e.target.value)})} 
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label>Escalation Time (Hours)</Label>
              <Input 
                type="number"
                min="1"
                value={levelForm.escalationTimeHours} 
                onChange={(e) => setLevelForm({...levelForm, escalationTimeHours: Number(e.target.value)})} 
                placeholder="4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLevelDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLevel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
