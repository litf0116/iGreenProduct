import React from "react";
import {Textarea} from "../ui/textarea";
import {ToggleGroup, ToggleGroupItem} from "../ui/toggle-group";
import {MinusCircle, ThumbsDown, ThumbsUp} from "lucide-react";
import {InspectionValue} from "../../lib/data";
import {PhotoUploader} from "./PhotoUploader";


// =====================
// Inspection Field Component
// Fixed implementation: Pass / Fail / N/A
// With conditional fields based on status
// =====================

interface InspectionFieldProps {
  value?: InspectionValue;
  onChange: (value: InspectionValue) => void;
  stepId: string;
  loadingImage?: string | null;
  onAddPhoto: (source: 'camera' | 'gallery', stepId: string, fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' | 'evidencePhoto', isCorrectiveOrPlanned?: boolean) => void;
}

function InspectionField({
  value,
  onChange,
  stepId,
  loadingImage,
  onAddPhoto
}: InspectionFieldProps) {
  const currentStatus = value?.status;

  const handleStatusChange = (status: 'pass' | 'fail' | 'na') => {
    // When status changes, reset the conditional fields
    const newValue: InspectionValue = { status };
    
    if (status === 'pass') {
      newValue.evidencePhotos = value?.evidencePhotos || [];
    } else if (status === 'fail') {
      newValue.cause = value?.cause || '';
      newValue.beforePhotos = value?.beforePhotos || [];
      newValue.afterPhotos = value?.afterPhotos || [];
    }
    // na 不需要额外字段
    
    onChange(newValue);
  };

  const options = [
    { value: 'pass', label: 'Pass', icon: ThumbsUp, colorClass: 'data-[state=on]:bg-green-100 data-[state=on]:text-green-700' },
    { value: 'fail', label: 'Not Pass', icon: ThumbsDown, colorClass: 'data-[state=on]:bg-red-100 data-[state=on]:text-red-700' },
    { value: 'na', label: 'N/A', icon: MinusCircle, colorClass: 'data-[state=on]:bg-slate-100 data-[state=on]:text-slate-700' }
  ];

  return (
    <div className="space-y-3">
      <ToggleGroup
        type="single"
        value={currentStatus || ''}
        onValueChange={(val) => val && handleStatusChange(val as 'pass' | 'fail' | 'na')}
        className="justify-start"
      >
        {options.map(opt => (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className={`${opt.colorClass} gap-2`}
          >
            <opt.icon className="w-4 h-4"/>
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Conditional fields based on status */}
      {currentStatus === 'pass' && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <PhotoUploader
            stepId={stepId}
            fieldPrefix="evidencePhoto"
            isCorrectiveOrPlanned={false}
            existingPhotos={value?.evidencePhotos || []}
            label="Evidence Photos"
            loadingImage={loadingImage || null}
            onAddPhoto={onAddPhoto || (() => {})}
          />
        </div>
      )}

      {currentStatus === 'fail' && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
          <Textarea
            placeholder="Describe the cause of failure..."
            value={value?.cause || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...value, status: 'fail', cause: e.target.value })}
            className="text-sm min-h-[80px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <PhotoUploader
              stepId={stepId}
              fieldPrefix="beforePhoto"
              isCorrectiveOrPlanned={false}
              existingPhotos={value?.beforePhotos || []}
              label="Before"
              loadingImage={loadingImage || null}
              onAddPhoto={onAddPhoto || (() => {})}
            />
            <PhotoUploader
              stepId={stepId}
              fieldPrefix="afterPhoto"
              isCorrectiveOrPlanned={false}
              existingPhotos={value?.afterPhotos || []}
              label="After"
              loadingImage={loadingImage || null}
              onAddPhoto={onAddPhoto || (() => {})}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InspectionField;
