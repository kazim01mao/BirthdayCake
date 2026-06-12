import React, { useRef, useState, useEffect } from 'react';
import { Camera, Aperture, Upload, Check, RefreshCw } from 'lucide-react';

interface SelfieCameraProps {
  onCapture: (base64Photo: string) => void;
}

export default function SelfieCamera({ onCapture }: SelfieCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current || !streamRef.current || !cameraActive) return;

    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch((err) => {
      console.warn('Video preview failed to play:', err);
      setError('相機預覽無法播放，請重試或使用相簿上傳。');
      setCameraActive(false);
    });
  }, [cameraActive]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setError(null);
    setLoading(true);
    setFacingMode(mode);
    try {
      if (!window.isSecureContext) {
        throw new Error('相機需要 HTTPS 或 localhost 環境才能使用。');
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('此瀏覽器不支援相機功能。');
      }
      if (streamRef.current) {
        stopCamera();
      }

      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setError(err?.message || '無法調用攝像頭，請檢查相機權限或使用相簿上傳。');
      setCameraActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Mirror for selfie (front camera)
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhoto(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
      {/* Decorative ambient lights */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gold-400 opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-pink-500 opacity-10 blur-3xl pointer-events-none" />

      {/* Camera Preview Box */}
      <div className="w-full aspect-[4/3] bg-black/40 rounded-xl sm:rounded-2xl border border-gold-300/10 overflow-hidden relative shadow-inner">
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 space-y-3">
            <div className="w-10 h-10 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gold-100 font-mono">相機啟動中...</p>
          </div>
        )}

        {/* Live camera preview */}
        {!capturedPhoto && cameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        )}

        {/* Placeholder text when no camera active and no photo captured */}
        {!capturedPhoto && !cameraActive && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
            <Camera className="w-12 h-12 sm:w-14 sm:h-14 text-gold-300/30 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gold-200/70 leading-relaxed max-w-[280px] font-sans">
              請影低「即影即有相片」，或其它生日紀念相
            </p>
          </div>
        )}

        {/* Captured photo preview */}
        {capturedPhoto && (
          <img
            src={capturedPhoto}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}

        {/* Capture button overlay when camera is active */}
        {cameraActive && !capturedPhoto && (
          <button
            onClick={capturePhoto}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white/80 bg-transparent hover:bg-white/10 transition-all duration-200 active:scale-90 cursor-pointer flex items-center justify-center"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400/80 mt-3 text-center leading-relaxed bg-red-950/20 p-2.5 rounded-lg border border-red-900/30 w-full">
          {error}
        </p>
      )}

      {/* Hidden canvas and file input */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Bottom Action Buttons */}
      <div className="w-full mt-4 sm:mt-5 space-y-2 sm:space-y-3">
        {!capturedPhoto ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* 自拍模式 - Front Camera */}
            <button
              onClick={() => startCamera('user')}
              disabled={loading}
              className="py-2.5 sm:py-3 px-2 rounded-lg sm:rounded-xl border border-gold-300/20 hover:border-gold-300/50 bg-gold-400/5 text-gold-200 transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-sans whitespace-nowrap">自拍模式</span>
            </button>

            {/* 拍照模式 - Rear Camera */}
            <button
              onClick={() => startCamera('environment')}
              disabled={loading}
              className="py-2.5 sm:py-3 px-2 rounded-lg sm:rounded-xl border border-cyan-400/20 hover:border-cyan-400/50 bg-cyan-400/5 text-cyan-200 transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Aperture className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-sans whitespace-nowrap">拍照模式</span>
            </button>

            {/* 相簿上傳 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="py-2.5 sm:py-3 px-2 rounded-lg sm:rounded-xl border border-pink-500/20 hover:border-pink-500/50 bg-pink-500/5 text-pink-200 transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-sans whitespace-nowrap">相簿上傳</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={confirmPhoto}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              確認開始生日儀式
            </button>
            <button
              onClick={retakePhoto}
              className="w-full py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              重新拍攝 / 上傳
            </button>
          </div>
        )}
      </div>
    </div>
  );
}