import {Textarea} from "../ui/textarea";
import {Input} from "../ui/input";
import React from "react";
import {TemplateFieldValue} from "../../lib/data";
import {PhotoUploader} from "./PhotoUploader";
import InspectionField from "./InspectionField";

// =====================
// Dynamic Field Renderer
// =====================

interface DynamicFieldRendererProps {
  field: TemplateFieldValue;
  value?: any;
  onChange: (fieldId: string, value: any) => void;
  ticketId: string;
  loadingImage: string | null;
  onAddPhoto: (source: 'camera' | 'gallery', stepId: string, fieldPrefix?: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' | 'evidencePhoto', isCorrectiveOrPlanned?: boolean) => void;
}

export function DynamicFieldRenderer({field, value, onChange, ticketId, loadingImage, onAddPhoto}: DynamicFieldRendererProps) {
  const fieldPrefixMap: Record<string, 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto'> = {
    'field-before-photos': 'beforePhoto',
    'field-after-photos': 'afterPhoto',
    'field-feedback-photos': 'feedbackPhoto',
    'field-problem-photos': 'problemPhoto'
  };

  switch (field.type) {
    case 'TEXT':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">{field.name}</label>
          <Textarea
            placeholder={field.description || `Enter ${field.name.toLowerCase()}...`}
            value={value !== undefined ? value : (field.value || '')}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={field.config?.multiline ? "min-h-[100px]" : ""}
          />
        </div>
      );

    case 'DATE':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">{field.name}</label>
          <Input
            type="date"
            value={value !== undefined ? value : (field.value || '')}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </div>
      );

    case 'PHOTOS': {
      const fieldPrefix = fieldPrefixMap[field.id] || 'problemPhoto';
      console.log('[DEBUG] DynamicFieldRenderer PHOTOS - field.id:', field.id, 'fieldPrefix:', fieldPrefix);
      console.log('[DEBUG] DynamicFieldRenderer PHOTOS - value:', value);
      return (
        <PhotoUploader
          stepId={String(ticketId)}
          fieldPrefix={fieldPrefix}
          isCorrectiveOrPlanned={true}
          existingPhotos={value !== undefined ? (value || []) : (field.values || [])}
          label={field.name}
          loadingImage={loadingImage}
          onAddPhoto={onAddPhoto}
        />
      );
    }

    case 'INSPECTION':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">{field.name}</label>
          <InspectionField
            value={value !== undefined ? value : field.value}
            onChange={(val) => onChange(field.id, val)}
            ticketId={String(ticketId)}
            stepId={String(ticketId)}
            loadingImage={loadingImage}
            onAddPhoto={onAddPhoto}
          />
        </div>
      );

    default:
      return null;
  }
}
