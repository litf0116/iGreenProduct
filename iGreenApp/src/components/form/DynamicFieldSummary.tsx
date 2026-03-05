import React from 'react';
import { Badge } from "../ui/badge";
import { TemplateFieldValue, InspectionValue, LocationValue, isFieldType } from '../../lib/data';
import { getFullImageUrl } from '../../lib/api';

interface DynamicFieldSummaryProps {
  field: TemplateFieldValue;
  stepName?: string;
}

export function DynamicFieldSummary({ field, stepName }: DynamicFieldSummaryProps) {
  if (field.value === undefined || field.value === null || field.value === '') {
    return null;
  }

  const displayName = isFieldType(field.type, 'INSPECTION') ? (stepName || field.name) : field.name;

  if (isFieldType(field.type, 'TEXT') || isFieldType(field.type, 'NUMBER')) {
    return (
      <div className="space-y-1">
        <span className="font-medium text-slate-900 block">{displayName}:</span>
        <p className="text-slate-600 bg-slate-50 p-2 rounded text-xs whitespace-pre-wrap">
          {String(field.value)}
        </p>
      </div>
    );
  }

  if (isFieldType(field.type, 'DATE')) {
    const dateValue = field.value;
    let displayDate = String(dateValue);

    if (typeof dateValue === 'string') {
      try {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          displayDate = parsedDate.toLocaleString();
        }
      } catch (e) {
      }
    }

    return (
      <div className="space-y-1">
        <span className="font-medium text-slate-900 block">{displayName}:</span>
        <p className="text-slate-600 bg-slate-50 p-2 rounded text-xs">{displayDate}</p>
      </div>
    );
  }

  if (isFieldType(field.type, 'PHOTOS')) {
    const photos = Array.isArray(field.value) ? field.value : [field.value];
    const validPhotos = photos.filter(Boolean);

    if (validPhotos.length === 0) {
      return null;
    }

    return (
      <div className="space-y-1">
        <span className="font-medium text-slate-900 block">{displayName}:</span>
        <div className="flex flex-wrap gap-2">
          {validPhotos.map((url, i) => (
            <img
              key={i}
              src={getFullImageUrl(String(url))}
              className="w-20 h-20 rounded object-cover border"
              alt={`${displayName} ${i + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isFieldType(field.type, 'INSPECTION')) {
    const inspectionValue = field.value as InspectionValue | undefined;
    if (!inspectionValue?.status) {
      return null;
    }

    return (
      <div className="space-y-1">
        <span className="font-medium text-slate-900 block">{displayName}:</span>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {inspectionValue.status === 'pass' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5">Pass</Badge>
            )}
            {inspectionValue.status === 'fail' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 h-5">Not Pass</Badge>
            )}
            {inspectionValue.status === 'na' && (
              <Badge variant="outline" className="bg-slate-50 text-slate-500 h-5">N/A</Badge>
            )}
          </div>

          {inspectionValue.status === 'fail' && (
            <div className="bg-red-50/50 p-2 rounded border border-red-100 mt-1">
              {inspectionValue.cause && (
                <div className="font-medium text-red-800 mb-1 text-xs">Cause: {inspectionValue.cause}</div>
              )}
              <div className="flex flex-wrap gap-2">
                {(inspectionValue.beforePhotos || []).map((url, i) => (
                  <img key={`before-${i}`} src={getFullImageUrl(url)} className="w-10 h-10 rounded object-cover border" title="Before"/>
                ))}
                {(inspectionValue.afterPhotos || []).map((url, i) => (
                  <img key={`after-${i}`} src={getFullImageUrl(url)} className="w-10 h-10 rounded object-cover border" title="After"/>
                ))}
              </div>
            </div>
          )}

          {inspectionValue.status === 'pass' && inspectionValue.evidencePhotos && inspectionValue.evidencePhotos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {inspectionValue.evidencePhotos.map((url, i) => (
                <img key={i} src={getFullImageUrl(url)} className="w-10 h-10 rounded object-cover border" title="Evidence"/>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isFieldType(field.type, 'LOCATION')) {
    const locationValue = field.value as LocationValue | string;
    const displayValue = typeof locationValue === 'object'
      ? `${locationValue.address} (${locationValue.latitude}, ${locationValue.longitude})`
      : String(locationValue);

    return (
      <div className="space-y-1">
        <span className="font-medium text-slate-900 block">{displayName}:</span>
        <p className="text-slate-600 bg-slate-50 p-2 rounded text-xs">{displayValue}</p>
      </div>
    );
  }

  if (isFieldType(field.type, 'SIGNATURE')) {
    return (
      <div className="space-y-1">
        <span className="font-medium text-slate-900 block">{displayName}:</span>
        {field.value && (
          <img
            src={getFullImageUrl(String(field.value))}
            className="h-16 border rounded"
            alt="Signature"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="font-medium text-slate-900 block">{displayName}:</span>
      <p className="text-slate-600 bg-slate-50 p-2 rounded text-xs">{String(field.value)}</p>
    </div>
  );
}