import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    console.log('🎬 SplashScreen montado');
    setShowSkip(true);

    // Immediate skip after 100ms to ensure app loads quickly
    const quickTimeout = setTimeout(() => {
      console.log('⏱️ Quick timeout - carregando app');
      onComplete();
    }, 100);

    return () => {
      clearTimeout(quickTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      >
        <source src="/intro.mp4.mp4" type="video/mp4" />
      </video>

      {showSkip && (
        <button
          onClick={onComplete}
          className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 hover:scale-105"
        >
          Pular
        </button>
      )}
    </div>
  );
};
