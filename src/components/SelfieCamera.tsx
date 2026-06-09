import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, Check } from 'lucide-react';

interface SelfieCameraProps {
  onCapture: (base64Photo: string) => void;
}

export default function SelfieCamera({ onCapture }: SelfieCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Default elegant portrait placeholders if the webcam is blocked
  const presetImages = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80"
  ];

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setPermissionError(null);
    setLoading(true);
    try {
      if (stream) {
        stopCamera();
      }
      
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera access failed or denied:", err);
      setPermissionError(
        "無法調用攝像頭。可能是因為設備不支援、權限被拒絕，或是處在安全沙箱環境中。"
      );
      setCameraActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas to display matching aspect ratio
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Mirror the photo for selfie comfort
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset scale
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

  const selectPreset = async (url: string) => {
    try {
      setLoading(true);
      // Fetch and convert image to base64 to ensure it is stored locally without CORS issues
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
        stopCamera();
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      // Fallback directly to URL if blob conversion fails
      setCapturedPhoto(url);
      stopCamera();
      setLoading(false);
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-morphism rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
      {/* Decorative Golden Ambient Lights */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gold-400 opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-pink-500 opacity-10 blur-3xl pointer-events-none"></div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-300/20 bg-gold-400/5 mb-3">
          <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold-200">First Step · 核心儀式</span>
        </div>
        <h2 className="text-3xl font-serif text-gold-200 tracking-wide font-semibold">生日紀念寫真</h2>
        <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
          請拍攝或上傳一張當下的紀念照，這張照片將會永久珍藏在您的專屬生日賀卡中。
        </p>
      </div>

      {/* Video / Photo Preview Stage */}
      <div className="w-full aspect-[4/3] bg-black/40 rounded-2xl border border-gold-300/10 overflow-hidden relative shadow-inner">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 space-y-3">
            <div className="w-10 h-10 border-2 border-gold-300 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gold-100 font-mono">載入中 / 處理中...</p>
          </div>
        )}

        {!capturedPhoto && cameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {!capturedPhoto && !cameraActive && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Camera className="w-12 h-12 text-gold-300/40 animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gold-200">攝像頭不可用</p>
              <p className="text-[11px] text-gray-500 max-w-[280px]">
                請上傳本地照片，或在下方選用精美預設模特圖片完成體驗。
              </p>
            </div>
          </div>
        )}

        {capturedPhoto && (
          <img
            src={capturedPhoto}
            alt="Snap Preview"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Canvas used for capture */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Control Actions */}
      <div className="w-full mt-6 space-y-4">
        {!capturedPhoto ? (
          <div className="space-y-4">
            {cameraActive ? (
              <button
                id="btn-shutter-capture"
                onClick={capturePhoto}
                type="button"
                className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-300 hover:from-gold-600 hover:to-gold-400 text-black font-semibold rounded-xl shadow-lg shadow-gold-500/10 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                拍攝紀念照
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="btn-retry-camera"
                  onClick={startCamera}
                  type="button"
                  className="py-3 px-4 rounded-xl border border-gold-300/20 hover:border-gold-300/50 bg-gold-400/5 text-xs text-gold-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  嘗試開啟相機
                </button>
                <button
                  id="btn-upload-file"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="py-3 px-4 rounded-xl border border-pink-500/20 hover:border-pink-500/50 bg-pink-500/5 text-xs text-pink-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  上傳自訂照片
                </button>
              </div>
            )}

            {/* Error Message & Present Preset Selections */}
            {permissionError && (
              <div className="space-y-3">
                <p className="text-[10px] text-red-400/80 leading-relaxed bg-red-950/20 p-3 rounded-lg border border-red-900/30 font-sans text-center">
                  數位沙箱與瀏覽器權限限制，建議直接上傳本地精美照片，或快速點選下列法式高質感人像模板以繼續生日驚喜儀式：
                </p>
                <div className="flex justify-center gap-4 mt-2">
                  {presetImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectPreset(img)}
                      className="w-14 h-14 rounded-full overflow-hidden border-2 border-gold-400/20 hover:border-gold-300 active:scale-95 transition-all duration-300 shadow-md relative group cursor-pointer"
                    >
                      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={`Preset ${idx+1}`} />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-gold-200" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              id="confirm-photo"
              onClick={confirmPhoto}
              type="button"
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              確認此紀念照，開始生日儀式
            </button>
            <button
              id="retake-photo"
              onClick={retakePhoto}
              type="button"
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer border border-white/5"
            >
              重新拍攝 / 重新上傳
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
