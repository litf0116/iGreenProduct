import {useState, useEffect} from "react";
import {Template, User, Priority, TicketType, Group, Ticket} from "../lib/types";
import {translations, TranslationKey, Language} from "../lib/i18n";
import {api} from "../lib/api";
import {Card} from "./ui/card";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Textarea} from "./ui/textarea";
import {Label} from "./ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Calendar} from "./ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover";
import {CalendarIcon, Check, Loader2} from "lucide-react";
import {format} from "date-fns";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";
import {cn} from "../lib/utils";
import {toast} from "sonner";
import {useNavigate} from "react-router-dom";

interface CreateTicketProps {
    templates?: Template[];
    users?: User[];
    groups?: Group[];
    sites?: { id: string; name: string }[];
    tickets?: Ticket[];
    problemTypes?: { id: string; name: string }[];
    language: Language;
    onSubmit: (ticket: {
        title: string;
        description: string;
        templateId: string;
        type: TicketType;
        siteId: string;
        assignedTo: string;
        priority: Priority;
        dueDate: Date;
        problemType?: string;
    }) => void;
    onCancel: () => void;
}

export function CreateTicket({
                                 templates: externalTemplates,
                                 users: externalUsers,
                                 groups: externalGroups,
                                 sites: externalSites,
                                 tickets: externalTickets = [],
                                 problemTypes: externalProblemTypes = [],
                                 language,
                                 onSubmit,
                                 onCancel,
                             }: CreateTicketProps) {
    const t = (key: TranslationKey) => translations[language][key];

    const [templates, setTemplates] = useState<Template[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [problemTypes, setProblemTypes] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(!groups || !sites);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [ticketType, setTicketType] = useState<TicketType>("planned");
    const [site, setSite] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [priority, setPriority] = useState<Priority>("P2");
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [relatedTicketIds, setRelatedTicketIds] = useState<string[]>([]);
    const [problemType, setProblemType] = useState("");
    const [openCombobox, setOpenCombobox] = useState(false);

    useEffect(() => {


        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [templatesData, usersData, groupsData, sitesData, ticketsData, problemTypesData] = await Promise.all([
                    api.getTemplates(),
                    api.getUsers({}),
                    api.getGroups(),
                    api.getSites({}),
                    api.getTickets({}),
                    api.getProblemTypes()
                ]);

                setTemplates(Array.isArray(templatesData) ? templatesData : (templatesData || []));
                setUsers(Array.isArray(usersData) ? usersData : (usersData?.records || []));
                setGroups(Array.isArray(groupsData) ? groupsData : (groupsData || []));
                setSites(Array.isArray(sitesData) ? sitesData : (sitesData?.records || []));
                setTickets(Array.isArray(ticketsData) ? ticketsData : (ticketsData?.records || []));
                debugger;
                setProblemTypes(Array.isArray(problemTypesData) ? problemTypesData : (problemTypesData || []));
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load data");
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [externalTemplates, externalUsers, externalGroups, externalSites, externalTickets, externalProblemTypes]);

    useEffect(() => {
        if (externalTemplates) setTemplates(Array.isArray(externalTemplates) ? externalTemplates : (externalTemplates || []));
        if (externalUsers) setUsers(Array.isArray(externalUsers) ? externalUsers : (externalUsers || []));
        if (externalGroups) setGroups(Array.isArray(externalGroups) ? externalGroups : (externalGroups || []));
        if (externalSites) setSites(Array.isArray(externalSites) ? externalSites : (externalSites || []));
        if (externalTickets) setTickets(Array.isArray(externalTickets) ? externalTickets : (externalTickets || []));
        if (externalProblemTypes) setProblemTypes(Array.isArray(externalProblemTypes) ? externalProblemTypes : (externalProblemTypes || []));
    }, [externalTemplates, externalUsers, externalGroups, externalSites, externalTickets, externalProblemTypes]);

    const selectedTemplate = templates.find((t) => t.id === templateId);
    const correctiveTickets = tickets.filter(t => t.type === "corrective");
    const isProblemTicket = ticketType === "problem";

    const handleCreateTicket = async (ticketData: {
        title: string;
        description: string;
        templateId: string;
        type: TicketType;
        siteId: string;
        assignedTo: string;
        priority: Priority;
        dueDate: Date;
        relatedTicketIds: string[];
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
            useNavigate()("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to create ticket");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !templateId || !assignedTo) return;
        if (!isProblemTicket && !site) return;
        if (isProblemTicket && !problemType) return;

        handleCreateTicket({
            title,
            description,
            templateId,
            type: ticketType,
            siteId: isProblemTicket ? "" : site,
            assignedTo,
            priority,
            dueDate,
            relatedTicketIds: isProblemTicket ? relatedTicketIds : [],
            problemType: isProblemTicket ? problemType : undefined,
        });
    };

    const toggleRelatedTicket = (ticketId: string) => {
        setRelatedTicketIds(current =>
            current.includes(ticketId)
                ? current.filter(id => id !== ticketId)
                : [...current, ticketId]
        );
    };

    const priorities: Priority[] = ["P1", "P2", "P3", "P4"];
    const ticketTypes: TicketType[] = ["planned", "preventive", "corrective", "problem"];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <span className="ml-2">Loading data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-destructive">{error}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                        setError(null);
                        setLoading(true);
                        Promise.all([
                            api.getTemplates(),
                            api.getUsers({}),
                            api.getGroups(),
                            api.getSites({}),
                            api.getTickets({}),
                            api.getProblemTypes()
                        ]).then(([templatesData, usersData, groupsData, sitesData, ticketsData, problemTypesData]) => {
                            setTemplates(Array.isArray(templatesData) ? templatesData : (templatesData || []));
                            setUsers(Array.isArray(usersData) ? usersData : (usersData?.records || []));
                            setGroups(Array.isArray(groupsData) ? groupsData : (groupsData || []));
                            setSites(Array.isArray(sitesData) ? sitesData : (sitesData?.records || []));
                            setTickets(Array.isArray(ticketsData) ? ticketsData : (ticketsData?.records || []));
                            setProblemTypes(Array.isArray(problemTypesData) ? problemTypesData : (problemTypesData || []));
                            setLoading(false);
                        }).catch(() => {
                            setError("Failed to load data");
                            setLoading(false);
                        });
                    }}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-secondary border-primary">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t("ticketTitle")}</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("ticketTitle")}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t("description")}</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("description")}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t("selectTemplate")}</Label>
                        <Select value={templateId} onValueChange={setTemplateId} required>
                            <SelectTrigger>
                                <SelectValue placeholder={t("selectTemplate")}/>
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedTemplate && (
                        <Card className="p-4 bg-secondary border-primary">
                            <h4 className="text-primary mb-2">{selectedTemplate.name}</h4>
                            <p className="text-muted-foreground mb-3">{selectedTemplate.description}</p>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Steps:</p>
                                {selectedTemplate.steps.map((step, index) => (
                                    <div key={step.id} className="text-muted-foreground ml-4">
                                        {index + 1}. {step.name} ({step.fields.length} fields)
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("ticketType")}</Label>
                            <Select value={ticketType} onValueChange={(v) => setTicketType(v as TicketType)}>
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">{t("planned")}</SelectItem>
                                    <SelectItem value="preventive">{t("preventive")}</SelectItem>
                                    <SelectItem value="corrective">{t("corrective")}</SelectItem>
                                    <SelectItem value="problem">{t("problem")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!isProblemTicket && (
                            <div className="space-y-2">
                                <Label>{t("site")}</Label>
                                <Select value={site} onValueChange={setSite} required={!isProblemTicket}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("selectSite")}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {isProblemTicket && (
                            <>
                                <div className="space-y-2">
                                    <Label>{t("problemType") || "Problem Type"}</Label>
                                    <Select value={problemType} onValueChange={setProblemType} required={isProblemTicket}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select problem type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {problemTypes?.map((pt) => {
                                                console.log(pt);
                                                debugger;
                                                return ( // 输出 pt 的值
                                                    <SelectItem key={pt.id} value={pt.id}>
                                                        {pt.name}
                                                    </SelectItem>)
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("relatedTickets")} (Relevant Corrective Tickets)</Label>
                                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCombobox}
                                                className="w-full justify-between h-auto min-h-10"
                                            >
                                                {relatedTicketIds.length > 0
                                                    ? `${relatedTicketIds.length} ticket(s) selected`
                                                    : "Select related tickets..."}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search ticket..."/>
                                                <CommandList>
                                                    <CommandEmpty>No corrective ticket found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {correctiveTickets.map((ticket) => (
                                                            <CommandItem
                                                                key={ticket.id}
                                                                value={ticket.id + " " + ticket.title}
                                                                onSelect={() => toggleRelatedTicket(ticket.id)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        relatedTicketIds.includes(ticket.id) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{ticket.id}</span>
                                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {ticket.title}
                                </span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {relatedTicketIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {relatedTicketIds.map(id => {
                                                const ticket = correctiveTickets.find(t => t.id === id);
                                                return (
                                                    <div key={id}
                                                         className="flex items-center gap-1 bg-background border px-2 py-1 rounded text-sm">
                                                        <span className="font-medium">{id}</span>
                                                        <span className="text-muted-foreground truncate max-w-[150px]">
                            {ticket?.title}
                          </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4 ml-1"
                                                            onClick={() => toggleRelatedTicket(id)}
                                                        >
                                                            <span className="sr-only">Remove</span>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="h-3 w-3"
                                                            >
                                                                <path d="M18 6 6 18"/>
                                                                <path d="m6 6 12 12"/>
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("assignTo")}</Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("assignTo")}/>
                                </SelectTrigger>
                                <SelectContent>
                                    {groups
                                        .filter((g) => g.status === "active")
                                        .map((group) => (
                                            <SelectItem key={group.id} value={group.id}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {!isProblemTicket && (
                            <div className="space-y-2">
                                <Label>{t("priority")}</Label>
                                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("priority")}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {t(p)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>{t("dueDate")}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {format(dueDate, "PPP")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={dueDate} onSelect={(date) => date && setDueDate(date)}/>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                            {t("submit")}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}