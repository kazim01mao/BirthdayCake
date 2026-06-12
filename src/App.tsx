import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PolaroidCard from './components/PolaroidCard';
import ParticleCakeScene from './components/ParticleCakeScene';
import { Sparkles, Heart, Gift, Volume2, VolumeX, ArrowRight, Camera, HelpCircle, MailOpen, ArrowLeft } from 'lucide-react';
import SelfieCamera from './components/SelfieCamera';
import { getCardConfig } from './cardConfig';

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isExtinguished, setIsExtinguished] = useState<boolean>(false);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  
  // URL Customizer State
  const [name, setName] = useState<string>('');
  const [blessing, setBlessing] = useState<string>('');

  // Audio configuration (optional premium ambient track selection)
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const celebrationTimerRef = React.useRef<number | null>(null);

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

    return () => {
      if (celebrationTimerRef.current !== null) {
        window.clearTimeout(celebrationTimerRef.current);
      }
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
    if (celebrationTimerRef.current !== null) {
      window.clearTimeout(celebrationTimerRef.current);
    }
    celebrationTimerRef.current = window.setTimeout(() => {
      setStep(3);
    }, 1600);
  };

  const handleReset = () => {
    // Reset all states back to stage 1 to restart the ceremony
    setPhoto(null);
    setIsExtinguished(false);
    setIsCardOpen(false);
    if (celebrationTimerRef.current !== null) {
      window.clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }
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
            <span className="text-cyan-neon">-0.25°</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>ORIENTATION_GAMMA</span>
            <span className="text-cyan-neon">0.12°</span>
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

      {/* WATERMARK LOGO BRANDING */}
      <div className="absolute top-5 left-6 z-30 pointer-events-none flex items-center gap-1.5 opacity-80">
        <Sparkles className="w-5 h-5 text-gold-300 animate-pulse" />
        <span className="font-serif italic text-gold-100 tracking-wider text-[11px]">
          Happy birthday!
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
            className="absolute inset-0 flex flex-col justify-center items-center px-2 xs:px-3 sm:px-4 overflow-y-auto py-3 sm:py-8 z-20 min-h-screen"
          >
            <div className="text-center max-w-[90vw] xs:max-w-sm sm:max-w-md mb-3 sm:mb-5 flex-shrink-0">
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif tracking-wide text-gold-200 font-bold drop-shadow-xl select-text leading-tight py-1">
                Happy Birthday!
              </h1>
            </div>

            <div className="w-full max-w-[95vw] xs:max-w-sm sm:max-w-lg px-1 flex-shrink-0">
              <SelfieCamera onCapture={handleCapturePhoto} />
            </div>
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
             className="absolute inset-0 pointer-events-none z-10 flex items-start justify-center pt-[18vh] sm:pt-[22vh] md:pt-[25vh]"
           >
             {/* Ambient Screen Header overlay */}
             <div className="w-full text-center px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-flex flex-col items-center"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-gold-200 font-bold tracking-wide drop-shadow-xl whitespace-pre-line">
                  {getCardConfig(name).step2Title}
                </h2>
              </motion.div>
            </div>

            {/* Back button - top right */}
            <div className="absolute top-4 xs:top-5 right-4 xs:right-5 sm:right-6 pointer-events-auto z-20">
              <button
                onClick={handleReset}
                className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gold-200/60 hover:text-gold-200 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                aria-label="返回"
              >
                <ArrowLeft className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
              </button>
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
             className="absolute inset-0 flex flex-col justify-between p-3 sm:p-5 z-10 pointer-events-none overflow-y-auto pt-[12vh] sm:pt-[15vh] md:pt-[18vh]"
          >
            {/* Back button - top right */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-6 pointer-events-auto z-20">
              <button
                onClick={() => { setIsCardOpen(false); setIsExtinguished(false); setStep(2); }}
                className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gold-200/60 hover:text-gold-200 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                aria-label="返回"
              >
                <ArrowLeft className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
              </button>
            </div>

             {/* Top Glowing Title text */}
             <div className="w-full text-center">
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="space-y-2 sm:space-y-3 px-2 sm:px-4"
              >
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif text-gold-200 tracking-wide font-bold drop-shadow-xl select-text py-1 sm:py-2 leading-tight px-1">
                  願主賜恩典於你！
                </h1>

                <p className="text-xs sm:text-sm md:text-base text-gray-300/90 max-w-[90vw] xs:max-w-xs sm:max-w-md mx-auto font-sans leading-relaxed pt-1 sm:pt-2 px-2">
                  在新的一歲裡，恩典滿滿，每日都有與主同行的美好~
                </p>
              </motion.div>
            </div>

             {/* Bottom floating button overlay */}
             <div className="w-full pb-20 xs:pb-24 sm:pb-28 flex flex-col items-center pointer-events-auto flex-shrink-0">
              <motion.button
                id="btn-open-birthday-card"
                onClick={() => setIsCardOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="py-2 xs:py-2.5 sm:py-3 px-4 xs:px-5 sm:px-8 bg-transparent border border-gold-300 text-gold-300 hover:bg-gold-400/10 hover:text-gold-200 font-serif font-bold text-[10px] xs:text-[11px] sm:text-xs tracking-[0.1em] xs:tracking-[0.12em] sm:tracking-[0.15em] uppercase rounded-full shadow-[0_0_20px_rgba(212,171,89,0.15)] flex items-center gap-1 xs:gap-1.5 cursor-pointer transition-all duration-300"
              >
                <MailOpen className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-gold-300 flex-shrink-0" />
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
            config={getCardConfig(name)}
            onClose={() => setIsCardOpen(false)}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
