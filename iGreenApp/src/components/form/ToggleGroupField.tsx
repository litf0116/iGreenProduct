import {TemplateField, ToggleGroupConfig} from "../../lib/data";
import {ToggleGroup, ToggleGroupItem} from "../ui/toggle-group";
import React from "react";
import {MinusCircle, ThumbsDown, ThumbsUp} from "lucide-react";


// =====================
// ToggleGroup Field Component
// =====================
const TOGGLE_ICONS: Record<string, React.ComponentType<any>> = {
  ThumbsUp,
  ThumbsDown,
  MinusCircle
};

interface ToggleGroupFieldProps {
  field: TemplateField;
  value: string;
  onChange: (value: string) => void;
}


function ToggleGroupField({field, value, onChange}: ToggleGroupFieldProps) {
  const config = field.config as ToggleGroupConfig;
  const options = config?.options || [];

  return (
    <ToggleGroup
      type="single"
      value={value || ''}
      onValueChange={(val) => val && onChange(val)}
      className="justify-start"
    >
      {options.map(opt => {
        const IconComponent = opt.icon ? TOGGLE_ICONS[opt.icon] : null;
        const colorClass = opt.color === 'green' ? 'data-[state=on]:bg-green-100 data-[state=on]:text-green-700' :
          opt.color === 'red' ? 'data-[state=on]:bg-red-100 data-[state=on]:text-red-700' :
            'data-[state=on]:bg-slate-100 data-[state=on]:text-slate-700';
        return (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className={`${colorClass} gap-2`}
          >
            {IconComponent && <IconComponent className="w-4 h-4"/>}
            {opt.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

export default ToggleGroupField;