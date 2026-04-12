'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import PageCarcass from '@/components/PageCarcass';

const LOAD_DURATION_MS = 650;

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const showLoader = () => {
    startedAtRef.current = Date.now();
    setIsVisible(true);
  };

  const hideLoaderAfterMinimum = () => {
    clearTimer();
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, LOAD_DURATION_MS - elapsed);

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, remaining);
  };

  useEffect(() => {
    showLoader();
    hideLoaderAfterMinimum();

    return () => {
      clearTimer();
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const link = target?.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      const targetAttr = link.getAttribute('target');

      if (!href || href.startsWith('#') || link.hasAttribute('download') || targetAttr === '_blank') {
        return;
      }

      let destination: URL;
      try {
        destination = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) {
        return;
      }

      const current = `${window.location.pathname}${window.location.search}`;
      const next = `${destination.pathname}${destination.search}`;
      if (current === next) {
        return;
      }

      showLoader();
    };

    const handlePopState = () => {
      showLoader();
    };

    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div
      aria-hidden={!isVisible}
      className={`fb-loader-overlay ${isVisible ? 'is-visible' : 'is-hidden'}`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <PageCarcass />
    </div>
  );
}
