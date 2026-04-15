import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
import { EPIC_ROOM_ASSETS } from '../../constants/assets';

interface EpicRoomProps {
  message?: string;
  bgImage?: string;
  fgImage?: string;
}

export function EpicRoom({
  message,
  bgImage = EPIC_ROOM_ASSETS.EMPTY_ROOM,
  fgImage = EPIC_ROOM_ASSETS.DRIVER
}: EpicRoomProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [key, setKey] = useState(0); // For restarting animation

  const baseText = `<span>F1 ASSASSINS</span> CHAMPIONSHIP - DESARROLLADO POR <span>JUASMO</span> - DISEÑO GRÁFICO POR <span>UYIMERO</span> - ORGANIZADO POR <span>ALVILLAS</span> - `;
  // Repeat the text many times so it doesn't run out
  const repeatedText = Array(50).fill(baseText).join('');
  const defaultMessage = `<p class="epic-text-p">${repeatedText}</p>`;

  const displayMessage = message || defaultMessage;

  useEffect(() => {
    const adjustContentSize = () => {
      if (!contentRef.current || !wrapperRef.current) return;
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      const baseWidth = 1000;
      const baseHeight = 562;
      // Use a slightly larger scale factor to ensure it fills the screen
      const scaleFactor = Math.max(width / baseWidth, height / baseHeight);
      contentRef.current.style.transform = `scale(${scaleFactor})`;
    };

    adjustContentSize();
    window.addEventListener("resize", adjustContentSize);
    return () => window.removeEventListener("resize", adjustContentSize);
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'dashboard' }));
  };

  const handleRestart = () => {
    setKey(prev => prev + 1);
  };

  const isLoading = imagesLoaded < 2;

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
          <p className="text-white/50 text-sm font-mono uppercase tracking-widest animate-pulse">Cargando Sala VIP...</p>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-6 left-6 z-50 flex gap-4">
        <button 
          onClick={handleBack}
          className="w-12 h-12 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all backdrop-blur-md"
          title="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={handleRestart}
          className="w-12 h-12 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all backdrop-blur-md"
          title="Reiniciar Animación"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div key={key} ref={contentRef} className={`epic-content block w-[1000px] h-[562px] origin-center transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="epic-container-full">
          <div className="epic-hue animated z-[10]"></div>
          <img 
            className="absolute w-[1000px] z-[1]" 
            src={bgImage} 
            alt="Background" 
            referrerPolicy="no-referrer" 
            onLoad={handleImageLoad}
          />
          
          <div className="epic-container-reflect z-[2] absolute w-full h-full">
            <div className="epic-cube">
              <div className="epic-face epic-top"></div>
              <div className="epic-face epic-bottom"></div>
              <div className="epic-face epic-left" dangerouslySetInnerHTML={{ __html: displayMessage }}></div>
              <div className="epic-face epic-right" dangerouslySetInnerHTML={{ __html: displayMessage }}></div>
              <div className="epic-face epic-front"></div>
              <div className="epic-face epic-back" dangerouslySetInnerHTML={{ __html: displayMessage }}></div>
            </div>
          </div>

          <div className="flex items-center justify-center z-[3] absolute w-full h-full">
            <div className="epic-cube">
              <div className="epic-face epic-top"></div>
              <div className="epic-face epic-bottom"></div>
              <div className="epic-face epic-left" dangerouslySetInnerHTML={{ __html: displayMessage }}></div>
              <div className="epic-face epic-right" dangerouslySetInnerHTML={{ __html: displayMessage }}></div>
              <div className="epic-face epic-front"></div>
              <div className="epic-face epic-back" dangerouslySetInnerHTML={{ __html: displayMessage }}></div>
            </div>
          </div>
          
          <img 
            className="absolute w-[1000px] z-[4] animate-[epic-blur_200s_linear_infinite]" 
            src={fgImage} 
            alt="Foreground" 
            referrerPolicy="no-referrer" 
            onLoad={handleImageLoad}
          />
        </div>
      </div>
    </div>
  );
}
