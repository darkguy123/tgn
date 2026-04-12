'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const LOAD_DURATION_MS = 650;

export default function PageLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, LOAD_DURATION_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  return (
    <div
      aria-hidden={!isVisible}
      className={`fb-loader-overlay ${isVisible ? 'is-visible' : 'is-hidden'}`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="fb-loader-shell">
        <div className="fb-loader-topbar fb-shimmer" />

        <div className="fb-loader-content">
          <div className="fb-loader-left">
            <div className="fb-loader-avatar fb-shimmer" />
            <div className="fb-loader-line fb-shimmer" />
            <div className="fb-loader-line short fb-shimmer" />
            <div className="fb-loader-line tiny fb-shimmer" />
          </div>

          <div className="fb-loader-main">
            <div className="fb-loader-card">
              <div className="fb-loader-row">
                <div className="fb-loader-avatar sm fb-shimmer" />
                <div className="fb-loader-stack">
                  <div className="fb-loader-line md fb-shimmer" />
                  <div className="fb-loader-line short fb-shimmer" />
                </div>
              </div>
              <div className="fb-loader-block fb-shimmer" />
              <div className="fb-loader-line fb-shimmer" />
              <div className="fb-loader-line md fb-shimmer" />
            </div>

            <div className="fb-loader-card">
              <div className="fb-loader-row">
                <div className="fb-loader-avatar sm fb-shimmer" />
                <div className="fb-loader-stack">
                  <div className="fb-loader-line md fb-shimmer" />
                  <div className="fb-loader-line tiny fb-shimmer" />
                </div>
              </div>
              <div className="fb-loader-block lg fb-shimmer" />
              <div className="fb-loader-line fb-shimmer" />
            </div>
          </div>

          <div className="fb-loader-right">
            <div className="fb-loader-card compact">
              <div className="fb-loader-line md fb-shimmer" />
              <div className="fb-loader-line short fb-shimmer" />
              <div className="fb-loader-line tiny fb-shimmer" />
            </div>
            <div className="fb-loader-card compact">
              <div className="fb-loader-line md fb-shimmer" />
              <div className="fb-loader-line short fb-shimmer" />
              <div className="fb-loader-line tiny fb-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
