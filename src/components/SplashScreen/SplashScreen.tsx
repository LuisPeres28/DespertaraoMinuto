import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    console.log('🎬 SplashScreen montado');

    // Show skip button immediately
    setShowSkip(true);

    // Safety timeout - always complete after 1 second maximum
    const safetyTimeout = setTimeout(() => {
      console.log('⏱️ Splash screen timeout - carregando app');
      onComplete();
    }, 1000);

    const video = videoRef.current;
    if (!video) {
      console.log('❌ Vídeo não encontrado - pulando splash');
      clearTimeout(safetyTimeout);
      onComplete();
      return;
    }

    console.log('▶️ Tentando reproduzir vídeo');

    const handleVideoEnd = () => {
      console.log('✅ Vídeo terminou');
      clearTimeout(safetyTimeout);
      onComplete();
    };

    const handleVideoError = (e: Event) => {
      console.warn('❌ Erro ao carregar vídeo:', e);
      clearTimeout(safetyTimeout);
      onComplete();
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('error', handleVideoError);

    video.play()
      .then(() => console.log('▶️ Vídeo reproduzindo'))
      .catch((error) => {
        console.warn('❌ Autoplay falhou:', error);
        clearTimeout(safetyTimeout);
        onComplete();
      });

    return () => {
      clearTimeout(safetyTimeout);
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('error', handleVideoError);
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
