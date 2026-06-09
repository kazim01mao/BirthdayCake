import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PolaroidCard from './components/PolaroidCard';
import ParticleCakeScene from './components/ParticleCakeScene';
import { Sparkles, Heart, Gift, Volume2, VolumeX, ArrowRight, Camera, HelpCircle, MailOpen } from 'lucide-react';
import SelfieCamera from './components/SelfieCamera';

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isExtinguished, setIsExtinguished] = useState<boolean>(false);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  
  // Real-time telemetry simulation
  const [gyroBeta, setGyroBeta] = useState<number>(0);
  const [gyroGamma, setGyroGamma] = useState<number>(0);

  // URL Customizer State
  const [name, setName] = useState<string>('');
  const [blessing, setBlessing] = useState<string>('');

  // Audio configuration (optional premium ambient track selection)
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Parse URL queries for custom greetings
    const params = new URLSearchParams(window.location.search);
    const queryName = params.get('name') || params.get('Name') || '親愛的壽星';
    const queryBlessing = params.get('blessing') || params.get('Blessing') || 
      '願你眼裏有光，心中有愛，一歲有一歲的芬芳。願璀璨星河皆為你閃爍，吹滅蠟燭的那一刻，所有的溫柔與美好都將如期而至。生日快樂！';
    
    setName(queryName);
    setBlessing(queryBlessing);

    // Prepare soft luxury background piano chime music
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav'); // simple clean magic chime sound

    // Listen to device orientation to feed the telemetry HUD in real-time
    const updateOrientationHUD = (e: DeviceOrientationEvent) => {
      if (e.beta !== null) setGyroBeta(Math.round(e.beta * 100) / 100);
      if (e.gamma !== null) setGyroGamma(Math.round(e.gamma * 100) / 100);
    };

    window.addEventListener('deviceorientation', updateOrientationHUD);
    return () => {
      window.removeEventListener('deviceorientation', updateOrientationHUD);
    };
  }, []);

  const handleCapturePhoto = (capturedPhoto: string) => {
    setPhoto(capturedPhoto);
    // Smooth transition to stage 2
    setStep(2);
    
    // Play warm magical chime
    try {
      audioRef.current?.play();
    } catch (e) {
      console.log("Audio play blocked by browser policy");
    }
  };

  const handleCandleExtinguished = () => {
    setIsExtinguished(true);
    // Automatically transition to step 3 layout adjustments
    setStep(3);
  };

  const handleReset = () => {
    // Reset all states back to stage 1 to restart the ceremony
    setPhoto(null);
    setIsExtinguished(false);
    setIsCardOpen(false);
    setStep(1);
  };

  return (
    <div className="relative w-screen h-screen bg-[#020202] text-gray-100 overflow-hidden select-none font-sans">
      
      {/* VIGNETTE SHADOW FILTER FOR IMMERSIVE DEPTH */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />

      {/* BACKGROUND 3D WEBGL PARTICLE WORLD LAYER */}
      {step >= 2 && (
        <div className={`absolute inset-0 w-full h-full z-0 transition-all duration-1000 ${
          isCardOpen ? 'filter blur-md brightness-[0.25]' : ''
        }`}>
          <ParticleCakeScene 
            step={step}
            isExtinguished={isExtinguished}
            onBlowTriggered={handleCandleExtinguished}
          />
        </div>
      )}

      {/* STAGE STATUS HUD BAR (Top Right) - Hidden on mobile */}
      <div className="absolute top-5 right-6 z-30 pointer-events-none hidden lg:flex items-center gap-2">
        <div className="badge badge-cyan px-2 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-mono tracking-widest flex items-center gap-1 uppercase bg-black/40">
          <span className="w-1 h-1 rounded-full bg-cyan-neon animate-pulse" />
          CAM_LIVE
        </div>
        <div className="badge badge-pink px-2 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-mono tracking-widest flex items-center gap-1 uppercase bg-black/40">
          <span className="w-1 h-1 rounded-full bg-pink-neon animate-pulse" />
          GYRO_SYNC
        </div>
        <div className="badge badge-gold px-2 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-mono tracking-widest flex items-center gap-1 uppercase bg-black/40">
          <span className="w-1 h-1 rounded-full bg-gold-350" />
          BLOOM_ACTIVE
        </div>
      </div>

      {/* SYSTEM TELEMETRY HUD SENSOR GRID (Bottom Left) */}
      {step >= 2 && !isCardOpen && (
        <div className="absolute left-6 bottom-6 z-30 pointer-events-none font-mono text-[10px] text-gray-400 space-y-1.5 hidden sm:block bg-black/35 p-3.5 rounded-xl border border-white/5 backdrop-blur-sm max-w-[210px]">
          <div className="text-[9px] text-gold-300 font-bold uppercase tracking-wider mb-1 border-b border-white/10 pb-1">
            Telemetry Sensors
          </div>
          <div className="flex justify-between gap-4">
            <span>ORIENTATION_BETA</span>
            <span className="text-cyan-neon">{gyroBeta !== 0 ? `${gyroBeta}°` : '-0.25°'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>ORIENTATION_GAMMA</span>
            <span className="text-cyan-neon">{gyroGamma !== 0 ? `${gyroGamma}°` : '0.12°'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>POST_BLOOM</span>
            <span>1.80</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>PARTICLES_CYN</span>
            <span className="text-pink-neon">154,200</span>
          </div>
        </div>
      )}

      {/* LUXURY WATERMARK LOGO BRANDING */}
      <div className="absolute top-5 left-6 z-30 pointer-events-none flex items-center gap-1.5 opacity-80">
        <Sparkles className="w-5 h-5 text-gold-300 animate-pulse" />
        <span className="font-serif italic text-gold-100 tracking-wider text-[11px] uppercase">
          GRAND LUXURY 3D EXPERIMENT
        </span>
      </div>

      {/* STAGE CONTAINER FLOW */}
      <AnimatePresence mode="wait">
        
        {/* ================= PAGE 1: SELFIE START ================= */}
        {step === 1 && (
          <motion.div
            key="page-1-selfie"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col justify-center items-center px-3 sm:px-4 overflow-y-auto py-6 sm:py-10 z-20"
          >
            {/* Elegant Background ambient decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 md:w-[500px] h-64 sm:h-96 md:h-[500px] rounded-full bg-gold-400/5 blur-3xl pointer-events-none" />

            <div className="text-center max-w-md mb-6 sm:mb-8">
              <div className="text-[9px] sm:text-[10px] font-mono text-gold-300 tracking-[0.3em] uppercase mb-1">
                MEMOIR ENGINE · EST 2026
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-wide text-transparent bg-gradient-to-b from-white via-gold-100 to-gold-300 bg-clip-text font-bold mb-3 sm:mb-4 drop-shadow-xl select-text leading-tight uppercase">
                璀璨星河生日 केक
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed max-w-xs mx-auto text-center font-sans mt-2 sm:mt-3">
                一場融合 3D WebGL、環境感應、與煙火效果的頂奢生日驚喜。
              </p>
            </div>

            {/* Selfie component with built-in camera request and fallbacks */}
            <SelfieCamera onCapture={handleCapturePhoto} />
          </motion.div>
        )}

        {/* ================= PAGE 2: EXPLORE CAKE ================= */}
        {step === 2 && (
          <motion.div
            key="page-2-exploration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 pointer-events-none z-10"
          >
            {/* Ambient Screen Header overlay */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full text-center px-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-flex flex-col items-center gap-1.5"
              >
                <div className="px-3 py-1 bg-gold-400/5 border border-gold-300/20 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-neon rounded-full animate-ping" />
                  <span className="text-[9px] font-mono tracking-widest text-cyan-neon uppercase">3D RENDER ENGINE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-white/95 mt-1 tracking-wider uppercase">
                  法式金粉粒子蛋糕
                </h2>
                <div className="text-[10px] font-mono tracking-[0.25em] text-gold-300/85 uppercase">
                  WISHING YOU A RADIANT YEAR AHEAD
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ================= PAGE 3: BLOWOUT CELEBRATION ================= */}
        {step === 3 && (
          <motion.div
            key="page-3-celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10 pointer-events-none"
          >
            {/* Top Glowing Title text */}
            <div className="w-full text-center pt-16 sm:pt-20 md:pt-24">
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="space-y-2 sm:space-y-3 md:space-y-4 px-3 sm:px-4"
              >
                <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-[8px] sm:text-[10px] font-mono tracking-widest text-pink-300 uppercase whitespace-nowrap">
                  <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-400 flex-shrink-0" />
                  <span>儀式吹熄成功</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-white tracking-tight font-bold neon-glow-text select-text py-1 sm:py-2 leading-tight">
                  Happy Birthday<br className="sm:hidden" /> {name}!
                </h1>
                
                <div className="text-[8px] sm:text-[10px] font-mono tracking-[0.25em] text-gold-300 uppercase whitespace-normal sm:whitespace-nowrap">
                  WISHING YOU A RADIANT YEAR AHEAD
                </div>

                <p className="text-[10px] sm:text-xs text-gray-300 max-w-sm mx-auto font-sans leading-relaxed pt-1 sm:pt-2">
                  ✨ 燭光已逝，星河漫天。祝願你的生活璀璨閃耀。
                </p>
              </motion.div>
            </div>

            {/* Bottom floating button overlay */}
            <div className="w-full pb-6 sm:pb-10 flex flex-col items-center pointer-events-auto">
              <motion.button
                id="btn-open-birthday-card"
                onClick={() => setIsCardOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="py-3 sm:py-4 px-6 sm:px-10 bg-transparent border border-gold-300 text-gold-300 hover:bg-gold-400/10 hover:text-gold-200 font-serif font-bold text-xs sm:text-sm tracking-[0.18em] uppercase rounded-full shadow-[0_0_20px_rgba(212,171,89,0.15)] flex items-center gap-2 cursor-pointer transition-all duration-300"
              >
                <MailOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-300 flex-shrink-0" />
                <span className="whitespace-nowrap">打開生日賀卡</span>
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* POLAROID CARD MODAL POPUP */}
      <AnimatePresence>
        {isCardOpen && photo && (
          <PolaroidCard
            photo={photo}
            name={name}
            blessing={blessing}
            onClose={() => setIsCardOpen(false)}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

