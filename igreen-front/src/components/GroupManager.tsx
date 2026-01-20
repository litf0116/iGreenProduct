import { useState, useEffect, useCallback, useRef } from "react";
import { Group, User } from "../lib/types";
import { translations, TranslationKey, Language } from "../lib/i18n";
import { useDataStore, useUIStore } from "../store";
import api from "../lib/api";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Plus, Edit, Trash2, Search, User as UserIcon, Users, Tag, X } from "lucide-react";

export function GroupManager() {
  // 从 store 获取数据和状态
  const groups = useDataStore((state) => state.groups);
  const users = useDataStore((state) => state.users);
  const setGroups = useDataStore((state) => state.setGroups);
  const setUsers = useDataStore((state) => state.setUsers);
  const createGroup = useDataStore((state) => state.createGroup);
  const updateGroup = useDataStore((state) => state.updateGroup);
  const deleteGroup = useDataStore((state) => state.deleteGroup);
  const createUser = useDataStore((state) => state.createUser);
  const updateUser = useDataStore((state) => state.updateUser);
  const deleteUser = useDataStore((state) => state.deleteUser);
  const language = useUIStore((state) => state.language);

  const t = (key: TranslationKey) => translations[language][key];

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const isDataLoaded = useRef(false);

  const loadData = useCallback(async () => {
    if (isDataLoaded.current) return;
    setIsLoading(true);
    try {
      const [groupsRes, usersRes] = await Promise.all([
        api.getGroups().catch(() => []),
        api.getUsers({ page: 0, size: 100 }).catch(() => ({ records: [] })),
      ]);
      // Handle API response that wraps data in { success, data, ... } format
      const groupsData = (groupsRes as any)?.data || (groupsRes as any)?.records || groupsRes || [];
      const usersData = (usersRes as any)?.records || usersRes || [];
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      isDataLoaded.current = true;
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(t("errorOccurred") || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [setGroups, setUsers, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  const [activeTab, setActiveTab] = useState("groups");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"group" | "user" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Group Form State
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupTags, setGroupTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [groupStatus, setGroupStatus] = useState<"active" | "inactive">("active");

  // User Form State
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "engineer" | "manager">("engineer");
  const [userGroup, setUserGroup] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userStatus, setUserStatus] = useState<"active" | "inactive">("active");

  const handleOpenGroupDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
      setGroupDescription(group.description);
      setGroupTags(group.tags || []);
      setGroupStatus(group.status);
    } else {
      setEditingGroup(null);
      setGroupName("");
      setGroupDescription("");
      setGroupTags([]);
      setGroupStatus("active");
    }
    setCurrentTag("");
    setIsGroupDialogOpen(true);
  };

  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserName(user.name);
      setUserUsername(user.username || "");
      setUserRole(user.role);
      setUserGroup(user.groupId || "");
      setUserStatus(user.status || "active");
      setUserPassword(""); // Don't show password
    } else {
      setEditingUser(null);
      setUserName("");
      setUserUsername("");
      setUserRole("engineer");
      setUserGroup("");
      setUserStatus("active");
      setUserPassword("");
    }
    setIsUserDialogOpen(true);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !groupTags.includes(currentTag.trim())) {
      setGroupTags([...groupTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setGroupTags(groupTags.filter((t) => t !== tag));
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return;

    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, {
          name: groupName,
          description: groupDescription,
          tags: groupTags,
          status: groupStatus,
        });
        toast.success(t("groupUpdated") || "Group updated successfully");
      } else {
        await createGroup({
          name: groupName,
          description: groupDescription,
          tags: groupTags,
          status: groupStatus,
        });
        toast.success(t("groupCreated") || "Group created successfully");
      }
      setIsGroupDialogOpen(false);
    } catch (error) {
      toast.error(t("errorOccurred") || "An error occurred");
    }
  };

  const handleSaveUser = async () => {
    if (!userName.trim() || !userUsername.trim() || (!editingUser && !userPassword)) return;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: userName,
          username: userUsername,
          role: userRole,
          groupId: userGroup,
          status: userStatus,
          password: userPassword,
        });
        toast.success(t("userUpdated") || "User updated successfully");
      } else {
        await createUser({
          name: userName,
          username: userUsername,
          role: userRole,
          groupId: userGroup,
          status: userStatus,
          password: userPassword,
        });
        toast.success(t("userCreated") || "User created successfully");
      }
      setIsUserDialogOpen(false);
    } catch (error) {
      toast.error(t("errorOccurred") || "An error occurred");
    }
  };

  const handleDeleteGroupClick = (id: string) => {
    setDeleteType("group");
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUserClick = (id: string) => {
    setDeleteType("user");
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === "group" && deleteId) {
        await deleteGroup(deleteId);
        toast.success(t("groupDeleted") || "Group deleted successfully");
      } else if (deleteType === "user" && deleteId) {
        await deleteUser(deleteId);
        toast.success(t("userDeleted") || "User deleted successfully");
      }
      setDeleteDialogOpen(false);
      setDeleteType(null);
      setDeleteId(null);
    } catch (error) {
      toast.error(t("errorOccurred") || "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("groupManagement")}</h2>
          <p className="text-muted-foreground">{t("manageProfilePreferences")}</p>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(val) => {
          // Backend Integration: Fetch Users or Groups when tab changes
          // API: GET /api/users OR GET /api/groups
          setActiveTab(val);
        }} 
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            {t("groups")}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <UserIcon className="h-4 w-4" />
            {t("users")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("search")} className="pl-8" />
            </div>
            <Button 
              onClick={() => {
                // Backend Integration: Prepare for Group Creation
                handleOpenGroupDialog();
              }} 
              className="bg-[#0ea5e9] hover:bg-[#0284c7]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("createGroup")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </Card>
                ))}
              </>
            ) : (
              <>
                {groups.map((group) => (
                  <Card key={group.id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {group.name}
                          <Badge variant={group.status === "active" ? "default" : "secondary"} className={group.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}>
                            {t(group.status as TranslationKey)}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenGroupDialog(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGroupClick(group.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(group.tags || []).map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-secondary/50">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-4 border-t text-sm text-muted-foreground flex justify-between">
                      <span>{users.filter(u => u.groupId === group.id).length} {t("users")}</span>
                      <span>{users.filter(u => u.groupId === group.id).length} {t("users")}</span>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("search")} className="pl-8" />
            </div>
            <Button 
              onClick={() => {
                // Backend Integration: Prepare for User Creation
                handleOpenUserDialog();
              }} 
              className="bg-[#0ea5e9] hover:bg-[#0284c7]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("createUser")}
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("username")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("groups")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(user.role as TranslationKey)}</Badge>
                    </TableCell>
                    <TableCell>
                      {groups.find(g => g.id === user.groupId)?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className={user.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}>
                        {user.status ? t(user.status as TranslationKey) : t("active")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenUserDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUserClick(user.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
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
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType} and remove data from our servers.
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

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? t("editGroup") : t("createGroup")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("groupName")}</Label>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder={t("enterGroupName")} />
            </div>
            <div className="space-y-2">
              <Label>{t("groupDescription")}</Label>
              <Textarea value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} placeholder={t("enterGroupDescription")} />
            </div>
            <div className="space-y-2">
              <Label>{t("tags")}</Label>
              <div className="flex gap-2">
                <Input 
                  value={currentTag} 
                  onChange={(e) => setCurrentTag(e.target.value)} 
                  placeholder={t("addTag")}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {groupTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <Select value={groupStatus} onValueChange={(v: "active" | "inactive") => setGroupStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSaveGroup}>{t("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? t("editUser") : t("createUser")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("fullName")}</Label>
              <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={t("enterName")} />
            </div>
            <div className="space-y-2">
              <Label>{t("username")}</Label>
              <Input value={userUsername} onChange={(e) => setUserUsername(e.target.value)} placeholder={t("enterUsername")} />
            </div>
            <div className="space-y-2">
              <Label>{t("password")}</Label>
              <Input 
                type="password" 
                value={userPassword} 
                onChange={(e) => setUserPassword(e.target.value)} 
                placeholder={editingUser ? t("changePassword") : t("enterPassword")} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("role")}</Label>
                <Select value={userRole} onValueChange={(v: any) => setUserRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                    <SelectItem value="manager">{t("supervisor")}</SelectItem>
                    <SelectItem value="engineer">{t("maintenanceEngineer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select value={userStatus} onValueChange={(v: "active" | "inactive") => setUserStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("groups")}</Label>
              <Select value={userGroup} onValueChange={setUserGroup}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectGroup")} />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSaveUser}>{t("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
