import React, {useEffect, useState} from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarDays,
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
import {ToggleGroup, ToggleGroupItem} from "./ui/toggle-group";
import {
  getPriorityColor,
  getTicketTypeColor,
  getTicketTypeIcon,
  getTicketTypeLabel,
  InspectionValue,
  TemplateFieldValue,
  Ticket,
  isFieldType
} from '../lib/data';
import {toast} from "sonner";
import {useLanguage} from './LanguageContext';
import {api} from '../lib/api';
import {pickPhoto, takePhoto} from '../lib/camera';
import {getTemplateByType} from '../config/fieldConfigs';
import {DynamicFieldRenderer} from "./form/DynamicFieldRenderer";
import {DynamicFieldSummary} from "./form/DynamicFieldSummary";
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

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.isCorrectiveOrPlanned) {
        const reverseFieldPrefixMap: Record<string, string> = {
          'beforePhoto': 'field-before-photos',
          'afterPhoto': 'field-after-photos',
          'feedbackPhoto': 'field-feedback-photos',
          'problemPhoto': 'field-problem-photos'
        };
        const fieldId = reverseFieldPrefixMap[detail.fieldPrefix] || detail.fieldPrefix;
        setLocalFieldValues(prev => ({
          ...prev,
          [fieldId]: [...(Array.isArray(prev[fieldId]) ? prev[fieldId] : []), detail.url]
        }));
      }
    };
    window.addEventListener('mock-photo-upload', handler);
    return () => window.removeEventListener('mock-photo-upload', handler);
  }, []);

  // 当票据变化时，重置本地字段值
  useEffect(() => {
    setLocalFieldValues({});
  }, [ticket?.id]);

  if (!ticket) return null;

  // =====================
  // Template Data Initialization
  // =====================

  // Initialize templateData from template configuration
  const ensureTemplateData = () => {
    // For preventive type, ensure templateData exists
    if (ticket.type === 'preventive') {
      if (!ticket.templateData || !ticket.templateData.steps || ticket.templateData.steps.length === 0) {
        const template = getTemplateByType('preventive');
        if (!template) return;

        // Initialize templateData with empty values
        const initialSteps = template.steps.map(step => ({
          ...step,
          description: '',
          completed: false,
          fields: step.fields.map(field => ({
            ...field,
            value: isFieldType(field.type, 'INSPECTION') ? undefined : (isFieldType(field.type, 'PHOTOS') ? [] : '')
          })) as TemplateFieldValue[]
        }));

        onUpdateTicket(ticket.id, {
          templateData: {
            id: template.id,
            name: template.name,
            type: template.type,
            steps: initialSteps
          }
        });
      }
    }
  };

  // Get steps from templateData
  const getSteps = () => {
    return ticket.templateData?.steps || [];
  };
  // Check if a step is completed based on its INSPECTION field value
  const isStepCompleted = (stepId: string): boolean => {
    const steps = getSteps();
    const step = steps.find(s => s.id === stepId);
    if (!step) return false;

    const inspectionField = step.fields.find(f => isFieldType(f.type, 'INSPECTION'));
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
    const steps = getSteps();
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
      ensureTemplateData();
      const updatedTicket = await api.getTicket(ticket.id);
      onUpdateTicket(ticket.id, updatedTicket, {skipApi: true});
      toast.success("Arrival recorded - Start working on steps");
    } catch (error) {
      console.error("Failed to arrive:", error);
      toast.error("Failed to record arrival");
    }
  };

  // Handle inspection field value change (for preventive tickets)
  const handleInspectionChange = (stepId: string, fieldId: string, value: InspectionValue) => {
    const steps = getSteps();
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          completed: isStepCompleted(stepId),
          fields: step.fields.map(field => {
            if (field.id === fieldId) {
              return { ...field, value };
            }
            return field;
          })
        };
      }
      return step;
    });

    if (!ticket.templateData) {
      const template = getTemplateByType(ticket.type);
      if (template) {
        onUpdateTicket(ticket.id, {
          templateData: {
            id: template.id,
            name: template.name,
            type: template.type,
            steps: updatedSteps
          }
        });
      }
    } else {
      onUpdateTicket(ticket.id, {
        templateData: {
          ...ticket.templateData,
          steps: updatedSteps
        }
      });
    }
  };

  // Handle photo upload for templateData structure
  const handleAddPhoto = async (
    source: 'camera' | 'gallery',
    stepId: string,
    fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' | 'evidencePhoto' = 'photo',
    isCorrectiveOrPlanned: boolean = false
  ) => {
    setLoadingImage(stepId + fieldPrefix);
    try {
      console.log('[DEBUG] Starting photo capture, source:', source);
      const photo = source === 'camera' ? await takePhoto() : await pickPhoto();
      console.log('[DEBUG] Photo captured, photo exists:', !!photo);

      if (!photo) {
        console.log('[DEBUG] No photo returned');
        setLoadingImage(null);
        return;
      }

      console.log('[DEBUG] Photo length:', photo.length, 'starts with:', photo.substring(0, 50));
      
      // 直接将dataUrl转换为Blob（Android不支持fetch dataUrl）
      // 解析base64数据
      const arr = photo.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      
      console.log('[DEBUG] Blob created, size:', blob.size, 'type:', blob.type);
      
      const file = new File([blob], `photo-${Date.now()}.jpg`, {type: 'image/jpeg'});
      console.log('[DEBUG] File created, size:', file.size);

      const uploaded = await api.uploadFile(file, fieldPrefix);
      const fullUrl = uploaded.url;
      console.log('[DEBUG] handleAddPhoto - uploaded:', fullUrl);
      console.log('[DEBUG] handleAddPhoto - fieldPrefix:', fieldPrefix);
      console.log('[DEBUG] handleAddPhoto - isCorrectiveOrPlanned:', isCorrectiveOrPlanned);

      if (isCorrectiveOrPlanned) {
        const reverseFieldPrefixMap: Record<string, string> = {
          'beforePhoto': 'field-before-photos',
          'afterPhoto': 'field-after-photos',
          'feedbackPhoto': 'field-feedback-photos',
          'problemPhoto': 'field-problem-photos'
        };

        const fieldId = reverseFieldPrefixMap[fieldPrefix] || fieldPrefix;
        const existingPhotos = localFieldValues[fieldId] || [];
        const newPhotos = Array.isArray(existingPhotos) ? existingPhotos : [];
        setLocalFieldValues(prev => ({
          ...prev,
          [fieldId]: [...newPhotos, fullUrl]
        }));
      } else {
        const steps = getSteps();
        const step = steps.find(s => s.id === stepId);
        if (!step) return;

        const inspectionField = step.fields.find(f => isFieldType(f.type, 'INSPECTION'));
        if (!inspectionField) return;

        const currentValue = inspectionField.value as InspectionValue | undefined;
        const newValue: InspectionValue = currentValue || { status: undefined };

        if (fieldPrefix === 'evidencePhoto') {
          const existingPhotos = currentValue?.evidencePhotos || [];
          newValue.evidencePhotos = [...existingPhotos, fullUrl];
        } else if (fieldPrefix === 'beforePhoto') {
          const existingPhotos = currentValue?.beforePhotos || [];
          newValue.beforePhotos = [...existingPhotos, fullUrl];
        } else if (fieldPrefix === 'afterPhoto') {
          const existingPhotos = currentValue?.afterPhotos || [];
          newValue.afterPhotos = [...existingPhotos, fullUrl];
        }

        handleInspectionChange(stepId, inspectionField.id, newValue);
      }

      toast.success('Photo uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Failed to upload photo';
      toast.error(errorMessage);
      console.log('[DEBUG] Upload failed - source:', source, 'error:', errorMessage);
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
    // 1) 本地缓存
    if (localFieldValues[fieldId] !== undefined) {
      return localFieldValues[fieldId];
    }
    // 2) 模板数据中查找
    if (ticket.templateData?.steps) {
      for (const step of ticket.templateData.steps) {
        const field = step.fields.find((f: any) => f.id === fieldId);
        if (field) {
          // PHOTOS 使用 field.value（通常为 string[]）作为值; 其他类型也通过 field.value 读取
          return field.value;
        }
      }
    }
    // 3) 未找到返回 undefined
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
          if (isFieldType(field.type, 'PHOTOS')) {
            const photoArray = Array.isArray(value) ? value : [];
            if (photoArray.length === 0) {
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
          completed: true,
          fields: step.fields.map(field => {
            if (localFieldValues[field.id] !== undefined) {
              const value = localFieldValues[field.id];
              return {
                ...field,
                value: value,
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
          <span className="font-medium">{ticket.completedStepsCount ?? 0}/{ticket.totalStepsCount ?? 0}</span>
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
      {ticket.type === 'preventive' && ticket.templateData?.steps && (
        <div className="space-y-3 pt-2 border-t">
          <h4 className="font-medium text-slate-900 text-xs uppercase tracking-wider">Findings</h4>
          {ticket.templateData.steps.map((step, stepIndex) => (
            <React.Fragment key={step.id}>
              {step.fields.map((field, fieldIndex) => (
                <div key={`${step.id}-${field.id}`}>
                  <DynamicFieldSummary field={field} stepName={step.name} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Corrective Maintenance Summary */}
      {ticket.type === 'corrective' && ticket.templateData?.steps && (
        <div className="space-y-3 pt-2 border-t text-xs">
          {ticket.templateData.steps.map((step, stepIndex) =>
            step.fields.map((field, fieldIndex) => (
              <div key={`corrective-${stepIndex}-${fieldIndex}`}>
                <DynamicFieldSummary field={field} stepName={step.name} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Planned Maintenance Summary */}
      {ticket.type === 'planned' && ticket.templateData?.steps && (
        <div className="space-y-3 pt-2 border-t text-xs">
          {ticket.templateData.steps.map((step, stepIndex) =>
            step.fields.map((field, fieldIndex) => (
              <div key={`planned-${stepIndex}-${fieldIndex}`}>
                <DynamicFieldSummary field={field} stepName={step.name} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Problem Management Summary */}
      {ticket.type === 'problem' && ticket.templateData?.steps && (
        <div className="space-y-3 pt-2 border-t text-xs">
          {ticket.templateData.steps.map((step, stepIndex) =>
            step.fields.map((field, fieldIndex) => (
              <div key={`problem-${stepIndex}-${fieldIndex}`}>
                <DynamicFieldSummary field={field} stepName={step.name} />
              </div>
            ))
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
              <p className="text-orange-700 max-w-sm">You are on the way to {ticket.siteName || ticket.location}.</p>
              <p className="text-xs text-orange-600 mt-2 font-mono">Departed
                at: {ticket.history?.departedAt ? new Date(ticket.history.departedAt).toLocaleTimeString() : 'Just now'}</p>
            </div>
            <Button size="lg" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700" onClick={handleArrive}>
              I Have Arrived
            </Button>
          </div>
        );

case 'arrived':
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
                  <div className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center ${colors.iconColor}`}>
                    <IconComponent className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${colors.titleColor}`}>On Site - {template.name}</h3>
                    <p className={`text-xs ${colors.subTitleColor}`}>
                      Arrived at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {ticket.type === 'problem' && ticket.relatedTicketId && (
                <Button
                  variant="outline"
                  className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                  onClick={() => onViewRelatedTicket?.(ticket.relatedTicketId || '')}
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
                className={`w-full ${isFormComplete() ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
                onClick={handleFinish}
                disabled={!isFormComplete()}
              >
                Finish Work
              </Button>
            </div>
          );
        }

        if (ticket.type === 'preventive') {
          const steps = getSteps();
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">On Site - Work in Progress</h3>
                    <p className="text-xs text-green-700">
                      Arrived at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="font-medium">{ticket.completedStepsCount ?? 0}/{ticket.totalStepsCount ?? 0}</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4"/>
                  Maintenance Checklist
                </h3>

                <div className="space-y-4">
                  {steps.map((step) => {
                    const inspectionField = step.fields[0];
                    const inspectionValue = inspectionField?.value as InspectionValue;
                    if (!inspectionField || !isFieldType(inspectionField.type, 'INSPECTION')) return null;

                    return (
                      <div key={step.id}
                           className={`border rounded-xl p-4 transition-all ${step.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-900">{step.name}</label>
                            {step.completed &&
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>}
                          </div>

                          <ToggleGroup type="single" value={inspectionValue?.status || ''}
                                       onValueChange={(val) => {
                                         const newValue: InspectionValue = inspectionValue || { status: undefined };
                                         newValue.status = val as 'pass' | 'fail' | 'na';
                                         handleInspectionChange(step.id, inspectionField.id, newValue);
                                       }}
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

                          {inspectionValue?.status === 'pass' && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                              <PhotoUploader
                                stepId={step.id}
                                fieldPrefix="evidencePhoto"
                                isCorrectiveOrPlanned={false}
                                existingPhotos={inspectionValue?.evidencePhotos || []}
                                label="Evidence Photos"
                                loadingImage={loadingImage}
                                onAddPhoto={handleAddPhoto}
                              />
                            </div>
                          )}

                          {inspectionValue?.status === 'fail' && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                              <Textarea
                                placeholder="Describe the cause of failure..."
                                value={inspectionValue?.cause || ''}
                                onChange={(e) => {
                                  const newValue: InspectionValue = { ...inspectionValue, status: 'fail', cause: e.target.value };
                                  handleInspectionChange(step.id, inspectionField.id, newValue);
                                }}
                                className="text-sm min-h-[80px]"
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <PhotoUploader
                                  stepId={step.id}
                                  fieldPrefix="beforePhoto"
                                  isCorrectiveOrPlanned={false}
                                  existingPhotos={inspectionValue?.beforePhotos || []}
                                  label="Before"
                                  loadingImage={loadingImage}
                                  onAddPhoto={handleAddPhoto}
                                />
                                <PhotoUploader
                                  stepId={step.id}
                                  fieldPrefix="afterPhoto"
                                  isCorrectiveOrPlanned={false}
                                  existingPhotos={inspectionValue?.afterPhotos || []}
                                  label="After"
                                  loadingImage={loadingImage}
                                  onAddPhoto={handleAddPhoto}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

        return null;

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
                  <p className="text-sm text-slate-600 font-medium">{ticket.siteName || ticket.location || "No site specified"}</p>
                  {ticket.siteAddress && (
                    <p className="text-xs text-slate-500 mt-0.5">{ticket.siteAddress}</p>
                  )}
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
