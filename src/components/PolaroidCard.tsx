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
      const cardEl = document.getElementById('polaroid-card');
      if (!cardEl) return;

      let blob: Blob | null = null;

      // Method 1: Try html-to-image library
      try {
        const { toBlob } = await import('html-to-image');
        blob = await toBlob(cardEl, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
        });
      } catch {
        console.log('html-to-image failed, using canvas fallback');
      }

      // Method 2: Canvas fallback — manually composite the card
      if (!blob) {
        blob = await compositeCardWithCanvas();
      }

      if (!blob) {
        throw new Error('Failed to generate image');
      }

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `birthday-card-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Delay revoke to ensure download starts
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      window.open(photo, '_blank');
    }
  };

  // Canvas-based fallback compositor
  const compositeCardWithCanvas = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        const cardW = 320;
        const cardH = 440;
        canvas.width = cardW * scale;
        canvas.height = cardH * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        ctx.scale(scale, scale);

        // White card background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cardW, cardH);

        // Photo area (square, top portion)
        const photoPadding = 12;
        const photoSize = cardW - photoPadding * 2;
        ctx.save();
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(photoPadding, photoPadding, photoSize, photoSize);
        ctx.drawImage(img, photoPadding, photoPadding, photoSize, photoSize);
        ctx.restore();

        // Title text
        const titleY = photoPadding + photoSize + 18;
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(config.title, cardW / 2, titleY);

        // Body text with line wrapping
        const bodyY = titleY + 20;
        ctx.fillStyle = '#57534e';
        ctx.font = 'italic 11px sans-serif';
        ctx.textAlign = 'center';
        const maxWidth = cardW - 30;
        const lines = wrapText(ctx, config.body, maxWidth);
        lines.forEach((line, i) => {
          ctx.fillText(line, cardW / 2, bodyY + i * 16);
        });

        // Divider line
        const dividerY = bodyY + lines.length * 16 + 8;
        ctx.strokeStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.moveTo(cardW / 2 - 40, dividerY);
        ctx.lineTo(cardW / 2 + 40, dividerY);
        ctx.stroke();

        // Timestamp
        const timestampY = dividerY + 14;
        ctx.fillStyle = '#a8a29e';
        ctx.font = '9px monospace';
        ctx.fillText(config.timestamp, cardW / 2, timestampY);

        canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
      };
      img.onerror = () => resolve(null);
      img.src = photo;
    });
  };

  // Helper: wrap text into lines for canvas rendering
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    // First split by explicit newlines, then word-wrap each segment
    const paragraphs = text.split('\n');
    const result: string[] = [];
    paragraphs.forEach((para) => {
      if (!para.trim()) { result.push(''); return; }
      const words = para.split('');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
          result.push(line);
          line = words[i];
        } else {
          line = testLine;
        }
      }
      if (line) result.push(line);
    });
    return result;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4">
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
        className="relative w-full max-w-[92vw] xs:max-w-sm max-h-[95vh] overflow-y-auto bg-white p-2.5 xs:p-4 sm:p-5 pb-4 xs:pb-6 sm:pb-7 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-stone-200 flex flex-col items-center select-none z-10"
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
          <div className="max-h-[120px] xs:max-h-[160px] overflow-y-auto pr-1 text-[11px] xs:text-xs text-stone-600 font-sans italic leading-relaxed text-center scrollbar-thin mt-2.5 whitespace-pre-line">
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