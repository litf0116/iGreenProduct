import {useState} from "react";
import {Ticket, Template, TicketStatus, TicketComment} from "../lib/types";
import {translations, TranslationKey, Language} from "../lib/i18n";
import {Card} from "./ui/card";
import {Badge} from "./ui/badge";
import {Button} from "./ui/button";
import {Separator} from "./ui/separator";
import {Progress} from "./ui/progress";
import {Textarea} from "./ui/textarea";
import {Label} from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Calendar,
    User,
    FileText,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    UserX,
    PlayCircle,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    XCircle,
    Users,
} from "lucide-react";
import {Avatar, AvatarFallback} from "./ui/avatar";
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

// Helper functions for date formatting to handle both string and Date inputs
function formatDate(date: Date | string | undefined | null): string {
    if (!date) return "-";
    if (typeof date === "string") {
        // Handle format: 2025-01-20 10:00:00 or 2025-01-20T10:00:00.000Z
        const dateObj = new Date(date.replace(" ", "T"));
        if (isNaN(dateObj.getTime())) return date;
        return dateObj.toLocaleDateString();
    }
    return date.toLocaleDateString();
}

function formatDateTime(date: Date | string | undefined | null): string {
    if (!date) return "-";
    if (typeof date === "string") {
        // Handle format: 2025-01-20 10:00:00 or 2025-01-20T10:00:00.000Z
        const dateObj = new Date(date.replace(" ", "T"));
        if (isNaN(dateObj.getTime())) return date;
        return dateObj.toLocaleString();
    }
    return date.toLocaleString();
}

interface TicketDetailProps {
    ticket: Ticket;
    template: Template | undefined;
    language: Language;
    currentUserId: string;
    users: { id: string; name: string; role: string }[];
    onClose: () => void;
    onAccept?: (comment: string) => void;
    onDecline?: (comment: string) => void;
    onHold?: (reason: string) => void;
    onResume?: () => void;
    onReassign?: (newAssigneeId: string, newAssigneeName: string) => void;
    onDeparture?: (photo?: string) => void;
    onArrival?: (photo?: string) => void;
    onComplete?: (photo: string, cause: string, solution: string) => void;
    onConfirm?: () => void;
    onReject?: (reason: string) => void;
}

export function TicketDetail({
                                 ticket,
                                 template,
                                 language,
                                 currentUserId,
                                 users,
                                 onClose,
                                 onAccept,
                                 onDecline,
                                 onHold,
                                 onResume,
                                 onReassign,
                                 onDeparture,
                                 onArrival,
                                 onComplete,
                                 onConfirm,
                                 onReject,
                             }: TicketDetailProps) {
    const t = (key: TranslationKey) => translations[language][key];

    const [showAcceptDialog, setShowAcceptDialog] = useState(false);
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);
    const [showHoldDialog, setShowHoldDialog] = useState(false);
    const [showReassignDialog, setShowReassignDialog] = useState(false);
    const [showDepartureDialog, setShowDepartureDialog] = useState(false);
    const [showArrivalDialog, setShowArrivalDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const [causeText, setCauseText] = useState("");
    const [solutionText, setSolutionText] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState("");

    // Guard clause: if ticket is undefined, return null or a loading state
    if (!ticket) {
        return null;
    }

    const isCreator = ticket.createdBy === currentUserId;
    const isAssigned = ticket.assignedTo === currentUserId;
    const canAcceptOrDecline = isAssigned && !isCreator && ticket.status === "open" && !ticket.accepted;
    const canHold = isAssigned && (ticket.status === "accepted" || ticket.status === "in_progress");
    const canResume = isAssigned && ticket.status === "on_hold";
    const canReassign = isCreator && (ticket.status === "open" || ticket.status === "accepted");
    const canDeparture = isAssigned && ticket.accepted && !ticket.departureAt;
    const canArrival = isAssigned && ticket.departureAt && !ticket.arrivalAt;
    const canComplete = isAssigned && ticket.arrivalAt && ticket.status !== "completed" && ticket.status !== "submitted";
    const canConfirm = ticket.status === "submitted";
    const canReject = ticket.status === "submitted";

    const handleAccept = () => {
        if (onAccept) {
            onAccept(commentText);
            setCommentText("");
            setShowAcceptDialog(false);
        }
    };

    const handleDecline = () => {
        if (onDecline) {
            onDecline(commentText);
            setCommentText("");
            setShowDeclineDialog(false);
        }
    };

    const handleHold = () => {
        if (onHold) {
            onHold(commentText);
            setCommentText("");
            setShowHoldDialog(false);
        }
    };

    const handleResume = () => {
        if (onResume) {
            onResume();
        }
    };

    const handleReassign = () => {
        if (onReassign && selectedAssignee) {
            const newAssignee = users.find(u => u.id === selectedAssignee);
            if (newAssignee) {
                onReassign(selectedAssignee, newAssignee.name);
                setSelectedAssignee("");
                setShowReassignDialog(false);
            }
        }
    };

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeparture = () => {
        if (onDeparture) {
            onDeparture(photoPreview || undefined);
            setPhotoPreview("");
            setShowDepartureDialog(false);
        }
    };

    const handleArrival = () => {
        if (onArrival) {
            onArrival(photoPreview || undefined);
            setPhotoPreview("");
            setShowArrivalDialog(false);
        }
    };

    const handleComplete = () => {
        if (onComplete && photoPreview && causeText && solutionText) {
            onComplete(photoPreview, causeText, solutionText);
            setPhotoPreview("");
            setCauseText("");
            setSolutionText("");
            setShowCompleteDialog(false);
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
            setShowConfirmDialog(false);
        }
    };

    const handleReject = () => {
        if (onReject) {
            onReject(commentText);
            setCommentText("");
            setShowRejectDialog(false);
        }
    };

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
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusTextColor = (status: TicketStatus) => {
        switch (status) {
            case "open":
                return "text-blue-500";
            case "assigned":
                return "text-indigo-500";
            case "accepted":
                return "text-cyan-500";
            case "in_progress":
                return "text-orange-500";
            case "submitted":
                return "text-purple-500";
            case "completed":
                return "text-green-500";
            case "on_hold":
                return "text-yellow-500";
            case "cancelled":
                return "text-gray-500";
            default:
                return "text-gray-500";
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

    const progress = template
        ? (ticket.completedSteps.length / template.steps.length) * 100
        : 0;

    const daysUntilDue = Math.ceil(
        (new Date(ticket.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

    const isProblemTicket = ticket.type === "problem";

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 max-w-full">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="text-muted-foreground">#{ticket.id}</span>
                            {!isProblemTicket && (
                                <Badge variant={getPriorityBadge(ticket.priority as string)}>
                                    {t((ticket.priority || "P4") as TranslationKey)}
                                </Badge>
                            )}
                            <Badge className={getStatusColor(ticket.status)}>
                                {t(ticket.status as TranslationKey)}
                            </Badge>
                        </div>
                        <h2 className="text-primary break-words">{ticket.title}</h2>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {/* Actions for assigned user */}
                    {canAcceptOrDecline && (
                        <>
                            <Button
                                onClick={() => setShowAcceptDialog(true)}
                                className="bg-emerald-500 hover:bg-emerald-600"
                            >
                                <ThumbsUp className="h-4 w-4 mr-2"/>
                                {t("accept")}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeclineDialog(true)}
                                className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                                <ThumbsDown className="h-4 w-4 mr-2"/>
                                {t("decline")}
                            </Button>
                        </>
                    )}

                    {/* Put On Hold */}
                    {canHold && (
                        <Button
                            variant="outline"
                            onClick={() => setShowHoldDialog(true)}
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        >
                            <Clock className="h-4 w-4 mr-2"/>
                            {t("holdTicket")}
                        </Button>
                    )}

                    {/* Resume from Hold */}
                    {canResume && (
                        <Button
                            onClick={handleResume}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            <PlayCircle className="h-4 w-4 mr-2"/>
                            {t("resumeTicket")}
                        </Button>
                    )}

                    {/* Engineer Actions */}
                    {canDeparture && (
                        <Button
                            onClick={() => setShowDepartureDialog(true)}
                            className="bg-purple-500 hover:bg-purple-600"
                        >
                            <Clock className="h-4 w-4 mr-2"/>
                            {t("markDeparture")}
                        </Button>
                    )}

                    {canArrival && (
                        <Button
                            onClick={() => setShowArrivalDialog(true)}
                            className="bg-indigo-500 hover:bg-indigo-600"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2"/>
                            {t("markArrival")}
                        </Button>
                    )}

                    {canComplete && (
                        <Button
                            onClick={() => setShowCompleteDialog(true)}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2"/>
                            {t("completeTicket")}
                        </Button>
                    )}

                    {canConfirm && (
                        <Button
                            onClick={() => setShowConfirmDialog(true)}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2"/>
                            {t("confirm")}
                        </Button>
                    )}

                    {canReject && (
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(true)}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                            <XCircle className="h-4 w-4 mr-2"/>
                            {t("reject")}
                        </Button>
                    )}

                    {/* Actions for creator - Reassign only */}
                    {canReassign && onReassign && (
                        <Button
                            variant="outline"
                            onClick={() => setShowReassignDialog(true)}
                            className="border-blue-500 text-blue-500 hover:bg-blue-50"
                        >
                            <Users className="h-4 w-4 mr-2"/>
                            {t("reassignTicket")}
                        </Button>
                    )}
                </div>
            </div>

            <Separator/>

            {/* Description */}
            {ticket.description && (
                <Card className="p-4 bg-secondary border-primary/20">
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-foreground mb-1">{t("description")}</h4>
                            <p className="text-muted-foreground break-words">{ticket.description}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Site - Hide for Problem Ticket */}
                {!isProblemTicket && (
                    <Card className="p-4 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                <FileText className="h-5 w-5 text-primary"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-muted-foreground">{t("site")}</p>
                                <p className="text-foreground mt-1">{ticket.siteName || ticket.siteId || '-'}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Assigned To */}
                <Card className="p-4 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <User className="h-5 w-5 text-primary"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-muted-foreground">{t("assignTo")}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarFallback className="bg-primary text-white text-xs">
                                        {ticket.assignedToName?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-foreground truncate">{ticket.assignedToName}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Due Date */}
                <Card className={`p-4 ${isOverdue ? "bg-red-50 border-red-200" : "bg-white"}`}>
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                                isOverdue
                                    ? "bg-red-100"
                                    : isDueSoon
                                        ? "bg-yellow-100"
                                        : "bg-primary/10"
                            }`}
                        >
                            {isOverdue ? (
                                <AlertCircle className="h-5 w-5 text-red-600"/>
                            ) : (
                                <Calendar className="h-5 w-5 text-primary"/>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-muted-foreground">{t("dueDate")}</p>
                            <p className={`mt-1 ${isOverdue ? "text-red-600" : "text-foreground"}`}>
                                {formatDate(ticket.dueDate)}
                            </p>
                            {isOverdue && (
                                <p className="text-red-600">{t("overdueDays").replace("{days}", Math.abs(daysUntilDue).toString())}</p>
                            )}
                            {isDueSoon && !isOverdue && (
                                <p className="text-yellow-600">{t("dueDays").replace("{days}", daysUntilDue.toString())}</p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Created By */}
                <Card className="p-4 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <User className="h-5 w-5 text-primary"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-muted-foreground">{t("createdBy")}</p>
                            <p className="text-foreground mt-1 truncate">{ticket.createdByName}</p>
                            <p className="text-muted-foreground">
                                {formatDate(ticket.createdAt)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Template */}
                <Card className="p-4 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-muted-foreground">{t("template")}</p>
                            <p className="text-foreground mt-1 break-words">{ticket.templateName}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Engineer Status Section */}
            {isAssigned && ticket.accepted && (
                <Card className="p-6 bg-white border-l-4 border-l-purple-500">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-500"/>
                            <h4 className="text-foreground">{t("engineerStatus")}</h4>
                        </div>
                        <Separator/>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Departure Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {ticket.departureAt ? (
                                        <CheckCircle2 className="h-5 w-5 text-purple-500"/>
                                    ) : (
                                        <Circle className="h-5 w-5 text-gray-300"/>
                                    )}
                                    <span className="font-medium">{t("departure")}</span>
                                </div>
                                {ticket.departureAt ? (
                                    <div className="pl-7">
                                        <p className="text-muted-foreground">
                                            {formatDateTime(ticket.departureAt)}
                                        </p>
                                        {ticket.departurePhoto && (
                                            <img
                                                src={ticket.departurePhoto}
                                                alt="Departure"
                                                className="mt-2 w-full h-32 object-cover rounded border"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground pl-7">{t("notDeparted")}</p>
                                )}
                            </div>

                            {/* Arrival Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {ticket.arrivalAt ? (
                                        <CheckCircle2 className="h-5 w-5 text-indigo-500"/>
                                    ) : (
                                        <Circle className="h-5 w-5 text-gray-300"/>
                                    )}
                                    <span className="font-medium">{t("arrival")}</span>
                                </div>
                                {ticket.arrivalAt ? (
                                    <div className="pl-7">
                                        <p className="text-muted-foreground">
                                            {formatDateTime(ticket.arrivalAt)}
                                        </p>
                                        {ticket.arrivalPhoto && (
                                            <img
                                                src={ticket.arrivalPhoto}
                                                alt="Arrival"
                                                className="mt-2 w-full h-32 object-cover rounded border"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground pl-7">-</p>
                                )}
                            </div>

                            {/* Completion Status */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {ticket.status === "completed" ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500"/>
                                    ) : (
                                        <Circle className="h-5 w-5 text-gray-300"/>
                                    )}
                                    <span className="font-medium">{t("complete")}</span>
                                </div>
                                {ticket.status === "completed" && ticket.completionPhoto ? (
                                    <div className="pl-7">
                                        <img
                                            src={ticket.completionPhoto}
                                            alt="Completion"
                                            className="mt-2 w-full h-32 object-cover rounded border"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground pl-7">-</p>
                                )}
                            </div>
                        </div>

                        {/* Cause and Solution */}
                        {ticket.cause && ticket.solution && (
                            <>
                                <Separator/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h5 className="font-medium text-foreground">{t("causeOfIssue")}</h5>
                                        <p className="text-muted-foreground break-words">{ticket.cause}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="font-medium text-foreground">{t("solutionProvided")}</h5>
                                        <p className="text-muted-foreground break-words">{ticket.solution}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}

            {/* Progress Section */}
            {template && (
                <Card className="p-6 bg-white">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Clock className="h-5 w-5 text-primary"/>
                                <h4 className="text-foreground">{t("workProgress")}</h4>
                            </div>
                            <span className={`${getStatusTextColor(ticket.status)} flex-shrink-0`}>
                {ticket.completedSteps.length} / {template.steps.length} {t("steps")}
              </span>
                        </div>

                        <div className="space-y-2">
                            <Progress value={progress} className="h-2"/>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
                            </div>
                        </div>

                        <Separator/>

                        {/* Steps List */}
                        <div className="space-y-3">
                            {template.steps.map((step, index) => {
                                const isCompleted = ticket.completedSteps.includes(step.id);
                                return (
                                    <div
                                        key={step.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                            isCompleted ? "bg-emerald-50" : "bg-secondary"
                                        }`}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500"/>
                                            ) : (
                                                <Circle className="h-5 w-5 text-muted-foreground"/>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className={`${
                                isCompleted ? "text-emerald-700" : "text-foreground"
                            } break-words`}
                        >
                          {index + 1}. {step.name}
                        </span>
                                                {isCompleted && (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 flex-shrink-0">
                                                        {t("done")}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p
                                                className={`mt-1 break-words ${
                                                    isCompleted ? "text-emerald-600" : "text-muted-foreground"
                                                }`}
                                            >
                                                {step.description}
                                            </p>
                                            {step.fields.length > 0 && (
                                                <p className="text-muted-foreground mt-1">
                                                    {step.fields.length} {t("fields")} {t("required")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}

            {/* Comments Section */}
            {ticket.comments && ticket.comments.length > 0 && (
                <Card className="p-6 bg-white">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary flex-shrink-0"/>
                            <h4 className="text-foreground">{t("comments")}</h4>
                        </div>
                        <Separator/>
                        <div className="space-y-3">
                            {ticket.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 p-3 bg-secondary rounded-lg">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback className="bg-primary text-white text-xs">
                                            {comment.userName?.charAt(0).toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-foreground truncate">{comment.userName}</span>
                                            {comment.type === "accept" && (
                                                <Badge className="bg-emerald-500 flex-shrink-0">{t("accepted")}</Badge>
                                            )}
                                            {comment.type === "decline" && (
                                                <Badge className="bg-red-500 flex-shrink-0">{t("declined")}</Badge>
                                            )}
                                            {comment.type === "cancel" && (
                                                <Badge className="bg-orange-500 flex-shrink-0">{t("cancelled")}</Badge>
                                            )}
                                            {ticket.status === "ON_HOLD" && comment.comment.toLowerCase().includes("hold") && (
                                                <Badge className="bg-yellow-500 flex-shrink-0">{t("onHold")}</Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground mt-1 break-words">{comment.comment}</p>
                                        <p className="text-muted-foreground mt-1">
                                            {formatDateTime(comment.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Accept Dialog */}
            <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("acceptTicket")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will accept this ticket and work will begin automatically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label>{t("comment")} (Optional)</Label>
                        <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={t("addComment")}
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCommentText("")}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAccept}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            {t("accept")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Decline Dialog */}
            <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("declineTicket")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for declining this ticket.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label>{t("reason")} *</Label>
                        <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={t("reason")}
                            rows={3}
                            required
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCommentText("")}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDecline}
                            disabled={!commentText.trim()}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {t("decline")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Hold Dialog */}
            <AlertDialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("holdTicket")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            The ticket will be put on hold. Please provide a reason.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label>{t("reason")} *</Label>
                        <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={t("reason")}
                            rows={3}
                            required
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCommentText("")}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleHold}
                            disabled={!commentText.trim()}
                            className="bg-yellow-500 hover:bg-yellow-600"
                        >
                            {t("holdTicket")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reassign Dialog */}
            <AlertDialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("reassignTicket")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("reassignDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label>{t("selectEngineer")} *</Label>
                        <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("selectEngineer")}/>
                            </SelectTrigger>
                            <SelectContent>
                                {users
                                    .filter(u => u.role === "engineer" && u.id !== ticket.assignedTo)
                                    .map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedAssignee("")}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReassign}
                            disabled={!selectedAssignee}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            {t("reassign")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Departure Dialog */}
            <AlertDialog open={showDepartureDialog} onOpenChange={setShowDepartureDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("markDeparture")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Mark your departure to the site. You can optionally upload a photo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label>{t("photoOptional")}</Label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoCapture}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90"
                        />
                        {photoPreview && (
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="mt-2 w-full h-48 object-cover rounded border"
                            />
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPhotoPreview("")}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeparture}
                            className="bg-purple-500 hover:bg-purple-600"
                        >
                            {t("markDeparture")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Arrival Dialog */}
            <AlertDialog open={showArrivalDialog} onOpenChange={setShowArrivalDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("markArrival")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Mark your arrival at the site. You can optionally upload a photo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label>{t("photoOptional")}</Label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoCapture}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90"
                        />
                        {photoPreview && (
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="mt-2 w-full h-48 object-cover rounded border"
                            />
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPhotoPreview("")}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArrival}
                            className="bg-indigo-500 hover:bg-indigo-600"
                        >
                            {t("markArrival")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Complete Dialog */}
            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent className="bg-white max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("completeTicket")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Complete this ticket by providing a photo, cause, and solution.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("photoRequired")} *</Label>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoCapture}
                                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90"
                                required
                            />
                            {photoPreview && (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="mt-2 w-full h-48 object-cover rounded border"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>{t("causeOfIssue")} *</Label>
                            <Textarea
                                value={causeText}
                                onChange={(e) => setCauseText(e.target.value)}
                                placeholder="Describe the cause of the issue..."
                                rows={3}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("solutionProvided")} *</Label>
                            <Textarea
                                value={solutionText}
                                onChange={(e) => setSolutionText(e.target.value)}
                                placeholder="Describe the solution provided..."
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setPhotoPreview("");
                            setCauseText("");
                            setSolutionText("");
                        }}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleComplete}
                            disabled={!photoPreview || !causeText.trim() || !solutionText.trim()}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            {t("completeTicket")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmTicket")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to confirm the completion of this ticket?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            {t("confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("rejectTicket")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting the completion.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label>{t("reason")} *</Label>
                        <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={t("reason")}
                            rows={3}
                            required
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCommentText("")}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={!commentText.trim()}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {t("reject")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
