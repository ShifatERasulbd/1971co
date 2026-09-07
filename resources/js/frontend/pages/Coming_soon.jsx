import { useEffect, useState } from 'react';
import { timelessFontClass } from '../utils/typography';
import { sectionTypography } from '../utils/sectionTypography';
import { buildOptimizedImageUrl } from '../utils/media';

export default function ComingSoon() {
  const [heroData, setHeroData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoFallback, setIsVideoFallback] = useState(false);
  const [isImageFallback, setIsImageFallback] = useState(false);
  const [canAutoPlayVideo, setCanAutoPlayVideo] = useState(false);

  // Target launch date: 15 Sep 2026
  const launchDate = new Date('2026-09-15T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch hero data to get the background video/image
  useEffect(() => {
    let ignore = false;
    async function loadHero() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/public/hero', {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const payload = await response.json();
          if (!ignore && payload) {
            setHeroData(payload);
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    loadHero();
    return () => {
      ignore = true;
    };
  }, []);

  // Countdown timer logic
  useEffect(() => {
    function updateCountdown() {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  // Video autoplay compatibility check
  const heroVideo = heroData?.video_url ? String(heroData.video_url).trim() : '';
  const resolvedVideoUrl = heroVideo ? (heroVideo.startsWith('http') || heroVideo.startsWith('/') ? heroVideo : `/${heroVideo.replace(/^\/+/, '')}`) : '';
  const heroImage = heroData?.image_url || '';
  const optimizedHeroImage = buildOptimizedImageUrl(heroImage, { w: 1920, q: 74 });
  const posterUrl = optimizedHeroImage || heroImage || undefined;
  const showImage = Boolean((resolvedVideoUrl && isVideoFallback) || (!resolvedVideoUrl && (optimizedHeroImage || heroImage))) && !isImageFallback;

  useEffect(() => {
    if (!resolvedVideoUrl) {
      setCanAutoPlayVideo(false);
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection?.saveData);
    const effectiveType = String(connection?.effectiveType || '').toLowerCase();
    const isSlowNetwork = effectiveType.includes('2g') || effectiveType.includes('3g');

    setCanAutoPlayVideo(!reducedMotion && !saveData && !isSlowNetwork);
  }, [resolvedVideoUrl]);

  return (
    <section className={`${timelessFontClass} relative isolate min-h-screen w-full overflow-hidden text-zinc-900 flex items-center justify-center`}>
      {/* Always-present base so a missing/broken video or image never leaves a blank box */}
      <div className="absolute inset-0 -z-40 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />

      {/* Background Video or Image */}
      {resolvedVideoUrl && !isVideoFallback ? (
        <video
          key={resolvedVideoUrl}
          src={resolvedVideoUrl}
          poster={posterUrl}
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
          autoPlay={canAutoPlayVideo}
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setIsVideoFallback(true)}
        />
      ) : showImage ? (
        <img
          src={optimizedHeroImage || heroImage}
          alt="Coming Soon Background"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
          onError={() => setIsImageFallback(true)}
        />
      ) : null}

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 -z-20 bg-black/40 backdrop-blur-[2px]" />

      {/* Content Container */}
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center text-white">
        <h1 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-200 sm:text-base mb-3">
          Launching Soon
        </h1>
        <p className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-8">
          We Are Crafting Something Timeless
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 mb-12 w-full max-w-2xl">
          <div className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-md p-4 sm:p-6 border border-white/20 shadow-lg">
            <span className="text-4xl sm:text-6xl font-bold tracking-tight">{timeLeft.days}</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300 mt-1">Days</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-md p-4 sm:p-6 border border-white/20 shadow-lg">
            <span className="text-4xl sm:text-6xl font-bold tracking-tight">{timeLeft.hours}</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300 mt-1">Hours</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-md p-4 sm:p-6 border border-white/20 shadow-lg">
            <span className="text-4xl sm:text-6xl font-bold tracking-tight">{timeLeft.minutes}</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300 mt-1">Minutes</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-md p-4 sm:p-6 border border-white/20 shadow-lg">
            <span className="text-4xl sm:text-6xl font-bold tracking-tight">{timeLeft.seconds}</span>
            <span className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300 mt-1">Seconds</span>
          </div>
        </div>

        <div className="text-sm sm:text-base text-zinc-300 font-medium">
          Official Launch Date: <span className="text-white font-semibold">15 September 2026</span>
        </div>
      </div>
    </section>
  );
}