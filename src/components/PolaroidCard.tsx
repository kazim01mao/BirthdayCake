import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Check, ArrowLeft } from 'lucide-react';
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
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      window.open(photo, '_blank');
    }
  };

  // Canvas-based fallback compositor with dynamic height
  const compositeCardWithCanvas = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        const cardW = 320;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        const photoPadding = 12;
        const photoSize = cardW - photoPadding * 2;
        const titleY = photoPadding + photoSize + 22;
        const maxWidth = cardW - 30;

        // 1. Calculate title font size adaptively for single line
        const titleMaxWidth = cardW - 36;
        let titleFontSize = 22;
        while (titleFontSize > 12) {
          ctx.font = `bold ${titleFontSize}px serif`;
          const titleMeasure = ctx.measureText(config.title);
          if (titleMeasure.width <= titleMaxWidth) break;
          titleFontSize -= 1;
        }
        const finalBodyY = titleY + titleFontSize + 6;

        // 2. Body text layout
        ctx.font = 'italic 13px sans-serif';
        const lines = wrapText(ctx, config.body, maxWidth);

        // 3. Calculate dynamic card height
        const dividerY = finalBodyY + lines.length * 18 + 8;
        const timestampY = dividerY + 16;
        const cardH = Math.max(440, timestampY + 20 + 50);

        canvas.width = cardW * scale;
        canvas.height = cardH * scale;
        ctx.scale(scale, scale);

        // White card background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cardW, cardH);

        // Photo area (square, top portion)
        ctx.save();
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(photoPadding, photoPadding, photoSize, photoSize);
        ctx.drawImage(img, photoPadding, photoPadding, photoSize, photoSize);
        ctx.restore();

        // Title text - adaptive font sizing, single line
        ctx.fillStyle = '#1c1917';
        ctx.font = `bold ${titleFontSize}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(config.title, cardW / 2, titleY);

        // Body text with line wrapping
        ctx.fillStyle = '#57534e';
        ctx.font = 'italic 13px sans-serif';
        ctx.textAlign = 'center';
        lines.forEach((line, i) => {
          ctx.fillText(line, cardW / 2, finalBodyY + i * 18);
        });

        // Divider line
        ctx.strokeStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.moveTo(cardW / 2 - 40, dividerY);
        ctx.lineTo(cardW / 2 + 40, dividerY);
        ctx.stroke();

        // Timestamp
        ctx.fillStyle = '#a8a29e';
        ctx.font = '10px monospace';
        ctx.fillText(config.timestamp, cardW / 2, timestampY);

        canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
      };
      img.onerror = () => resolve(null);
      img.src = photo;
    });
  };

  // Helper: wrap text into lines for canvas rendering
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
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

      <div className="relative flex flex-col items-center max-h-[98vh] w-full max-w-[90vw] xs:max-w-xs">
        {/* Polaroid Card - pure white card for snapshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20, rotate: 3 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          id="polaroid-card"
          className="relative w-full overflow-hidden bg-white p-4 sm:p-5 pb-5 sm:pb-6 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-stone-200 flex flex-col items-center select-none z-10"
        >
          {/* Photo Container with subtle shadow and border */}
          <div className="w-full aspect-square bg-stone-950 overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center relative">
            <img
              src={photo}
              alt="Birthday Memory"
              className="w-full h-full object-cover polaroid-sepia transition-all duration-700"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
          </div>

          {/* Text Area */}
          <div className="w-full mt-5 sm:mt-6 text-center text-stone-800 px-1 flex flex-col items-center">
            {/* Configurable Title */}
            <h3 className="font-serif text-lg xs:text-xl sm:text-2xl tracking-wide font-bold text-stone-900 leading-snug whitespace-nowrap">
              {config.title}
            </h3>

            {/* Configurable Body */}
            <div className="pr-1 text-xs xs:text-sm sm:text-base text-stone-600 font-sans italic leading-relaxed text-center mt-2 sm:mt-3 whitespace-pre-line">
              {config.body}
            </div>

            <div className="w-24 h-[1px] bg-stone-200 my-2.5 sm:my-3" />

            {/* Configurable Timestamp */}
            <p className="font-mono text-[9px] sm:text-[10px] text-stone-400 tracking-widest uppercase">
              {config.timestamp}
            </p>
          </div>
        </motion.div>

        {/* Buttons outside the card - not included in snapshot */}
        <div className="w-full flex flex-col gap-2 mt-3 sm:mt-4 z-10">
          {/* Save Button */}
          <button
            onClick={saveToPhotos}
            className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 bg-stone-900 hover:bg-black text-white rounded-lg text-xs sm:text-sm font-sans tracking-wide transition-all duration-200 active:scale-95 cursor-pointer border border-stone-800"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                <span>已儲存</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>存儲至本地相簿</span>
              </>
            )}
          </button>

          {/* Close & Return Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[10px] sm:text-xs transition-all duration-200 cursor-pointer border border-white/10"
              aria-label="返回"
            >
              <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span>返回</span>
            </button>
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[10px] sm:text-xs transition-all duration-200 cursor-pointer border border-white/10"
              aria-label="返回重新拍攝"
            >
              <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span>返回重拍</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}