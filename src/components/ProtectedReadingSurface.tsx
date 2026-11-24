import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

interface ProtectedReadingSurfaceProps {
  children: React.ReactNode;
  className?: string;
  watermarkText?: string;
  showWatermark?: boolean;
  enableFocusVeil?: boolean;
}

/**
 * Applies balanced browser-level content deterrents on literary reading surfaces:
 * - Disables text selection, context menu, drag, and copy/cut inside the protected region.
 * - Never blocks normal input/textarea controls, search, or screen-reader navigation.
 * - Optionally displays a calm privacy veil if the tab becomes hidden or loses window focus.
 */
export function ProtectedReadingSurface({
  children,
  className = '',
  watermarkText = 'अधुराक्षर',
  showWatermark = false,
  enableFocusVeil = false,
}: ProtectedReadingSurfaceProps) {
  const [obscured, setObscured] = useState(false);

  useEffect(() => {
    if (!enableFocusVeil) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setObscured(true);
      }
    };
    const onBlur = () => {
      setObscured(true);
    };
    const onFocus = () => {
      setObscured(false);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [enableFocusVeil]);

  const isEditableTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
  };

  return (
    <div
      className={`protected-literary-surface protected-no-select relative ${className}`}
      onCopy={(e) => {
        if (!isEditableTarget(e.target)) e.preventDefault();
      }}
      onCut={(e) => {
        if (!isEditableTarget(e.target)) e.preventDefault();
      }}
      onContextMenu={(e) => {
        if (!isEditableTarget(e.target)) e.preventDefault();
      }}
      onDragStart={(e) => {
        if (!isEditableTarget(e.target)) e.preventDefault();
      }}
    >
      {children}

      {showWatermark && (
        <div
          aria-hidden="true"
          data-no-translate="true"
          className="pointer-events-none absolute inset-0 overflow-hidden select-none"
        >
          <span className="devanagari-verse absolute bottom-3 right-4 text-[11px] tracking-normal text-[#C9A45C]/30">
            {watermarkText}
          </span>
        </div>
      )}

      {enableFocusVeil && obscured && (
        <div
          onClick={() => setObscured(false)}
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-[#0C0B0A]/92 backdrop-blur-lg transition-opacity duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="mx-4 max-w-sm rounded-md border border-[#2B2823] bg-[#141311] px-6 py-7 text-center shadow-2xl">
            <Shield className="mx-auto h-5 w-5 text-[#C9A45C]" />
            <p className="mt-3 font-literary text-2xl text-[#EFEAE0]">
              Reading Shield Active
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#9A9285]">
              This literary work is paused while the window is inactive. Click or tap anywhere to continue reading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
