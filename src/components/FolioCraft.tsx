import { useMemo, useRef, type ReactNode } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArtworkFrame } from './ArtworkFrame';
import type { ReaderSurfaceMode } from '../types/literary';

/**
 * AmbientCandlelightBackdrop
 * Subtle mood- and scroll-reactive radial candlelight aura + tactile grain overlay.
 * Uses strictly GPU transforms and opacity; zero pointer interference.
 */
export function AmbientCandlelightBackdrop() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const yDrift = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  const moodParam = searchParams.get('mood');

  const auraGradient = useMemo(() => {
    if (pathname.startsWith('/theatre')) {
      return 'radial-gradient(ellipse 72% 48% at 50% 8%, rgba(218, 168, 86, 0.095), rgba(112, 148, 210, 0.03) 48%, transparent 76%)';
    }
    if (pathname.startsWith('/midnight-page')) {
      return 'radial-gradient(ellipse 68% 46% at 50% 10%, rgba(196, 152, 74, 0.09), rgba(24, 30, 48, 0.06) 52%, transparent 78%)';
    }
    if (pathname.startsWith('/undefined')) {
      return 'radial-gradient(ellipse 65% 44% at 50% 6%, rgba(186, 154, 108, 0.065), transparent 72%)';
    }
    if (moodParam === 'suspense') {
      return 'radial-gradient(ellipse 70% 45% at 50% 8%, rgba(142, 166, 202, 0.075), rgba(201, 164, 92, 0.03) 50%, transparent 76%)';
    }
    return 'radial-gradient(ellipse 76% 46% at 50% 6%, rgba(201, 164, 92, 0.085), rgba(146, 106, 48, 0.025) 48%, transparent 76%)';
  }, [pathname, moodParam]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute -top-24 left-0 right-0 h-[75vh] transition-[background-image] duration-700"
        style={{
          backgroundImage: auraGradient,
          y: prefersReducedMotion ? 0 : yDrift,
        }}
      />
      <div className="candlelit-grain absolute inset-0 opacity-75" />
    </div>
  );
}

/**
 * FolioCornerFiligree
 * Bespoke Devanagari-inspired brass corner brackets framing collector plates.
 */
interface FolioCornerFiligreeProps {
  surface?: ReaderSurfaceMode;
  className?: string;
}

export function FolioCornerFiligree({
  surface = 'midnight',
  className = '',
}: FolioCornerFiligreeProps) {
  const stroke =
    surface === 'paper' ? 'rgba(136, 98, 42, 0.48)' : 'rgba(201, 164, 92, 0.45)';
  const accent =
    surface === 'paper' ? 'rgba(136, 98, 42, 0.72)' : 'rgba(222, 192, 124, 0.75)';

  const CornerSvg = ({ pos }: { pos: string }) => (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none absolute h-6 w-6 ${pos}`}
    >
      <path d="M1 21V3.5C1 2.12 2.12 1 3.5 1H21" stroke={stroke} strokeWidth="1.2" />
      <path d="M5 14V6C5 5.45 5.45 5 6 5H14" stroke={stroke} strokeWidth="0.9" />
      <circle cx="5" cy="5" r="1.4" fill={accent} />
    </svg>
  );

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-2.5 ${className}`}>
      <CornerSvg pos="left-0 top-0" />
      <CornerSvg pos="right-0 top-0 rotate-90" />
      <CornerSvg pos="right-0 bottom-0 rotate-180" />
      <CornerSvg pos="left-0 bottom-0 -rotate-90" />
    </div>
  );
}

/**
 * CollectorFoilSeal
 * Embossed gold-foil colophon seal stamped at the base of collector editions.
 */
interface CollectorFoilSealProps {
  surface?: ReaderSurfaceMode;
  label?: string;
  compact?: boolean;
}

export function CollectorFoilSeal({
  surface = 'midnight',
  label = 'BENIYAAZ ROOH · ARCHIVAL EDITION',
  compact = false,
}: CollectorFoilSealProps) {
  const ringStroke =
    surface === 'paper' ? 'rgba(132, 92, 36, 0.55)' : 'rgba(201, 164, 92, 0.5)';
  const glyphColor = surface === 'paper' ? '#7D5822' : '#DEC07C';
  const textColor = surface === 'paper' ? 'text-[#6A573B]' : 'text-[#9A9285]';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className={compact ? 'h-8 w-8 shrink-0' : 'h-10 w-10 shrink-0'}
      >
        <circle cx="24" cy="24" r="21" stroke={ringStroke} strokeWidth="1" />
        <circle
          cx="24"
          cy="24"
          r="17"
          stroke={ringStroke}
          strokeWidth="0.75"
          strokeDasharray="2 2.5"
        />
        <path
          d="M24 11L27 21L37 24L27 27L24 37L21 27L11 24L21 21L24 11Z"
          stroke={glyphColor}
          strokeWidth="1.1"
          fill="none"
        />
        <circle cx="24" cy="24" r="2.1" fill={glyphColor} />
      </svg>
      <div className="leading-tight">
        <p
          className={`text-[10px] font-medium tracking-[0.18em] ${
            surface === 'paper' ? 'text-[#7D5822]' : 'text-[#C9A45C]'
          }`}
        >
          {label}
        </p>
        <p className={`mt-0.5 font-literary text-xs italic ${textColor}`}>
          तेजस पुर्वेश फिरके · Preserved Verbatim
        </p>
      </div>
    </div>
  );
}

/**
 * ManuscriptDivider
 * Architectural hairline ornament separating literary sections & verses.
 */
export function ManuscriptDivider({
  surface = 'midnight',
  className = '',
}: {
  surface?: ReaderSurfaceMode;
  className?: string;
}) {
  const line =
    surface === 'paper' ? 'via-[#9A7439]/40' : 'via-[#C9A45C]/45';
  const diamond = surface === 'paper' ? '#8C6828' : '#DEC07C';

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <span className={`h-px flex-1 bg-gradient-to-r from-transparent ${line} to-transparent`} />
      <svg viewBox="0 0 24 14" className="h-3 w-5 shrink-0" fill="none">
        <path
          d="M12 1L16.5 7L12 13L7.5 7L12 1Z"
          stroke={diamond}
          strokeWidth="1.1"
        />
        <circle cx="3" cy="7" r="1" fill={diamond} opacity="0.65" />
        <circle cx="21" cy="7" r="1" fill={diamond} opacity="0.65" />
      </svg>
      <span className={`h-px flex-1 bg-gradient-to-r from-transparent ${line} to-transparent`} />
    </div>
  );
}

/**
 * InkRevealSection
 * Smooth GPU compositor viewport reveal (respects prefers-reduced-motion).
 */
export function InkRevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ParallaxArtworkFrame
 * Scroll-driven GPU vertical parallax container for archival illustrations.
 */
interface ParallaxArtworkFrameProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  scrimClassName?: string;
}

export function ParallaxArtworkFrame({
  className = '',
  imgClassName = '',
  ...props
}: ParallaxArtworkFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y: prefersReducedMotion ? 0 : y }}
        className="h-[110%] w-full -translate-y-[5%]"
      >
        <ArtworkFrame
          {...props}
          className="h-full w-full"
          imgClassName={imgClassName}
        />
      </motion.div>
    </div>
  );
}
