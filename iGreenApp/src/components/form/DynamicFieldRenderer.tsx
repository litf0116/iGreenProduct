import {Textarea} from "../ui/textarea";
import {Input} from "../ui/input";
import React from "react";
import {TemplateFieldValue, isFieldType} from "../../lib/data";
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

  const fieldType = field.type.toUpperCase();

  if (isFieldType(fieldType, 'TEXT')) {
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
  }

  if (isFieldType(fieldType, 'NUMBER')) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">{field.name}</label>
        <Input
          type="number"
          placeholder={field.description || `Enter ${field.name.toLowerCase()}...`}
          value={value !== undefined ? value : (field.value || '')}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      </div>
    );
  }

  if (isFieldType(fieldType, 'DATE')) {
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
  }

  if (isFieldType(fieldType, 'LOCATION')) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">{field.name}</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Select location..."
            value={value?.address || (value && typeof value === 'string' ? value : '')}
            readOnly
            className="bg-slate-50 cursor-pointer"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  onChange(field.id, {
                    latitude,
                    longitude,
                    address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
                  });
                },
                (error) => {
                  console.error('Location error:', error);
                  alert('Failed to get location. Please enable GPS.');
                },
                { enableHighAccuracy: true }
              );
            }}
          />
        </div>
        <p className="text-xs text-slate-500">Tap to capture current GPS location</p>
      </div>
    );
  }

  if (isFieldType(fieldType, 'PHOTOS')) {
    const fieldPrefix = fieldPrefixMap[field.id] || 'problemPhoto';
    console.log('[DEBUG] DynamicFieldRenderer PHOTOS - field.id:', field.id, 'fieldPrefix:', fieldPrefix);
    console.log('[DEBUG] DynamicFieldRenderer PHOTOS - value:', value);

    const photoArray = Array.isArray(value) ? value : [];

    return (
      <PhotoUploader
        stepId={String(ticketId)}
        fieldPrefix={fieldPrefix}
        isCorrectiveOrPlanned={true}
        existingPhotos={photoArray}
        label={field.name}
        loadingImage={loadingImage}
        onAddPhoto={onAddPhoto}
      />
    );
  }

  if (isFieldType(fieldType, 'INSPECTION')) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">{field.name}</label>
        <InspectionField
          value={value !== undefined ? value : field.value}
          onChange={(val) => onChange(field.id, val)}
          stepId={String(ticketId)}
          loadingImage={loadingImage}
          onAddPhoto={onAddPhoto}
        />
      </div>
    );
  }

  return null;
}
