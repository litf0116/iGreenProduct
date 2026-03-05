import React, {useState} from "react";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "../ui/sheet";
import {Camera, Image as ImageIcon} from "lucide-react";
import {getFullImageUrl} from "../../lib/api";

// Photo Uploader Component - Independent component to avoid Hooks rules violation
interface PhotoUploaderProps {
  stepId: string;
  fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' | 'evidencePhoto';
  isCorrectiveOrPlanned: boolean;
  existingPhotos: string[];
  label: string;
  loadingImage: string | null;
  onAddPhoto: (source: 'camera' | 'gallery', stepId: string, fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' | 'evidencePhoto', isCorrectiveOrPlanned?: boolean) => void;
}

export function PhotoUploader({
                                stepId,
                                fieldPrefix,
                                isCorrectiveOrPlanned,
                                existingPhotos,
                                label,
                                loadingImage,
                                onAddPhoto
                              }: PhotoUploaderProps) {
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const singularField = `${fieldPrefix}Url`;
  const loadingKey = stepId + singularField;
  const isLoading = loadingImage === loadingKey;

  return (
    <div className="space-y-2">
      {label && <div className="text-xs font-medium text-slate-500">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {existingPhotos.map((url, idx) => (
          <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
          <img src={getFullImageUrl(url)} className="w-full h-full object-cover" alt="Evidence"/>
          </div>
        ))}
        <Sheet open={photoSheetOpen} onOpenChange={setPhotoSheetOpen}>
          <SheetTrigger asChild>
            <button type="button"
                    className="cursor-pointer w-20 h-20 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
              ) : (
                <>
                  <Camera className="w-5 h-5 mb-1"/>
                  <span className="text-[10px]">Add</span>
                </>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-2xl border-t bg-white px-0 pb-0 z-200 w-100%">
            <SheetHeader className="border-b border-slate-200 pb-4 px-4">
              <SheetTitle className="text-center text-lg font-medium text-slate-900">添加照片</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 py-2">
              <button
                onClick={() => {
                  onAddPhoto('camera', stepId, fieldPrefix, isCorrectiveOrPlanned);
                  setPhotoSheetOpen(false);
                }}
                className="flex items-center gap-4 w-full px-6 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-indigo-600"/>
                </div>
                <span className="text-base font-medium text-slate-800">拍摄照片</span>
              </button>
              <button
                onClick={() => {
                  onAddPhoto('gallery', stepId, fieldPrefix, isCorrectiveOrPlanned);
                  setPhotoSheetOpen(false);
                }}
                className="flex items-center gap-4 w-full px-6 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-indigo-600"/>
                </div>
                <span className="text-base font-medium text-slate-800">从相册选择</span>
              </button>
            </div>
            <div className="px-4 pb-8 pt-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setPhotoSheetOpen(false)}
                className="w-full py-3.5 bg-white border border-slate-300 shadow-sm text-slate-700 font-semibold rounded-xl transition-colors active:bg-slate-100"
              >
                取消
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}