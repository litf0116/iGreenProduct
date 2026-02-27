import {useState, useEffect} from "react";
import {Template, TemplateStep, TemplateField, FieldType} from "../lib/types";
import {translations, TranslationKey, Language} from "../lib/i18n";
import {api} from "../lib/api";
import {Card} from "./ui/card";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Textarea} from "./ui/textarea";
import {Label} from "./ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "./ui/dialog";
import {Plus, Trash2, Edit, GripVertical, Loader2} from "lucide-react";
import {Badge} from "./ui/badge";
import {Checkbox} from "./ui/checkbox";
import {toast} from "sonner";

interface TemplateManagerProps {
    language: Language;
    // Optional - for backward compatibility
    templates?: Template[];
    onSaveTemplate?: (template: Template | Omit<Template, "id" | "createdAt" | "updatedAt">) => void;
    onDeleteTemplate?: (id: string) => void;
}

export function TemplateManager({
                                    language,
                                    templates: externalTemplates,
                                    onSaveTemplate: externalOnSave,
                                    onDeleteTemplate: externalOnDelete,
                                }: TemplateManagerProps) {
    const t = (key: TranslationKey) => translations[language][key];

    // Local state - use external if provided, otherwise use local
    const [templates, setTemplates] = useState<Template[]>(externalTemplates || []);
    const [loading, setLoading] = useState(!externalTemplates);
    const [error, setError] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const [templateName, setTemplateName] = useState("");
    const [templateDescription, setTemplateDescription] = useState("");
    const [steps, setSteps] = useState<TemplateStep[]>([]);

    const fieldTypes: FieldType[] = [
        "text",
        "number",
        "date",
        "location",
        "photo",
        "signature",
    ];

    // Fetch templates on mount if not provided externally
    useEffect(() => {
        if (externalTemplates) {
            setTemplates(externalTemplates);
            setLoading(false);
            return;
        }

        const fetchTemplates = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getTemplates();
                setTemplates(data || []);
            } catch (err) {
                console.error("Failed to fetch templates:", err);
                setError("Failed to load templates");
                toast.error("Failed to load templates");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [externalTemplates]);

    // Sync with external templates when they change
    useEffect(() => {
        if (externalTemplates) {
            setTemplates(externalTemplates);
        }
    }, [externalTemplates]);

    const handleOpenDialog = (template?: Template) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateName(template.name);
            setTemplateDescription(template.description);
            setSteps(template.steps || []);
        } else {
            setEditingTemplate(null);
            setTemplateName("");
            setTemplateDescription("");
            setSteps([]);
        }
        setIsDialogOpen(true);
    };

    const handleAddStep = () => {
        const newStep: TemplateStep = {
            id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: "",
            description: "",
            fields: [],
            order: steps.length + 1,
        };
        setSteps([...steps, newStep]);
    };

    const handleRemoveStep = (stepId: string) => {
        setSteps(steps.filter((s) => s.id !== stepId));
    };

    const handleUpdateStep = (stepId: string, updates: Partial<TemplateStep>) => {
        setSteps(steps.map((s) => (s.id === stepId ? {...s, ...updates} : s)));
    };

    const handleAddField = (stepId: string) => {
        const newField: TemplateField = {
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: "",
            type: "text",
            required: false,
        };
        setSteps(
            steps.map((s) =>
                s.id === stepId ? {...s, fields: [...(s.fields || []), newField]} : s
            )
        );
    };

    const handleRemoveField = (stepId: string, fieldId: string) => {
        setSteps(
            steps.map((s) =>
                s.id === stepId ? {...s, fields: (s.fields || []).filter((f) => f.id !== fieldId)} : s
            )
        );
    };

    const handleUpdateField = (
        stepId: string,
        fieldId: string,
        updates: Partial<TemplateField>
    ) => {
        setSteps(
            steps.map((s) =>
                s.id === stepId
                    ? {
                        ...s,
                        fields: (s.fields || []).map((f) => (f.id === fieldId ? {...f, ...updates} : f)),
                    }
                    : s
            )
        );
    };

    const handleSave = async () => {
        if (!templateName.trim() || steps.length === 0) return;

        const templateData = {
            name: templateName,
            description: templateDescription,
            steps,
        };

        // If external handlers exist, use them
        if (externalOnSave) {
            if (editingTemplate) {
                externalOnSave({
                    ...editingTemplate,
                    ...templateData,
                });
            } else {
                externalOnSave(templateData);
            }
            setIsDialogOpen(false);
            setTemplateName("");
            setTemplateDescription("");
            setSteps([]);
            setEditingTemplate(null);
            return;
        }

        // Otherwise, use local API calls with optimistic update
        try {
            if (editingTemplate) {
                // Optimistic update
                setTemplates((prev) =>
                    prev.map((t) => (t.id === editingTemplate.id ? {...t, ...templateData} : t))
                );

                await api.updateTemplate(editingTemplate.id, templateData);
                toast.success(t("templateSaved") || "Template saved");
            } else {
                // Optimistic add - create temp ID
                const tempId = `temp_${Date.now()}`;
                const newTemplate: Template = {
                    id: tempId,
                    ...templateData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                setTemplates((prev) => [newTemplate, ...prev]);

                const created = await api.createTemplate(templateData);
                // Replace temp with real data
                setTemplates((prev) =>
                    prev.map((t) => (t.id === tempId ? created : t))
                );
                toast.success(t("templateCreated") || "Template created");
            }
        } catch (err) {
            console.error("Failed to save template:", err);
            // Rollback on error - refetch
            if (editingTemplate) {
                const original = await api.getTemplate(editingTemplate.id);
                setTemplates((prev) =>
                    prev.map((t) => (t.id === editingTemplate.id ? original : t))
                );
            } else {
                setTemplates((prev) => prev.filter((t) => !t.id.startsWith("temp_")));
            }
            toast.error("Failed to save template");
        }

        setIsDialogOpen(false);
        setTemplateName("");
        setTemplateDescription("");
        setSteps([]);
        setEditingTemplate(null);
    };

    const handleDelete = async (id: string) => {
        // If external handler exists, use it
        if (externalOnDelete) {
            externalOnDelete(id);
            return;
        }

        // Store previous state for rollback
        const previousTemplates = [...templates];

        try {
            // Optimistic delete
            setTemplates((prev) => prev.filter((t) => t.id !== id));

            await api.deleteTemplate(id);
            toast.success(t("templateDeleted") || "Template deleted");
        } catch (err) {
            console.error("Failed to delete template:", err);
            // Rollback on error
            setTemplates(previousTemplates);
            toast.error("Failed to delete template");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <span className="ml-2">Loading templates...</span>
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
                        api.getTemplates().then((data) => {
                            setTemplates(data || []);
                            setLoading(false);
                        }).catch(() => {
                            setError("Failed to load templates");
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
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground">
                        {templates.length} {templates.length === 1 ? "template" : "templates"}
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-[#0ea5e9] hover:bg-[#0284c7]">
                    <Plus className="h-4 w-4 mr-2"/>
                    {t("createTemplate")}
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingTemplate ? t("editTemplate") : t("createTemplate")}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t(" templateName")}</Label>
                                <Input
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder={t("templateName")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("description")}</Label>
                                <Textarea
                                    value={templateDescription}
                                    onChange={(e) => setTemplateDescription(e.target.value)}
                                    placeholder={t("description")}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Steps</Label>
                                    <Button onClick={handleAddStep} variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2"/>
                                        {t("addStep")}
                                    </Button>
                                </div>

                                {steps?.map((step, stepIndex) => (
                                    <Card key={step.id} className="p-4 space-y-4">
                                        <div className="flex items-start gap-2">
                                            <GripVertical className="h-5 w-5 text-muted-foreground mt-2"/>
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            value={step.name}
                                                            onChange={(e) =>
                                                                handleUpdateStep(step.id, {name: e.target.value})
                                                            }
                                                            placeholder={t("stepName")}
                                                        />
                                                        <Textarea
                                                            value={step.description}
                                                            onChange={(e) =>
                                                                handleUpdateStep(step.id, {description: e.target.value})
                                                            }
                                                            placeholder={t("stepDescription")}
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => handleRemoveStep(step.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Fields</Label>
                                                        <Button
                                                            onClick={() => handleAddField(step.id)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Plus className="h-4 w-4"/>
                                                        </Button>
                                                    </div>

                                                    {(step.fields || []).map((field, fieldIndex) => (
                                                        <div
                                                            key={field.id}
                                                            className="flex items-center gap-2 p-2 bg-muted rounded"
                                                        >
                                                            <Input
                                                                value={field.name}
                                                                onChange={(e) =>
                                                                    handleUpdateField(step.id, field.id, {
                                                                        name: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Field name"
                                                                className="flex-1"
                                                            />
                                                            <Select
                                                                value={field.type}
                                                                onValueChange={(value: string) =>
                                                                    handleUpdateField(step.id, field.id, {
                                                                        type: value as FieldType,
                                                                    })
                                                                }
                                                            >
                                                                <SelectTrigger className="w-[180px]">
                                                                    <SelectValue/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {fieldTypes.map((type) => (
                                                                        <SelectItem key={type} value={type}>
                                                                            {t(type as TranslationKey)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    checked={field.required}
                                                                    onCheckedChange={(checked: any) =>
                                                                        handleUpdateField(step.id, field.id, {
                                                                            required: !!checked,
                                                                        })
                                                                    }
                                                                />
                                                                <Label>{t("requiredField")}</Label>
                                                            </div>
                                                            <Button
                                                                onClick={() => handleRemoveField(step.id, field.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {t("cancel")}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-[#0ea5e9] hover:bg-[#0284c7]"
                                >
                                    {t("saveTemplate")}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                    <Card key={template.id} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-start justify-between">
                                <h3 className="text-primary">{template.name}</h3>
                                <div className="flex gap-1">
                                    <Button
                                        onClick={() => handleOpenDialog(template)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        <Edit className="h-4 w-4"/>
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(template.id)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            </div>
                            <p className="text-muted-foreground">{template.description}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Steps</span>
                                <Badge>{(template.steps || []).length}</Badge>
                            </div>
                            <div className="space-y-1">
                                {(template.steps || []).slice(0, 3).map((step, index) => (
                                    <div key={step.id} className="text-muted-foreground">
                                        {index + 1}. {step.name}
                                    </div>
                                ))}
                                {(template.steps || []).length > 3 && (
                                    <div className="text-muted-foreground">
                                        +{(template.steps || []).length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {templates.length === 0 && (
                <div className="text-center p-8">
                    <p className="text-muted-foreground">{t("noTemplatesYet") || "No templates yet"}</p>
                    <Button
                        onClick={() => handleOpenDialog()}
                        className="mt-4 bg-[#0ea5e9] hover:bg-[#0284c7]"
                    >
                        <Plus className="h-4 w-4 mr-2"/>
                        {t("createTemplate")}
                    </Button>
                </div>
            )}
        </div>
    );
}
