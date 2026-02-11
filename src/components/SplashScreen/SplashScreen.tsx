import React, { useEffect, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Safety timeout - always complete after 10 seconds maximum
    const safetyTimeout = setTimeout(() => {
      console.log('Splash screen timeout reached, loading app');
      onComplete();
    }, 10000);

    const video = videoRef.current;
    if (!video) {
      clearTimeout(safetyTimeout);
      onComplete();
      return;
    }

    const handleVideoEnd = () => {
      clearTimeout(safetyTimeout);
      onComplete();
    };

    const handleVideoError = () => {
      console.warn('Splash video failed to load, skipping to app');
      clearTimeout(safetyTimeout);
      onComplete();
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('error', handleVideoError);

    video.play().catch((error) => {
      console.warn('Autoplay failed, skipping to app:', error);
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
    </div>
  );
};
