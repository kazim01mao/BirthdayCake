import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, X, RotateCcw } from 'lucide-react';

interface PolaroidCardProps {
  photo: string;
  name: string;
  blessing: string;
  onClose: () => void;
  onReset: () => void;
}

export default function PolaroidCard({ photo, name, blessing, onClose, onReset }: PolaroidCardProps) {
  const [copied, setCopied] = useState(false);

  const getShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('name', name);
    url.searchParams.set('blessing', blessing);
    return url.toString();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
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
        className="relative w-full max-w-sm bg-white p-5 pb-7 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-stone-200 flex flex-col items-center select-none z-10"
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
          />
          {/* Polaroid flash glossy look */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        </div>

        {/* Text Area */}
        <div className="w-full mt-5 text-center text-stone-800 px-1 flex flex-col items-center">
          {/* Name Display */}
          <h3 className="font-serif text-xl tracking-wide font-bold text-stone-900">
            {name}'s Special Day
          </h3>

          {/* Blessing Message */}
          <div className="max-h-[100px] overflow-y-auto pr-1 text-xs text-stone-600 font-sans italic leading-relaxed text-center scrollbar-thin mt-2.5">
            "{blessing}"
          </div>

          <div className="w-24 h-[1px] bg-stone-200 my-3" />

          {/* Localized elegant timestamp footer */}
          <p className="font-mono text-[9px] text-stone-400 tracking-widest uppercase">
            2026.06.09 / 06:58 GMT+8
          </p>
        </div>

        {/* Control Button Actions */}
        <div className="w-full mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-stone-900 hover:bg-black text-white rounded text-xs font-mono tracking-wider transition-all duration-200 active:scale-95 cursor-pointer border border-stone-900"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                COPIED
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gold-300" />
                SHARE MAGIC
              </>
            )}
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-transparent hover:bg-stone-50 text-stone-800 rounded text-xs font-mono tracking-wider transition-all duration-200 active:scale-95 cursor-pointer border border-stone-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            RESTART RITUAL
          </button>
        </div>
      </motion.div>
    </div>
  );
}
