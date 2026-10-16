import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, UploadCloud, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import EXIF from 'exif-js';

interface PhotoUploaderProps {
  onPhotoSelected: (base64: string, exifGps: { lat: number; lon: number } | null) => void;
  onGpsPrompt: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoSelected, onGpsPrompt }) => {
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasExifGps, setHasExifGps] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);

      // Check EXIF GPS client-side using an HTML Image element
      try {
        const img = new Image();
        img.onload = () => {
          try {
            // @ts-ignore
            EXIF.getData(img, function (this: any) {
              // @ts-ignore
              const lat = EXIF.getTag(this, 'GPSLatitude');
              // @ts-ignore
              const lon = EXIF.getTag(this, 'GPSLongitude');
              // @ts-ignore
              const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
              // @ts-ignore
              const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');

              if (lat && lon && lat.length >= 3 && lon.length >= 3) {
                let latitude = lat[0] + lat[1] / 60 + lat[2] / 3600;
                if (String(latRef).toUpperCase().startsWith('S')) latitude = -latitude;

                let longitude = lon[0] + lon[1] / 60 + lon[2] / 3600;
                if (String(lonRef).toUpperCase().startsWith('W')) longitude = -longitude;

                setHasExifGps(true);
                onPhotoSelected(base64, { lat: latitude, lon: longitude });
              } else {
                setHasExifGps(false);
                onPhotoSelected(base64, null);
              }
            });
          } catch (err) {
            setHasExifGps(false);
            onPhotoSelected(base64, null);
          }
        };
        img.src = base64;
      } catch (err) {
        setHasExifGps(false);
        onPhotoSelected(base64, null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setHasExifGps(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />

      {!imagePreview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#006600] bg-[#E8F5E9]/50'
              : 'border-[#E5E7EB] hover:border-[#006600]/60 hover:bg-gray-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#E8F5E9] text-[#006600] flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="font-semibold text-[#1F2937] text-base mb-1">
            {t('report.photo_upload_title')}
          </h4>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
            {t('report.photo_drop')}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="civic-btn-secondary text-xs sm:text-sm py-2"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Upload Photo
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="civic-btn-primary text-xs sm:text-sm py-2"
            >
              <Camera className="w-4 h-4 mr-1.5" />
              {t('report.photo_capture')}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">Supports JPG, PNG, WEBP</p>
        </div>
      ) : (
        <div className="civic-card p-4 space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-[#E5E7EB] max-h-80 bg-black/5 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="Civic issue evidence"
              className="max-h-80 object-contain w-full"
            />
          </div>

          {/* EXIF GPS Status Badge */}
          {hasExifGps === true && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t('report.exif_found')}</span>
            </div>
          )}

          {hasExifGps === false && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="font-semibold">{t('report.exif_not_found')}</span>
              </div>
              <p className="text-amber-700">
                Please verify or pin the issue location below.
              </p>
              <button
                type="button"
                onClick={onGpsPrompt}
                className="text-xs font-bold text-[#006600] underline hover:text-[#01411C]"
              >
                {t('report.use_my_location')}
              </button>
            </div>
          )}

          {/* Action buttons: Replace, Remove */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('report.photo_replace')}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('report.photo_remove')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
