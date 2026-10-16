import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Mic, FileText, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PhotoUploader } from '../components/PhotoUploader';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { TextReporter } from '../components/TextReporter';
import { LocationPicker } from '../components/LocationPicker';
import { AnalysisStepper } from '../components/AnalysisStepper';
import { ComplaintPreview } from '../components/ComplaintPreview';
import { api } from '../services/api';
import { AnalyzeResponse } from '../types';
import { toast } from 'sonner';

type InputMode = 'photo' | 'voice' | 'text';

export const Report: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode state
  const initialMode = (searchParams.get('mode') as InputMode) || 'photo';
  const [mode, setMode] = useState<InputMode>(initialMode);

  // Form states
  const [textInput, setTextInput] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  // Dynamic Location states - null by default to allow EXIF, GPS, or text extraction
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationSource, setLocationSource] = useState<string | null>(null);
  const [areaText, setAreaText] = useState<string>('');

  // Pipeline states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessData, setSentSuccessData] = useState<{
    reference_id: string;
    authority_name: string;
    authority_email: string | null;
    status: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const urlMode = searchParams.get('mode') as InputMode;
    if (urlMode && ['photo', 'voice', 'text'].includes(urlMode)) {
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleLocationChange = (lat: number, lon: number, source: string, desc?: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationSource(source);
    if (desc) setAreaText(desc);
  };

  const handleAnalyze = async () => {
    // Validate that input was provided
    if (mode === 'text' && !textInput.trim()) {
      toast.error('Please describe the problem before submitting.');
      return;
    }
    if (mode === 'photo' && !photoBase64) {
      toast.error('Please upload or snap a photo of the civic issue.');
      return;
    }
    if (mode === 'voice' && !audioBase64) {
      toast.error('Please record a voice note first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await api.analyze({
        input_type: mode,
        text: textInput,
        image_base64: photoBase64 || undefined,
        audio_base64: audioBase64 || undefined,
        latitude,
        longitude,
        location_source: locationSource || undefined,
        area: areaText || undefined
      });

      // Brief pause to let the stepper animation finish
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisResult(response);
      }, 1500);
    } catch (err: any) {
      setIsAnalyzing(false);
      toast.error(err.message || t('errors.generic'));
    }
  };

  const handleSendComplaint = async () => {
    if (!analysisResult) return;
    setIsSending(true);
    try {
      const res = await api.sendComplaint(analysisResult.complaint_id);
      setIsSending(false);
      setSentSuccessData({
        reference_id: res.reference_id,
        authority_name: res.authority_name,
        authority_email: res.authority_email,
        status: res.status,
        message: res.message
      });
      toast.success(res.message);
    } catch (err: any) {
      setIsSending(false);
      toast.error(err.message || 'Failed to dispatch email.');
    }
  };

  const handleSupportDuplicate = async () => {
    if (!analysisResult?.duplicate.duplicate_of) return;
    try {
      const res = await api.supportComplaint(analysisResult.duplicate.duplicate_of);
      toast.success(res.message);
      navigate('/complaints');
    } catch (err: any) {
      toast.error(err.message || 'Error supporting report');
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (sentSuccessData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1F2937]">
            {t('result.sent_success')}
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {sentSuccessData.message}
          </p>
        </div>

        <div className="civic-card p-5 text-left space-y-3 bg-white">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <span className="text-xs text-gray-500 font-medium">Reference ID</span>
            <span className="text-sm font-mono font-bold text-[#006600]">
              {sentSuccessData.reference_id}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <span className="text-xs text-gray-500 font-medium">Authority</span>
            <span className="text-xs font-semibold text-gray-800">
              {sentSuccessData.authority_name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Email Recipient</span>
            <span className="text-xs font-mono text-gray-800">
              {sentSuccessData.authority_email || 'Phone Helpline Only'}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="civic-btn-primary w-full sm:w-auto py-3 px-8 text-sm"
          >
            {t('result.view_complaints')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">
          {t('report.title')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          "You tell us what is wrong. We figure out who needs to know."
        </p>
      </div>

      {/* Analysis In-Progress View */}
      {isAnalyzing && (
        <div className="py-8">
          <AnalysisStepper />
        </div>
      )}

      {/* Analysis Result Review */}
      {!isAnalyzing && analysisResult && (
        <ComplaintPreview
          data={analysisResult}
          onSend={handleSendComplaint}
          onSupportDuplicate={handleSupportDuplicate}
          onCorrectTranscript={(transcript) => {
            setTextInput(transcript);
            setAudioBase64(null);
            setMode('text');
            setAnalysisResult(null);
            toast.info('Review the recognized text, correct it if needed, then submit again.');
          }}
          onEdit={() => setAnalysisResult(null)}
          sending={isSending}
        />
      )}

      {/* Main Form Input */}
      {!isAnalyzing && !analysisResult && (
        <div className="space-y-6">
          {/* Mode Selector Segmented Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-gray-200/70 border border-gray-200">
            <button
              type="button"
              onClick={() => setMode('photo')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'photo'
                  ? 'bg-white text-[#006600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              {t('modes.photo')}
            </button>
            <button
              type="button"
              onClick={() => setMode('voice')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'voice'
                  ? 'bg-white text-[#006600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mic className="w-4 h-4" />
              {t('modes.voice')}
            </button>
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'text'
                  ? 'bg-white text-[#006600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              {t('modes.text')}
            </button>
          </div>

          {/* Active Mode Form Field */}
          <div>
            {mode === 'photo' && (
              <PhotoUploader
                onPhotoSelected={(b64, gps) => {
                  setPhotoBase64(b64);
                  if (gps) {
                    setLatitude(gps.lat);
                    setLongitude(gps.lon);
                    setLocationSource('exif');
                  }
                }}
                onGpsPrompt={() => {
                  // Will trigger in LocationPicker
                }}
              />
            )}

            {mode === 'voice' && (
              <VoiceRecorder
                onAudioRecorded={(b64) => setAudioBase64(b64)}
                onAudioCleared={() => setAudioBase64(null)}
              />
            )}

            {mode === 'text' && (
              <div className="civic-card p-5">
                <TextReporter
                  value={textInput}
                  onChange={setTextInput}
                />
              </div>
            )}
          </div>

          {/* Location Picker Section */}
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            areaText={areaText}
            onLocationChange={handleLocationChange}
          />

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              className="civic-btn-primary w-full py-3.5 text-base font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t('report.submit_button')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
