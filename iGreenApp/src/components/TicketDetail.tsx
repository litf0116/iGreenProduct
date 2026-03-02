import React, {useEffect, useState} from 'react';
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
import {
  getPriorityColor,
  getTicketTypeColor,
  getTicketTypeIcon,
  getTicketTypeLabel,
  InspectionValue,
  TemplateFieldValue,
  Ticket,
  TicketStep
} from '../lib/data';
import {toast} from "sonner@2.0.3";
import {useLanguage} from './LanguageContext';
import {api, getFullImageUrl} from '../lib/api';
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
  // 本地状态跟踪动态表单字段值，只在提交审核时发送
  const [localFieldValues, setLocalFieldValues] = useState<Record<string, any>>({});

  // 当票据变化时，重置本地字段值
  useEffect(() => {
    setLocalFieldValues({});
  }, [ticket?.id]);

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

  // Get steps from templateData for preventive tickets
  const getTemplateSteps = () => {
    if (ticket.type === 'preventive' && ticket.templateData?.steps) {
      return ticket.templateData.steps;
    }
    return [];
  };
  // Check if a step is completed based on its INSPECTION field value
  const isStepCompleted = (stepId: string): boolean => {
    const steps = getTemplateSteps();
    const step = steps.find(s => s.id === stepId);
    if (!step) return false;

    const inspectionField = step.fields.find(f => f.type === 'INSPECTION');
    if (!inspectionField) return false;

    const value = inspectionField.value as InspectionValue | undefined;
    if (!value?.status) return false;

    if (value.status === 'na') return true;
    if (value.status === 'pass') {
      return !!(value.evidencePhotos && value.evidencePhotos.length > 0);
    }
    if (value.status === 'fail') {
      return !!(value.cause && value.beforePhotos?.length && value.afterPhotos?.length);
    }
    return false;
  };
  // Check if all steps are completed
  const areAllStepsCompleted = (): boolean => {
    const steps = getTemplateSteps();
    if (steps.length === 0) return true;
    return steps.every(step => isStepCompleted(step.id));
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
      const fullUrl = uploaded.url;
      console.log('[DEBUG] handleAddPhoto - uploaded:', fullUrl);
      console.log('[DEBUG] handleAddPhoto - fieldPrefix:', fieldPrefix);
      console.log('[DEBUG] handleAddPhoto - isCorrectiveOrPlanned:', isCorrectiveOrPlanned);

      if (isCorrectiveOrPlanned) {
        // 更新本地状态 - 使用 fieldPrefix + 'Urls' 作为 key
        const fieldKey = `${fieldPrefix}Urls`;
        console.log('[DEBUG] handleAddPhoto - fieldKey:', fieldKey);
        const existingPhotos = localFieldValues[fieldKey] || (ticket as any)[fieldKey] || [];
        console.log('[DEBUG] handleAddPhoto - existingPhotos before:', existingPhotos);
        setLocalFieldValues(prev => {
          const newValues = [...(prev[fieldKey] || existingPhotos), fullUrl];
          console.log('[DEBUG] handleAddPhoto - new localFieldValues:', newValues);
          return {
            ...prev,
            [fieldKey]: newValues
          };
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
    // 优先从本地状态读取
    console.log('[DEBUG] getFieldValue - fieldId:', fieldId);
    console.log('[DEBUG] getFieldValue - localFieldValues:', localFieldValues);
    // 优先从本地状态读取
    if (localFieldValues[fieldId] !== undefined) {
      console.log('[DEBUG] getFieldValue - found in localFieldValues:', localFieldValues[fieldId]);
      return localFieldValues[fieldId];
    }
    // 检查 fieldPrefix + 'Urls' 格式的 key
    const reverseFieldPrefixMap: Record<string, string> = {
      'field-before-photos': 'beforePhotoUrls',
      'field-after-photos': 'afterPhotoUrls',
      'field-feedback-photos': 'feedbackPhotoUrls',
      'field-problem-photos': 'problemPhotoUrls'
    };
    const fieldKey = reverseFieldPrefixMap[fieldId];
    if (fieldKey && localFieldValues[fieldKey] !== undefined) {
      console.log('[DEBUG] getFieldValue - found in localFieldValues with fieldKey:', fieldKey, localFieldValues[fieldKey]);
      return localFieldValues[fieldKey];
    }
    // 其次从 templateData 中查找
    if (ticket.templateData?.steps) {
      for (const step of ticket.templateData.steps) {
        const field = step.fields.find(f => f.id === fieldId);
        if (field) {
          console.log('[DEBUG] getFieldValue - found in templateData field.value:', field.value);
          return field.value;
        }
      }
    }
    // Fallback 到旧字段（向后兼容）
    const legacyField = FIELD_ID_TO_LEGACY_FIELD[fieldId];
    console.log('[DEBUG] getFieldValue - legacyField:', legacyField);
    if (legacyField) {
      return (ticket as any)[legacyField];
    }
    return undefined;
  };

  // Handle dynamic field value change
  const handleFieldChange = (fieldId: string, value: any) => {
    // 只更新本地状态，不触发 API 调用
    // 提交审核时一次性发送数据
    setLocalFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
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
    // 对于 dynamic form 类型 (corrective, planned, problem)，使用 isFormComplete 验证
    const template = getTemplateByType(ticket.type);
    if (template && (ticket.type === 'corrective' || ticket.type === 'planned' || ticket.type === 'problem')) {
      if (!isFormComplete()) {
        toast.error("Please complete all required fields and photos.");
        return;
      }
    } else {
      // 对于 preventive 等类型，使用 areAllStepsCompleted 验证
      if (!areAllStepsCompleted()) {
        toast.error("Please complete all steps before finishing.");
        return;
      }
    }

    // 合并本地字段值到 templateData
    let templateDataToSubmit = ticket.templateData;
    if (ticket.templateData?.steps && Object.keys(localFieldValues).length > 0) {
      templateDataToSubmit = {
        ...ticket.templateData,
        steps: ticket.templateData.steps.map(step => ({
          ...step,
          fields: step.fields.map(field => {
            if (localFieldValues[field.id] !== undefined) {
              const value = localFieldValues[field.id];
              return {
                ...field,
                ...(Array.isArray(value) ? {values: value} : {value: value}),
                timestamp: new Date().toISOString()
              };
            }
            return field;
          })
        }))
      };
    }

    try {
      await api.submitTicketForReview(ticket.id, templateDataToSubmit);
      // 重新获取工单详情以获取最新状态
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.success("Work submitted for review.");
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error("Failed to submit work for review");
    }
  };

  // Render Logic for the Action Area
  const renderSummary = () => (
    <div className="w-full bg-white p-4 rounded-lg border border-slate-200 text-left text-sm space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Steps Completed:</span>
          <span className="font-medium">{getTemplateSteps().filter(s => isStepCompleted(s.id)).length}/{getTemplateSteps().length}</span>
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
      {ticket.type === 'preventive' && getTemplateSteps().length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <h4 className="font-medium text-slate-900 text-xs uppercase tracking-wider">Findings</h4>
          {getTemplateSteps().map(step => {
            const inspectionField = step.fields.find(f => f.type === 'INSPECTION') as TemplateFieldValue | undefined;
            const inspectionValue = inspectionField?.value as InspectionValue | undefined;
            const status = inspectionValue?.status;

            return (
              <div key={step.id} className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{step.name}</span>
                  {status === 'pass' &&
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5">Pass</Badge>}
                  {status === 'fail' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 h-5">Not Pass</Badge>}
                  {status === 'na' && <Badge variant="outline" className="bg-slate-50 text-slate-500 h-5">N/A</Badge>}
                </div>
                {status === 'fail' && inspectionValue && (
                  <div className="bg-red-50/50 p-2 rounded border border-red-100 mt-1">
                    {inspectionValue.cause && (
                      <div className="font-medium text-red-800 mb-1">Cause: {inspectionValue.cause}</div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(inspectionValue.beforePhotos || []).map((url, i) => (
                        <img key={`before-${i}`} src={url} className="w-10 h-10 rounded object-cover border" title="Before"/>
                      ))}
                      {(inspectionValue.afterPhotos || []).map((url, i) => (
                        <img key={`after-${i}`} src={url} className="w-10 h-10 rounded object-cover border" title="After"/>
                      ))}
                    </div>
                  </div>
                )}
                {status === 'pass' && (inspectionValue?.evidencePhotos || []).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(inspectionValue.evidencePhotos || []).map((url, i) => (
                      <img key={i} src={url} className="w-10 h-10 rounded object-cover border" title="Evidence"/>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
                  {ticket.templateData.steps?.map((step) => (
                    <div key={step.id}
                         className={`border rounded-xl p-4 transition-all ${step.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-900">{step.name}</label>
                          {step.completed &&
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>}
                        </div>

                        <ToggleGroup type="single" value={(step.fields[0].value as InspectionValue).status || ''}
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
                              existingPhotos={(step.fields[0].value as InspectionValue).evidencePhotos || []}
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
                              value={(step.fields[0].value as InspectionValue).cause || ''}
                              onChange={(e) => handlePreventiveStepUpdate(step.id, {cause: e.target.value})}
                              className="text-sm min-h-[80px]"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <PhotoUploader
                                stepId={step.id}
                                fieldPrefix="beforePhoto"
                                isCorrectiveOrPlanned={false}
                                existingPhotos={(step.fields[0].value as InspectionValue).beforePhotos || []}
                                label="Before"
                                loadingImage={loadingImage}
                                onAddPhoto={handleAddPhoto}
                              />
                              <PhotoUploader
                                stepId={step.id}
                                fieldPrefix="afterPhoto"
                                isCorrectiveOrPlanned={false}
                                existingPhotos={(step.fields[0].value as InspectionValue).afterPhotos || []}
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
                className={`w-full ${areAllStepsCompleted() ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
                onClick={handleFinish}
                disabled={!areAllStepsCompleted()}
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
                {ticket.templateData.steps?.map((step, index) => (
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
                          {step.name}
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
                                {step.fields[0].value ? 'Retake Photo' : 'Add Photo'}
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
                            {/* 这里根据配置的表单项来进行数据展示 这里改成如果检查到 location 类型的 field 数据*/}
                            {
                              step.fields.map(field => {
                                if (field.type == "LOCATION") {
                                  return (
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
                                      <MapPin className="w-3 h-3"/>
                                      Loc: {field.value}
                                    </div>
                                  )
                                }
                              })
                            }
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
              className={`w-full ${areAllStepsCompleted() ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
              onClick={handleFinish}
              disabled={!areAllStepsCompleted()}
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
