import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Square, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioRecorded: (base64Audio: string) => void;
  onAudioCleared: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onAudioRecorded, onAudioCleared }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<'ready' | 'recording' | 'processing' | 'complete' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMessage(null);
    let stream: MediaStream | null = null;
    try {
      setAudioUrl(null);
      onAudioCleared();
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('This browser does not support audio recording. Try a recent version of Chrome, Edge, or Firefox.');
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: { ideal: true },
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
        },
      });
      const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      const mimeType = supportedTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        stream?.getTracks().forEach((track) => track.stop());
        setState('error');
        setErrorMessage('The browser could not record audio. Check microphone access and try again.');
      };

      mediaRecorder.onstop = () => {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const audioType = mediaRecorder.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: audioType });
        stream?.getTracks().forEach((track) => track.stop());

        if (audioBlob.size < 100) {
          setState('error');
          setErrorMessage('No audio was captured. Check that your microphone is connected, then record again.');
          return;
        }

        setAudioUrl(URL.createObjectURL(audioBlob));
        const reader = new FileReader();
        reader.onerror = () => {
          setState('error');
          setErrorMessage('The recording could not be prepared. Please record again.');
        };
        reader.onload = () => {
          if (typeof reader.result !== 'string') {
            setState('error');
            setErrorMessage('The recording could not be prepared. Please record again.');
            return;
          }
          onAudioRecorded(reader.result);
          setState('complete');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(250);
      setState('recording');
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      stream?.getTracks().forEach((track) => track.stop());
      console.error('Audio permission error:', err);
      setState('error');
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
        setErrorMessage('Allow microphone access for this site in your browser settings, then try again.');
      } else if (err?.name === 'NotFoundError') {
        setErrorMessage('No microphone was found. Connect a microphone and try again.');
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t('errors.audio_error'));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState('processing');
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setState('ready');
    setDuration(0);
    onAudioCleared();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="civic-card p-6 text-center space-y-5">
      <div>
        <h4 className="font-semibold text-[#1F2937] text-base mb-1">
          {t('report.voice_title')}
        </h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          {t('report.voice_instruction')}
        </p>
      </div>

      {state === 'ready' && (
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <button
            type="button"
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-[#006600] text-white flex items-center justify-center shadow-lg hover:bg-[#01411C] active:scale-95 transition-all focus:ring-4 focus:ring-[#006600]/30"
            aria-label="Start recording voice note"
          >
            <Mic className="w-9 h-9" />
          </button>
          <span className="text-xs font-medium text-gray-600">
            {t('report.voice_ready')}
          </span>
        </div>
      )}

      {state === 'recording' && (
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <button
            type="button"
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg animate-pulse-recording active:scale-95 transition-all focus:ring-4 focus:ring-red-400/50"
            aria-label="Stop recording voice note"
          >
            <Square className="w-8 h-8 fill-current" />
          </button>
          <div className="space-y-1">
            <div className="text-xl font-mono font-bold text-red-600">
              {formatDuration(duration)}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {t('report.voice_recording')}
            </span>
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="py-8 flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#006600] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500">Processing audio...</span>
        </div>
      )}

      {state === 'complete' && audioUrl && (
        <div className="p-4 bg-gray-50 rounded-xl border border-[#E5E7EB] space-y-4 max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Voice Note Recorded</span>
            </div>
            <span className="text-xs font-mono text-gray-500">
              {formatDuration(duration)}
            </span>
          </div>

          <audio src={audioUrl} controls preload="metadata" className="w-full" aria-label="Recorded voice note playback" />

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={startRecording}
              className="civic-btn-secondary py-2 px-3 text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('report.voice_rerecord')}
            </button>
            <button
              type="button"
              onClick={deleteRecording}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('report.voice_delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>Voice Recording Failed</span>
          </div>
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={startRecording}
            className="civic-btn-secondary text-xs py-1.5 px-3"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
