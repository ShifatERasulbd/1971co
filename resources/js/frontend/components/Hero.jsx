import { useEffect, useMemo, useRef, useState } from 'react';
import { timelessFontClass } from '../utils/typography';
import {
  resolveHeroFontFamily,
  resolveHeroFontSize,
} from '../../utils/heroTypography';
import { sectionTypography } from '../utils/sectionTypography';

function splitHeroTitle(value, mode = 'double') {
  const title = String(value || '').trim();
  if (!title) {
    return [];
  }
  if (mode === 'single') {
    return [title];
  }
  const words = title.split(/\s+/);
  if (words.length <= 2) {
    return [title];
  }
  const middle = Math.ceil(words.length / 2);
  return [words.slice(0, middle).join(' '), words.slice(middle).join(' ')];
}

export default function Hero() {
  const [heroData, setHeroData] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previewOverride, setPreviewOverride] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilderPreview] = useState(() => {
    try {
      return window.self !== window.top;
    } catch {
      return false;
    }
  });
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth <= 640;
  });

  const dragStateRef = useRef(null);
  const partOffsetFields = {
    title: ['title_offset_x', 'title_offset_y'],
    description: ['description_offset_x', 'description_offset_y'],
    button: ['button_offset_x', 'button_offset_y'],
  };

  useEffect(() => {
    let ignore = false;
    async function loadHero() {
      try {
        setIsLoading(true);
        const slidesResponse = await fetch('/api/public/heroes', {
          headers: { Accept: 'application/json' },
        });
        if (slidesResponse.ok) {
          const slidesPayload = await slidesResponse.json();
          if (!ignore && Array.isArray(slidesPayload) && slidesPayload.length > 0) {
            setHeroSlides(slidesPayload);
            setHeroData(slidesPayload[0]);
            setIsLoading(false);
            return;
          }
        }
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
        // Handled gracefully: UI remains in skeleton or minimal fallback state if fetch fails entirely
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

  useEffect(() => {
    if (heroSlides.length === 0) {
      return;
    }
    setCurrentSlide((previous) => {
      if (previous >= heroSlides.length) {
        return 0;
      }
      return previous;
    });
  }, [heroSlides]);

  useEffect(() => {
    function handleViewportResize() {
      setIsMobileViewport(window.innerWidth <= 640);
    }

    window.addEventListener('resize', handleViewportResize);
    return () => {
      window.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  useEffect(() => {
    function handleBuilderPreviewMessage(event) {
      if (event.origin !== window.location.origin) {
        return;
      }
      const data = event.data;
      if (!data) {
        return;
      }
      if (data.type !== 'TIMLESS_PAGE_BUILDER_HERO_PREVIEW_UPDATE') {
        return;
      }
      setPreviewOverride((previous) => ({
        ...(previous || {}),
        ...(data.payload || {}),
      }));
    }
    window.addEventListener('message', handleBuilderPreviewMessage);
    return () => {
      window.removeEventListener('message', handleBuilderPreviewMessage);
    };
  }, []);

  const activeHero = heroSlides.length > 0 ? heroSlides[currentSlide] : heroData;
  const displayHeroData = previewOverride ? { ...activeHero, ...previewOverride } : activeHero;
  const slidesCount = heroSlides.length > 0 ? heroSlides.length : 1;

  const titleLines = useMemo(
    () => splitHeroTitle(displayHeroData?.title, displayHeroData?.title_display_mode || 'double'),
    [displayHeroData?.title, displayHeroData?.title_display_mode]
  );
  const fullDescription = String(displayHeroData?.description || '');

  const maxTitleCharIndex = useMemo(
    () =>
      titleLines.reduce((max, line, lineIndex) => {
        const lineLength = Array.from(line || '').length;
        const currentMax = lineIndex * 12 + Math.max(lineLength - 1, 0);
        return Math.max(max, currentMax);
      }, 0),
    [titleLines]
  );

  const [titleAnimationCycle, setTitleAnimationCycle] = useState(0);
  const [typedDescription, setTypedDescription] = useState('');
  const [isDescriptionDeleting, setIsDescriptionDeleting] = useState(false);

  useEffect(() => {
    if (isLoading || titleLines.length === 0) {
      return undefined;
    }

    const animationDurationMs = 700;
    const perCharStaggerMs = 110;
    const pauseAfterCompletionMs = 3000;
    const cycleDurationMs =
      maxTitleCharIndex * perCharStaggerMs + animationDurationMs + pauseAfterCompletionMs;

    const intervalId = window.setInterval(() => {
      setTitleAnimationCycle((cycle) => cycle + 1);
    }, cycleDurationMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isLoading, titleLines, maxTitleCharIndex]);

  useEffect(() => {
    setTypedDescription('');
    setIsDescriptionDeleting(false);
  }, [fullDescription]);

  useEffect(() => {
    if (isLoading || !fullDescription) {
      return undefined;
    }

    const descriptionLength = typedDescription.length;
    const completedTyping = descriptionLength >= fullDescription.length;
    const completedDeleting = descriptionLength === 0;

    let delayMs = isDescriptionDeleting ? 36 : 62;
    if (!isDescriptionDeleting && completedTyping) {
      delayMs = 1500;
    }
    if (isDescriptionDeleting && completedDeleting) {
      delayMs = 420;
    }

    const timeoutId = window.setTimeout(() => {
      if (isDescriptionDeleting) {
        if (completedDeleting) {
          setIsDescriptionDeleting(false);
          return;
        }
        setTypedDescription(fullDescription.slice(0, descriptionLength - 1));
        return;
      }

      if (completedTyping) {
        setIsDescriptionDeleting(true);
        return;
      }

      setTypedDescription(fullDescription.slice(0, descriptionLength + 1));
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading, fullDescription, typedDescription, isDescriptionDeleting]);

  const heroImage = displayHeroData?.image_url || '';
  const [isVideoFallback, setIsVideoFallback] = useState(false);
  const heroVideo = displayHeroData?.video_url || null;

  const titleSize = resolveHeroFontSize(displayHeroData?.title_font_size, 86);
  const descriptionSize = resolveHeroFontSize(displayHeroData?.description_font_size, 24);

  const titleFamily = resolveHeroFontFamily(displayHeroData?.title_font_family, 'montserrat');
  const descriptionFamily = resolveHeroFontFamily(
    displayHeroData?.description_font_family,
    'instrument-sans'
  );

  const displayTitleSize = Math.max(50, Math.round(titleSize * 0.58));
  const displayDescriptionSize = Math.max(16, Math.round(descriptionSize * 0.72));

  const textOffsetX = Number(displayHeroData?.text_offset_x) || 0;
  const textOffsetY = Number(displayHeroData?.text_offset_y) || 0;

  const titleOffsetX = Number(displayHeroData?.title_offset_x) || 0;
  const titleOffsetY = Number(displayHeroData?.title_offset_y) || 0;

  const descriptionOffsetX = Number(displayHeroData?.description_offset_x) || 0;
  const descriptionOffsetY = Number(displayHeroData?.description_offset_y) || 0;

  const buttonOffsetX = Number(displayHeroData?.button_offset_x) || 0;
  const buttonOffsetY = Number(displayHeroData?.button_offset_y) || 0;
  const mobileOffsetFactor = isMobileViewport ? 0.45 : 1;

  const responsiveTextOffsetX = textOffsetX * mobileOffsetFactor;
  const responsiveTextOffsetY = textOffsetY * mobileOffsetFactor;
  const responsiveTitleOffsetX = titleOffsetX * mobileOffsetFactor;
  const responsiveTitleOffsetY = titleOffsetY * mobileOffsetFactor;
  const responsiveDescriptionOffsetX = descriptionOffsetX * mobileOffsetFactor;
  const responsiveDescriptionOffsetY = descriptionOffsetY * mobileOffsetFactor;
  const responsiveButtonOffsetX = buttonOffsetX * mobileOffsetFactor;
  const responsiveButtonOffsetY = buttonOffsetY * mobileOffsetFactor;

  useEffect(() => {
    setIsVideoFallback(false);
  }, [heroVideo]);

  function beginPartDrag(part, event) {
    if (!isBuilderPreview || isLoading) {
      return;
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'TIMLESS_PAGE_BUILDER_HERO_PART_SELECTED',
          payload: { part },
        },
        window.location.origin
      );
    }
    event.preventDefault();
    event.stopPropagation();

    const [xField, yField] = partOffsetFields[part] || [];
    dragStateRef.current = {
      part,
      xField,
      yField,
      startX: event.clientX,
      startY: event.clientY,
      baseOffsetX: Number(displayHeroData?.[xField]) || 0,
      baseOffsetY: Number(displayHeroData?.[yField]) || 0,
    };
  }

  useEffect(() => {
    if (!isBuilderPreview) {
      return undefined;
    }
    function handleMouseMove(event) {
      if (!dragStateRef.current) {
        return;
      }
      const drag = dragStateRef.current;
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);

      const deltaXPercent = ((event.clientX - drag.startX) / width) * 100;
      const deltaYPercent = ((event.clientY - drag.startY) / height) * 100;

      const nextOffsetX = Math.max(-55, Math.min(55, drag.baseOffsetX + deltaXPercent));
      const nextOffsetY = Math.max(-55, Math.min(55, drag.baseOffsetY + deltaYPercent));

      if (!drag.xField || !drag.yField) {
        return;
      }

      setPreviewOverride((previous) => ({
        ...(previous || {}),
        [drag.xField]: nextOffsetX,
        [drag.yField]: nextOffsetY,
      }));

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'TIMLESS_PAGE_BUILDER_HERO_POSITION_CHANGED',
            payload: {
              [drag.xField]: nextOffsetX,
              [drag.yField]: nextOffsetY,
              part: drag.part,
            },
          },
          window.location.origin
        );
      }
    }

    function handlePointerUp() {
      dragStateRef.current = null;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [isBuilderPreview]);

  const renderBackground = useMemo(() => {
    if (isLoading) {
      return <div className="absolute inset-0 -z-30 h-full w-full bg-neutral-900 animate-pulse" />;
    }
    if (heroVideo && !isVideoFallback) {
      return (
        <video
          key={heroVideo}
          poster={heroImage}
          className="hero-media absolute inset-0 -z-30 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setIsVideoFallback(true)}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      );
    }
    return (
      <img
        src={heroImage}
        alt="Timeless custom apparel hero"
        className="hero-media absolute inset-0 -z-30 h-full w-full object-cover object-center"
      />
    );
  }, [heroVideo, isVideoFallback, heroImage, isLoading]);

  return (
    <section className={`${timelessFontClass} hero-section relative isolate min-h-[calc(100vh-90px)] overflow-hidden text-white`}>
      <style>{`
        @keyframes scaleInText {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .hero-scale-in-char {
          display: inline-block;
          opacity: 0;
          transform: scale(0);
          animation: scaleInText 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .hero-title-accent {
          color: #B5AD7E;
        }
        .hero-title-shade {
          border-radius: 12px;
          padding: 0.04em 0.2em;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.2) 0%,
            rgba(0, 0, 0, 0.52) 100%
          );
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.45);
        }
        @keyframes typewriterCaretBlink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
        .hero-typewriter-caret {
          display: inline-block;
          margin-left: 0.06em;
          animation: typewriterCaretBlink 1s step-end infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-scale-in-char {
            animation: none;
            opacity: 1;
            transform: scale(1);
          }
          .hero-typewriter-caret {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>

      {renderBackground}
      <div className="hero-shell mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-[1920px] items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div
          className={`hero-content relative mx-auto flex w-full max-w-[760px] flex-col items-center space-y-3 text-center ${
            isBuilderPreview && !isLoading ? 'rounded-md border border-dashed border-white/55 p-3' : ''
          }`}
          style={{ transform: `translate(${responsiveTextOffsetX}%, ${responsiveTextOffsetY}%)` }}
        >
          {isLoading ? (
            <>
              {/* Title Skeleton */}
              <div className="w-full flex flex-col items-center space-y-3 animate-pulse">
                <div className="h-12 w-4/5 rounded bg-white/20 sm:h-16 lg:h-20" />
                <div className="h-12 w-3/5 rounded bg-white/20 sm:h-16 lg:h-20" />
              </div>
              {/* Description Skeleton */}
              <div className="w-full flex flex-col items-center space-y-2 pt-2 animate-pulse">
                <div className="h-4 w-11/12 rounded bg-white/15" />
                <div className="h-4 w-9/12 rounded bg-white/15" />
              </div>
              {/* Buttons Skeleton */}
              <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row animate-pulse">
                <div className="h-12 w-36 rounded-md bg-white/20" />
                <div className="h-12 w-40 rounded-md bg-white/10" />
              </div>
            </>
          ) : (
            <>
              <h1
                className={`hero-title hero-title-shade ${sectionTypography.heroTitle} text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
                  isBuilderPreview ? 'cursor-move rounded border border-dashed border-white/45 px-2' : ''
                }`}
                style={{
                  fontFamily: titleFamily,
                  fontSize: `clamp(1.6rem, 6vw, ${displayTitleSize}px)`,
                  transform: `translate(${responsiveTitleOffsetX}%, ${responsiveTitleOffsetY}%)`,
                }}
                onMouseDown={(event) => beginPartDrag('title', event)}
              >
                {titleLines.map((line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className={`block ${index === 1 ? 'hero-title-accent' : ''}`}
                  >
                    {Array.from(line).map((char, charIndex) => (
                      <span
                        key={`${titleAnimationCycle}-${line}-${index}-${charIndex}`}
                        className="hero-scale-in-char"
                        style={{ animationDelay: `${(index * 12 + charIndex) * 0.08}s` }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>
              
              <p
                className={`hero-description ${sectionTypography.heroDescription} ${
                  isBuilderPreview ? 'cursor-move rounded border border-dashed border-white/45 px-2' : ''
                }`}
                aria-label={fullDescription}
                style={{
                  fontFamily: descriptionFamily,
                  fontSize: `clamp(0.95rem, 1.35vw, ${displayDescriptionSize}px)`,
                  transform: `translate(${responsiveDescriptionOffsetX}%, ${responsiveDescriptionOffsetY}%)`,
                }}
                onMouseDown={(event) => beginPartDrag('description', event)}
              >
                {fullDescription ? typedDescription : ''}
                {fullDescription ? <span className="hero-typewriter-caret" aria-hidden="true">|</span> : null}
              </p>

              {Boolean(displayHeroData?.button_enabled ?? true) ? (
                <div
                  className="hero-actions flex flex-col items-center gap-3 sm:flex-row"
                  style={{ transform: `translate(${responsiveButtonOffsetX}%, ${responsiveButtonOffsetY}%)` }}
                  onMouseDown={(event) => beginPartDrag('button', event)}
                >
                  <a
                    href={displayHeroData?.button_url || '/shop'}
                    className={sectionTypography.heroPrimaryButton}
                    onClick={(event) => {
                      if (isBuilderPreview) {
                        event.preventDefault();
                      }
                    }}
                  >
                    Shop now
                  </a>
                  <a
                    href="/shop"
                    className={sectionTypography.heroSecondaryButton}
                    onClick={(event) => {
                      if (isBuilderPreview) {
                        event.preventDefault();
                      }
                    }}
                  >
                    Shop essentials
                  </a>
                </div>
              ) : null}

              {slidesCount > 1 ? (
                <div className="pointer-events-none flex justify-center pt-1">
                  <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-sm">
                    {Array.from({ length: slidesCount }).map((_, index) => (
                      <button
                        key={`hero-dot-${index}`}
                        type="button"
                        aria-label={`Go to slide ${index + 1}`}
                        className={`size-2 rounded-full ${
                          index === currentSlide ? 'bg-white' : 'bg-white/40'
                        }`}
                        onClick={() => typeof goToSlide === 'function' && goToSlide(index)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}