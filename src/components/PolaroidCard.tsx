import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, X, Check } from 'lucide-react';
import { CardConfig } from '../cardConfig';

interface PolaroidCardProps {
  photo: string;
  config: CardConfig;
  onClose: () => void;
  onReset: () => void;
}

export default function PolaroidCard({ photo, config, onClose, onReset }: PolaroidCardProps) {
  const [saved, setSaved] = useState(false);

  const saveToPhotos = async () => {
    try {
      // Create a canvas to composite the polaroid card
      const cardEl = document.getElementById('polaroid-card');
      if (!cardEl) return;

      // Use html-to-image approach: capture the card as a blob
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cardEl, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      if (!blob) {
        throw new Error('Failed to generate image');
      }

      // Try native share / download on supported platforms
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `birthday-card-${Date.now()}.png`, { type: 'image/png' });
        const shareData = { files: [file], title: '生日紀念賀卡' };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            return;
          } catch {
            // Fallback to download if share fails
          }
        }
      }

      // Download fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `birthday-card-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      // Fallback: open in new tab
      window.open(photo, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
      />

      {/* Polaroid Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 20, rotate: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        id="polaroid-card"
        className="relative w-full max-w-[92vw] xs:max-w-sm bg-white p-3 xs:p-4 sm:p-5 pb-5 xs:pb-6 sm:pb-7 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-stone-200 flex flex-col items-center select-none z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-stone-400 hover:text-stone-850 p-1.5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photo Container with subtle shadow and border */}
        <div className="w-full aspect-square bg-stone-950 overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center relative">
          <img
            src={photo}
            alt="Birthday Memory"
            className="w-full h-full object-cover polaroid-sepia transition-all duration-700"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          {/* Polaroid flash glossy look */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        </div>

        {/* Text Area */}
        <div className="w-full mt-5 text-center text-stone-800 px-1 flex flex-col items-center">
          {/* Configurable Title */}
          <h3 className="font-serif text-lg xs:text-xl sm:text-2xl tracking-wide font-bold text-stone-900">
            {config.title}
          </h3>

          {/* Configurable Body */}
          <div className="max-h-[80px] xs:max-h-[100px] overflow-y-auto pr-1 text-[11px] xs:text-xs text-stone-600 font-sans italic leading-relaxed text-center scrollbar-thin mt-2.5">
            {config.body}
          </div>

          <div className="w-24 h-[1px] bg-stone-200 my-3" />

          {/* Configurable Timestamp */}
          <p className="font-mono text-[9px] text-stone-400 tracking-widest uppercase">
            {config.timestamp}
          </p>
        </div>

        {/* Control Button - Save to local photos */}
        <div className="w-full mt-6">
          <button
            onClick={saveToPhotos}
            className="w-full flex items-center justify-center gap-2 py-2.5 xs:py-3 px-4 bg-stone-900 hover:bg-black text-white rounded-lg text-xs xs:text-sm font-sans tracking-wide transition-all duration-200 active:scale-95 cursor-pointer border border-stone-800"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-400 flex-shrink-0" />
                <span>已儲存</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" />
                <span>存儲至本地相冊</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}