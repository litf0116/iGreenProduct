import React, {useState} from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle2,
  CheckSquare,
  FileText,
  HelpCircle,
  MapPin,
  MinusCircle,
  Navigation,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  User,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import {Badge} from "./ui/badge";
import {Button} from "./ui/button";
import {Separator} from "./ui/separator";
import {Textarea} from "./ui/textarea";
import {Checkbox} from "./ui/checkbox";
import {ToggleGroup, ToggleGroupItem} from "./ui/toggle-group";
import {getPriorityColor, getTicketTypeColor, getTicketTypeIcon, getTicketTypeLabel, Ticket, TicketStep} from '../lib/data';
import {toast} from "sonner@2.0.3";
import {useLanguage} from './LanguageContext';
import {api} from '../lib/api';
import {pickPhoto, takePhoto} from '../lib/camera';
import {FIELD_ID_TO_LEGACY_FIELD, getTemplateByType} from '../config/fieldConfigs';
import {DynamicFieldRenderer} from "./form/DynamicFieldRenderer";
import {PhotoUploader} from "./form/PhotoUploader";

interface TicketDetailProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdateTicket: (id: string, updates: Partial<Ticket>, options?: { skipApi?: boolean }) => void;
  onViewRelatedTicket?: (ticketId: string) => void;
}

export function TicketDetail({ticket, onClose, onUpdateTicket, onViewRelatedTicket}: TicketDetailProps) {
  const {t} = useLanguage();
  const [loadingImage, setLoadingImage] = useState<string | null>(null);

  if (!ticket) return null;

  const ensureSteps = () => {
    if (ticket.type === 'corrective' || ticket.type === 'planned' || ticket.type === 'problem') return; // Corrective, Planned and Problem tickets don't use steps in this new flow

    if (!ticket.steps || ticket.steps.length === 0) {
      const newSteps: TicketStep[] = [
        {
          id: '1',
          label: 'Check the MDB cabinet and charging station cabinet for rust, leaks, and the condition of the door handles.',
          completed: false
        },
        {
          id: '2',
          label: 'Check the fire extinguishers and monitor the equipment to ensure they are functioning properly.',
          completed: false
        },
        {id: '3', label: 'Check the ground condition, drainage, and cleaning.', completed: false},
        {
          id: '4',
          label: 'Check the charging gun head and charging cable for any damage or scratches. Ensure the cable ends are securely installed.',
          completed: false
        },
        {id: '5', label: 'Check if the charging input line is normal.', completed: false},
        {
          id: '6',
          label: "Check that all terminals on the charging station's mainboard are securely plugged in and that all cables are loose.",
          completed: false
        },
        {id: '7', label: 'Check if the display screen is intact and verify that all parameter settings are correct.', completed: false},
        {id: '8', label: 'Check if the indicator lights on the charging station are functioning properly.', completed: false},
        {id: '9', label: 'Check if all communication functions of the charging station are normal.', completed: false},
        {id: '10', label: 'Check that the emergency stop button is intact and that it functions properly.', completed: false},
        {
          id: '11',
          label: 'Check if the charging module is operating normally and if the power indicator light is flashing. There should be no red alarm light illuminated.',
          completed: false
        },
        {id: '12', label: 'Check that the surge protector is in good working order and has not been damaged.', completed: false},
        {id: '13', label: 'Check if the dust screen needs cleaning.', completed: false},
        {id: '14', label: 'Check all historical records of the charging station for any abnormal fault data.', completed: false},
        {
          id: '15',
          label: 'Check if the communication between the charging station and the backend is normal and if the data is being sent normally.',
          completed: false
        },
        {id: '16', label: 'Check if the charger contactor is functioning properly and On-site test of charging action', completed: false},
      ];
      onUpdateTicket(ticket.id, {steps: newSteps});
    }
  };

  const handleGrabOrder = async () => {
    try {
      await api.acceptTicket(ticket.id);
      // 重新获取工单详情以获取最新状态
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.success("Ticket assigned to you");
    } catch (error) {
      console.error("Failed to accept ticket:", error);
      toast.error("Failed to accept ticket");
    }
  };

  const handleDepart = async () => {
    try {
      await api.departTicket(ticket.id);
      // 重新获取工单详情以获取最新状态
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.success("Departure recorded");
    } catch (error) {
      console.error("Failed to depart:", error);
      toast.error("Failed to record departure");
    }
  };

  const handleArrive = async () => {
    try {
      await api.arriveTicket(ticket.id);
      ensureSteps();
      // 重新获取工单详情以获取最新状态
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.success("Arrival recorded - Start working on steps");
    } catch (error) {
      console.error("Failed to arrive:", error);
      toast.error("Failed to record arrival");
    }
  };

  const handleStepToggle = async (stepId: string, checked: boolean) => {
    const step = ticket.steps?.find(s => s.id === stepId);
    if (!step) return;

    try {
      await api.updateTicketStep(ticket.id, stepId, {completed: checked});
      const updatedSteps = ticket.steps?.map(s =>
        s.id === stepId ? {...s, completed: checked} : s
      );
      onUpdateTicket(ticket.id, {steps: updatedSteps});
    } catch (error) {
      console.error("Failed to update step:", error);
    }
  };

  const handleStepDescription = async (stepId: string, desc: string) => {
    const step = ticket.steps?.find(s => s.id === stepId);
    if (!step) return;

    try {
      await api.updateTicketStep(ticket.id, stepId, {description: desc});
      const updatedSteps = ticket.steps?.map(s =>
        s.id === stepId ? {...s, description: desc} : s
      );
      onUpdateTicket(ticket.id, {steps: updatedSteps});
    } catch (error) {
      console.error("Failed to update step description:", error);
    }
  };

  const handlePreventiveStepUpdate = async (stepId: string, updates: Partial<TicketStep>) => {
    const step = ticket.steps?.find(s => s.id === stepId);
    if (!step) return;

    // 计算完成状态
    const newStep = {...step, ...updates};
    let isCompleted = false;
    if (newStep.status === 'na') {
      isCompleted = true;
    } else if (newStep.status === 'pass') {
      if (newStep.photoUrl || (newStep.photoUrls && newStep.photoUrls.length > 0)) isCompleted = true;
    } else if (newStep.status === 'fail') {
      const hasBefore = newStep.beforePhotoUrl || (newStep.beforePhotoUrls && newStep.beforePhotoUrls.length > 0);
      const hasAfter = newStep.afterPhotoUrl || (newStep.afterPhotoUrls && newStep.afterPhotoUrls.length > 0);
      if (newStep.cause && hasBefore && hasAfter) isCompleted = true;
    }
    newStep.completed = isCompleted;

    try {
      await api.updateTicketStep(ticket.id, stepId, {
        status: newStep.status,
        cause: newStep.cause,
        photoUrl: newStep.photoUrl,
        photoUrls: newStep.photoUrls,
        beforePhotoUrl: newStep.beforePhotoUrl,
        beforePhotoUrls: newStep.beforePhotoUrls,
        afterPhotoUrl: newStep.afterPhotoUrl,
        afterPhotoUrls: newStep.afterPhotoUrls,
        completed: newStep.completed,
        timestamp: newStep.timestamp,
      });

      const updatedSteps = ticket.steps?.map(s =>
        s.id === stepId ? newStep : s
      );
      onUpdateTicket(ticket.id, {steps: updatedSteps});
    } catch (error) {
      console.error("Failed to update step:", error);
    }
  };

  const handleAddPhoto = async (
    source: 'camera' | 'gallery',
    stepId: string,
    fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' = 'photo',
    isCorrectiveOrPlanned: boolean = false
  ) => {
    setLoadingImage(stepId + fieldPrefix);
    try {
      // 使用 Capacitor Camera 替代 HTML file input
      const photo = source === 'camera' ? await takePhoto() : await pickPhoto();

      if (!photo) {
        setLoadingImage(null);
        return;
      }

      // 将 base64 DataUrl 转换为 File 对象
      const response = await fetch(photo);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, {type: 'image/jpeg'});

      const uploaded = await api.uploadFile(file, fieldPrefix);

      if (isCorrectiveOrPlanned) {
        const existingPhotos = (ticket as any)[`${fieldPrefix}Urls`] || [];
        onUpdateTicket(ticket.id, {
          [`${fieldPrefix}Urls`]: [...existingPhotos, uploaded.url]
        });
      } else {
        const step = ticket.steps?.find(s => s.id === stepId);
        // 根据 fieldPrefix 使用正确的字段名
        const photoField = fieldPrefix === 'beforePhoto' ? 'beforePhotoUrls' :
          fieldPrefix === 'afterPhoto' ? 'afterPhotoUrls' : 'photoUrls';
        const existingPhotos = step?.[photoField] || (step?.[`${fieldPrefix}Url`] ? [step[`${fieldPrefix}Url`]] : []);
        handlePreventiveStepUpdate(stepId, {
          [photoField]: [...existingPhotos, uploaded.url],
          timestamp: new Date().toISOString()
        });
      }

      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setLoadingImage(null);
    }
  };

  // =====================
  // Dynamic Form Handlers
  // =====================

  // Get field value from ticket using legacy field name
  // Get field value from ticket using templateData or legacy field
  const getFieldValue = (fieldId: string): any => {
    // 优先从 templateData 中查找
    if (ticket.templateData?.steps) {
      for (const step of ticket.templateData.steps) {
        const field = step.fields.find(f => f.id === fieldId);
        if (field) {
          return field.value || field.values;
        }
      }
    }
    // Fallback 到旧字段（向后兼容）
    const legacyField = FIELD_ID_TO_LEGACY_FIELD[fieldId];
    if (legacyField) {
      return (ticket as any)[legacyField];
    }
    return undefined;
  };

  // Handle dynamic field value change
  const handleFieldChange = (fieldId: string, value: any) => {
    // 更新 templateData 中的字段值
    if (ticket.templateData?.steps) {
      const updatedSteps = ticket.templateData.steps.map(step => ({
        ...step,
        fields: step.fields.map(field =>
          field.id === fieldId
            ? { 
                ...field, 
                ...(Array.isArray(value) ? { values: value } : { value: value }),
                timestamp: new Date().toISOString()
              }
            : field
        )
      }));
      
      onUpdateTicket(ticket.id, {
        templateData: {
          ...ticket.templateData,
          steps: updatedSteps
        }
      });
      return;
    }
    
    // Fallback 到旧字段（向后兼容）
    const legacyField = FIELD_ID_TO_LEGACY_FIELD[fieldId];
    if (legacyField) {
      onUpdateTicket(ticket.id, {[legacyField]: value});
    }
  };

  // Check if form is complete based on template
  const isFormComplete = (): boolean => {
    const template = getTemplateByType(ticket.type);
    if (!template) return false;

    for (const step of template.steps) {
      for (const field of step.fields) {
        const value = getFieldValue(field.id);
        if (field.required) {
          if (field.type === 'PHOTOS') {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              return false;
            }
          } else {
            if (!value) {
              return false;
            }
          }
        }
      }
    }
    return true;
  };

  const handleFinish = async () => {
    if (ticket.type === 'corrective') {
      // Check for multiple photos support
      const hasBefore = ticket.beforePhotoUrl || (ticket.beforePhotoUrls && ticket.beforePhotoUrls.length > 0);
      const hasAfter = ticket.afterPhotoUrl || (ticket.afterPhotoUrls && ticket.afterPhotoUrls.length > 0);

      if (!ticket.rootCause || !ticket.solution || !hasBefore || !hasAfter) {
        toast.error("Please complete all fields and photos.");
        return;
      }
    } else if (ticket.type === 'planned') {
      if (!ticket.feedback || (!ticket.feedbackPhotoUrls || ticket.feedbackPhotoUrls.length === 0)) {
        toast.error("Please provide feedback and at least one photo.");
        return;
      }
    } else if (ticket.type === 'problem') {
      if (!ticket.solution || !ticket.estimatedResolutionTime || (!ticket.problemPhotoUrls || ticket.problemPhotoUrls.length === 0)) {
        toast.error("Please provide solution, estimated resolution date, and photos.");
        return;
      }
    } else {
      // Validate all steps completed for other types
      const allCompleted = ticket.steps?.every(s => s.completed);
      if (!allCompleted) {
        toast.error("Please complete all steps before finishing.");
        return;
      }
    }

    try {
      await api.submitTicketForReview(ticket.id);
      // 重新获取工单详情以获取最新状态
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.success("Work submitted for review.");
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error("Failed to submit work for review");
    }
  };

  const handleConfirm = async () => {
    try {
      await api.completeTicket(ticket.id);
      // 重新获取工单详情以获取最新状态
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.success("Ticket confirmed and closed.");
    } catch (error) {
      console.error("Failed to confirm:", error);
      toast.error("Failed to confirm ticket");
    }
  };

  const handleReject = async () => {
    try {
      await api.declineTicket(ticket.id, "审核不通过，请修改后重新提交");
      // 重新获取工单详情以获取最新状态
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.error("Work rejected. Please check steps and resubmit.");
    } catch (error) {
      console.error("Failed to reject ticket:", error);
      toast.error("Failed to reject ticket");
    }
  };

  // Render Logic for the Action Area
  const renderSummary = () => (
    <div className="w-full bg-white p-4 rounded-lg border border-slate-200 text-left text-sm space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Steps Completed:</span>
          <span className="font-medium">{ticket.steps?.length || 0}/{ticket.steps?.length || 0}</span>
        </div>
        {ticket.type !== 'problem' && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500">Departed:</span>
              <span
                className="font-medium">{ticket.history?.departedAt ? new Date(ticket.history.departedAt).toLocaleTimeString() : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Arrived:</span>
              <span
                className="font-medium">{ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : '-'}</span>
            </div>
          </>
        )}
      </div>

      {/* Preventive Maintenance Summary */}
      {ticket.type === 'preventive' && ticket.steps && (
        <div className="space-y-3 pt-2 border-t">
          <h4 className="font-medium text-slate-900 text-xs uppercase tracking-wider">Findings</h4>
          {ticket.steps.map(step => (
            <div key={step.id} className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{step.label}</span>
                {step.status === 'pass' &&
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5">Pass</Badge>}
                {step.status === 'fail' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 h-5">Not Pass</Badge>}
                {step.status === 'na' && <Badge variant="outline" className="bg-slate-50 text-slate-500 h-5">N/A</Badge>}
              </div>
              {step.status === 'fail' && (
                <div className="bg-red-50/50 p-2 rounded border border-red-100 mt-1">
                  <div className="font-medium text-red-800 mb-1">Cause: {step.cause}</div>
                  <div className="flex flex-wrap gap-2">
                    {(step.beforePhotoUrls || (step.beforePhotoUrl ? [step.beforePhotoUrl] : [])).map((url, i) => (
                      <img key={`before-${i}`} src={url} className="w-10 h-10 rounded object-cover border" title="Before"/>
                    ))}
                    {(step.afterPhotoUrls || (step.afterPhotoUrl ? [step.afterPhotoUrl] : [])).map((url, i) => (
                      <img key={`after-${i}`} src={url} className="w-10 h-10 rounded object-cover border" title="After"/>
                    ))}
                  </div>
                </div>
              )}
              {step.status === 'pass' && (step.photoUrls || step.photoUrl) && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {(step.photoUrls || (step.photoUrl ? [step.photoUrl] : [])).map((url, i) => (
                    <img key={i} src={url} className="w-10 h-10 rounded object-cover border" title="Evidence"/>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Corrective Maintenance Summary */}
      {ticket.type === 'corrective' && (
        <div className="space-y-3 pt-2 border-t text-xs">
          <div className="space-y-1">
            <span className="font-medium text-slate-900 block">Root Cause:</span>
            <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.rootCause}</p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-slate-900 block">Solution:</span>
            <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.solution}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {(ticket.beforePhotoUrls || (ticket.beforePhotoUrl ? [ticket.beforePhotoUrl] : [])).map((url, i) => (
              <div key={`before-${i}`} className="space-y-1">
                <span className="text-[10px] text-slate-500 block">Before {i + 1}</span>
                <img src={url} className="w-20 h-20 rounded object-cover border"/>
              </div>
            ))}
            {(ticket.afterPhotoUrls || (ticket.afterPhotoUrl ? [ticket.afterPhotoUrl] : [])).map((url, i) => (
              <div key={`after-${i}`} className="space-y-1">
                <span className="text-[10px] text-slate-500 block">After {i + 1}</span>
                <img src={url} className="w-20 h-20 rounded object-cover border"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planned Maintenance Summary */}
      {ticket.type === 'planned' && (
        <div className="space-y-3 pt-2 border-t text-xs">
          <div className="space-y-1">
            <span className="font-medium text-slate-900 block">Feedback:</span>
            <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.feedback}</p>
          </div>
          {ticket.feedbackPhotoUrls && ticket.feedbackPhotoUrls.length > 0 && (
            <div className="space-y-1">
              <span className="font-medium text-slate-900 block">Photos:</span>
              <div className="flex flex-wrap gap-2">
                {ticket.feedbackPhotoUrls.map((url, i) => (
                  <img key={i} src={url} className="w-20 h-20 rounded object-cover border"/>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Problem Management Summary */}
      {ticket.type === 'problem' && (
        <div className="space-y-3 pt-2 border-t text-xs">
          <div className="space-y-1">
            <span className="font-medium text-slate-900 block">Solution:</span>
            <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.solution}</p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-slate-900 block">Est. Resolution:</span>
            <p className="text-slate-600 bg-slate-50 p-2 rounded">
              {ticket.estimatedResolutionTime ? new Date(ticket.estimatedResolutionTime).toLocaleString() : '-'}
            </p>
          </div>
          {ticket.problemPhotoUrls && ticket.problemPhotoUrls.length > 0 && (
            <div className="space-y-1">
              <span className="font-medium text-slate-900 block">Photos:</span>
              <div className="flex flex-wrap gap-2">
                {ticket.problemPhotoUrls.map((url, i) => (
                  <img key={i} src={url} className="w-20 h-20 rounded object-cover border"/>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderWorkflow = () => {
    switch (ticket.status) {
      case 'open':
        return (
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <Zap className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">New Opportunity</h3>
              <p className="text-blue-700 max-w-sm">This ticket is available. Accept it to start the workflow.</p>
            </div>
            <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700" onClick={handleGrabOrder}>
              Accept & Assign to Me
            </Button>
          </div>
        );

      case 'assigned':
        return (
          <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
              <Navigation className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">Ready to Depart?</h3>
              <p className="text-indigo-700 max-w-sm">Confirm when you are leaving for the site.</p>
            </div>
            <Button size="lg" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700" onClick={handleDepart}>
              Departure Now
            </Button>
          </div>
        );

      case 'departed':
        return (
          <div className="p-6 bg-orange-50 border border-orange-100 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2">
              <MapPin className="w-6 h-6 animate-pulse"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900">En Route</h3>
              <p className="text-orange-700 max-w-sm">You are on the way to {ticket.location}.</p>
              <p className="text-xs text-orange-600 mt-2 font-mono">Departed
                at: {ticket.history?.departedAt ? new Date(ticket.history.departedAt).toLocaleTimeString() : 'Just now'}</p>
            </div>
            <Button size="lg" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700" onClick={handleArrive}>
              I Have Arrived
            </Button>
          </div>
        );

      case 'arrived':
        // Dynamic form for Corrective, Planned, Problem types
        const template = getTemplateByType(ticket.type);
        if (template && (ticket.type === 'corrective' || ticket.type === 'planned' || ticket.type === 'problem')) {
          const typeColors = {
            corrective: {
              bg: 'bg-orange-50',
              border: 'border-orange-100',
              iconBg: 'bg-orange-100',
              iconColor: 'text-orange-600',
              titleColor: 'text-orange-900',
              subTitleColor: 'text-orange-700',
              btnColor: 'bg-orange-600 hover:bg-orange-700'
            },
            planned: {
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              iconBg: 'bg-blue-100',
              iconColor: 'text-blue-600',
              titleColor: 'text-blue-900',
              subTitleColor: 'text-blue-700',
              btnColor: 'bg-blue-600 hover:bg-blue-700'
            },
            problem: {
              bg: 'bg-rose-50',
              border: 'border-rose-100',
              iconBg: 'bg-rose-100',
              iconColor: 'text-rose-600',
              titleColor: 'text-rose-900',
              subTitleColor: 'text-rose-700',
              btnColor: 'bg-rose-600 hover:bg-rose-700'
            }
          };
          const colors = typeColors[ticket.type];
          const IconComponent = ticket.type === 'corrective' ? Wrench : ticket.type === 'planned' ? CalendarDays : HelpCircle;

          return (
            <div className="space-y-6">
              <div className={`flex items-center justify-between ${colors.bg} p-4 rounded-lg ${colors.border}`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center ${colors.iconColor}`}>
                    <IconComponent className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${colors.titleColor}`}>On Site - {template.name}</h3>
                    <p className={`text-xs ${colors.subTitleColor}`}>Arrived
                      at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                  </div>
                </div>
              </div>

              {ticket.type === 'problem' && ticket.relatedTicketId && (
                <Button
                  variant="outline"
                  className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                  onClick={() => onViewRelatedTicket?.(ticket.relatedTicketId)}
                >
                  <Wrench className="w-4 h-4"/>
                  View Related Corrective Ticket
                  <ArrowRight className="w-4 h-4 ml-auto"/>
                </Button>
              )}

              <div className="space-y-6 p-1">
                <div className="space-y-4">
                  {template.steps[0]?.fields.map(field => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={getFieldValue(field.id)}
                      onChange={handleFieldChange}
                      ticketId={template.steps[0].id}
                      loadingImage={loadingImage}
                      onAddPhoto={handleAddPhoto}
                    />
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className={`w-full ${isFormComplete() ? colors.btnColor : 'bg-slate-300 cursor-not-allowed'}`}
                onClick={handleFinish}
                disabled={!isFormComplete()}
              >
                Finish {ticket.type === 'problem' ? 'Management' : 'Maintenance'}
              </Button>
            </div>
          );
        }

        if (ticket.type === 'preventive') {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">On Site - Preventive Maintenance</h3>
                    <p className="text-xs text-green-700">Arrived
                      at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4"/>
                  Maintenance Checklist
                </h3>

                <div className="space-y-4">
                  {ticket.steps?.map((step) => (
                    <div key={step.id}
                         className={`border rounded-xl p-4 transition-all ${step.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-900">{step.label}</label>
                          {step.completed &&
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>}
                        </div>

                        <ToggleGroup type="single" value={step.status || ''}
                                     onValueChange={(val) => handlePreventiveStepUpdate(step.id, {status: val as any})}
                                     className="justify-start">
                          <ToggleGroupItem value="pass" aria-label="Pass"
                                           className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700 gap-2">
                            <ThumbsUp className="w-4 h-4"/> Pass
                          </ToggleGroupItem>
                          <ToggleGroupItem value="fail" aria-label="Not Pass"
                                           className="data-[state=on]:bg-red-100 data-[state=on]:text-red-700 gap-2">
                            <ThumbsDown className="w-4 h-4"/> Not Pass
                          </ToggleGroupItem>
                          <ToggleGroupItem value="na" aria-label="N/A"
                                           className="data-[state=on]:bg-slate-100 data-[state=on]:text-slate-700 gap-2">
                            <MinusCircle className="w-4 h-4"/> N/A
                          </ToggleGroupItem>
                        </ToggleGroup>

                        {step.status === 'pass' && (
                          <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            <PhotoUploader
                              stepId={step.id}
                              fieldPrefix="photo"
                              isCorrectiveOrPlanned={false}
                              existingPhotos={step.photoUrls || (step.photoUrl ? [step.photoUrl] : [])}
                              label="Evidence Photos"
                              loadingImage={loadingImage}
                              onAddPhoto={handleAddPhoto}
                            />
                          </div>
                        )}

                        {step.status === 'fail' && (
                          <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            <Textarea
                              placeholder="Describe the cause of failure..."
                              value={step.cause || ''}
                              onChange={(e) => handlePreventiveStepUpdate(step.id, {cause: e.target.value})}
                              className="text-sm min-h-[80px]"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <PhotoUploader
                                stepId={step.id}
                                fieldPrefix="beforePhoto"
                                isCorrectiveOrPlanned={false}
                                existingPhotos={step.beforePhotoUrls || (step.beforePhotoUrl ? [step.beforePhotoUrl] : [])}
                                label="Before"
                                loadingImage={loadingImage}
                                onAddPhoto={handleAddPhoto}
                              />
                              <PhotoUploader
                                stepId={step.id}
                                fieldPrefix="afterPhoto"
                                isCorrectiveOrPlanned={false}
                                existingPhotos={step.afterPhotoUrls || (step.afterPhotoUrl ? [step.afterPhotoUrl] : [])}
                                label="After"
                                loadingImage={loadingImage}
                                onAddPhoto={handleAddPhoto}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className={`w-full ${ticket.steps?.every(s => s.completed) ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
                onClick={handleFinish}
                disabled={!ticket.steps?.every(s => s.completed)}
              >
                Finish Maintenance
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <ShieldCheck className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">On Site - Work in Progress</h3>
                  <p className="text-xs text-green-700">Arrived
                    at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4"/>
                Required Steps
              </h3>

              <div className="space-y-4">
                {ticket.steps?.map((step, index) => (
                  <div key={step.id}
                       className={`border rounded-xl p-4 transition-all ${step.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`step-${step.id}`}
                        checked={step.completed}
                        disabled
                        className={`mt-1 ${step.completed ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 opacity-100" : ""}`}
                      />
                      <div className="flex-1 space-y-3">
                        <label
                          htmlFor={`step-${step.id}`}
                          className={`text-sm font-medium leading-none block transition-colors ${step.completed ? 'text-green-700' : 'text-slate-900'}`}
                        >
                          {step.label}
                        </label>

                        {!step.completed && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Textarea
                              placeholder="Add notes/description..."
                              value={step.description || ''}
                              onChange={(e) => handleStepDescription(step.id, e.target.value)}
                              className="text-sm min-h-[80px]"
                            />
                            <div className="flex items-center justify-between gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-2 h-9"
                                onClick={() => handleAddPhoto('gallery', step.id, 'photo')}
                                disabled={loadingImage === step.id}
                              >
                                <Camera className="w-3 h-3"/>
                                {step.photoUrl ? 'Retake Photo' : 'Add Photo'}
                              </Button>

                              <Button
                                size="sm"
                                className="text-xs gap-2 h-9 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStepToggle(step.id, true)}
                              >
                                <CheckCircle2 className="w-3 h-3"/>
                                Complete
                              </Button>
                            </div>

                            {step.location && (
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
                                <MapPin className="w-3 h-3"/>
                                Loc: {step.location}
                              </div>
                            )}
                          </div>
                        )}

                        {step.photoUrl && (
                          <div className="mt-2 relative rounded-lg overflow-hidden border aspect-video w-full max-w-[200px]">
                            <img src={step.photoUrl} alt="Step evidence" className="w-full h-full object-cover"/>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                              {step.timestamp && new Date(step.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className={`w-full ${ticket.steps?.every(s => s.completed) ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
              onClick={handleFinish}
              disabled={!ticket.steps?.every(s => s.completed)}
            >
              Finish Work
            </Button>
          </div>
        );

      case 'review':
        return (
          <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
              <AlertCircle className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Pending Confirmation</h3>
              <p className="text-purple-700 max-w-sm">Work is finished. Waiting for system/admin confirmation.</p>
            </div>

            {renderSummary()}

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" size="lg" className="flex-1 gap-2 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={handleReject}>
                <X className="w-4 h-4"/>
                Reject
              </Button>
              <Button variant="outline" size="lg" className="flex-1 gap-2 border-purple-200 text-purple-700 hover:bg-purple-100"
                      onClick={handleConfirm}>
                <ShieldCheck className="w-4 h-4"/>
                Confirm
              </Button>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="p-6 bg-green-50 border border-green-100 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <CheckCircle2 className="w-8 h-8"/>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900">Work Completed</h3>
              <p className="text-green-700">Great job! This ticket is now closed.</p>
              <p className="text-xs text-green-600 mt-2">Completed
                at: {ticket.history?.completedAt ? new Date(ticket.history.completedAt).toLocaleString() : '-'}</p>
            </div>

            {renderSummary()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 md:border-l">

        {/* Header */}
        <div className="p-4 md:p-6 border-b flex items-start justify-between bg-slate-50 safe-area-top">
          <div className="space-y-1 flex-1 mr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs text-slate-500">
                {ticket.id}
              </Badge>
              <Badge variant={getPriorityColor(ticket.priority)}>
                {ticket.priority} {t.priority}
              </Badge>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTicketTypeColor(ticket.type)}`}>
                {getTicketTypeIcon(ticket.type)}
                {getTicketTypeLabel(ticket.type)}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 leading-tight">
              {ticket.title}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-200 shrink-0">
            <X className="w-5 h-5 text-slate-500"/>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6">

            {/* Active Workflow Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderWorkflow()}
            </div>

            <Separator/>

            {/* Details & Info */}
            <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity">
              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"/>
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Location</h3>
                  <p className="text-sm text-slate-600">{ticket.location || "No location specified"}</p>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5"/>
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">{t.reportedBy}</div>
                  <div className="flex items-center gap-2 text-sm font-medium truncate">
                    <User className="w-3 h-3 text-slate-400 shrink-0"/>
                    <span className="truncate">{ticket.requester}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">{t.reportedAt}</div>
                  <div className="flex items-center gap-2 text-sm font-medium truncate">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0"/>
                    <span className="truncate">
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                        </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">{t.tags}</div>
                  <div className="flex flex-wrap gap-1">
                    {ticket.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-600">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
