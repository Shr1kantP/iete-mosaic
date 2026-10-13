"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type PageTransitionLoaderProps = {
  children: ReactNode;
};

const LOADER_DURATION_MS = 4000;

export default function PageTransitionLoader({
  children,
}: PageTransitionLoaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const initialLoadRef = useRef(true);
  const pendingHrefRef = useRef<string | null>(null);
  const pendingPathnameRef = useRef<string | null>(null);
  const [animationRun, setAnimationRun] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const pendingPathname = pendingPathnameRef.current;
    if (pendingPathname && pathname === pendingPathname) {
      pendingPathnameRef.current = null;
      setIsVisible(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = window.setTimeout(() => {
      const pendingHref = pendingHrefRef.current;
      if (pendingHref) {
        pendingHrefRef.current = null;
        router.push(pendingHref);
      } else if (initialLoadRef.current) {
        initialLoadRef.current = false;
        setIsVisible(false);
      }
    }, LOADER_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [animationRun, isVisible, router]);

  useEffect(() => {
    const interceptNavigation = (event: MouseEvent) => {
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

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const destinationPath = destination.pathname.replace(/\/+$/, "") || "/";
      if (
        (destinationPath !== "/faq" && destinationPath !== "/rules") ||
        destinationPath === window.location.pathname.replace(/\/+$/, "")
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      pendingHrefRef.current = `${destination.pathname}${destination.search}${destination.hash}`;
      pendingPathnameRef.current = destinationPath;
      setIsVisible(true);
      setAnimationRun((run) => run + 1);
    };

    document.addEventListener("click", interceptNavigation, true);
    return () => {
      document.removeEventListener("click", interceptNavigation, true);
    };
  }, []);

  return (
    <>
      {children}
      <div
        className={`page-loader${isVisible ? " is-visible" : ""}`}
        role="status"
        aria-label="Entering Blackwood House"
        aria-hidden={!isVisible}
        inert={!isVisible}
      >
        <div className="page-loader__scene" key={animationRun}>
          <div className="page-loader__eyes" aria-hidden="true">
            <Image
              src="/images/loader/the-eyes.webp"
              alt=""
              width={2073}
              height={758}
              priority
            />
          </div>
          <div className="page-loader__vignette" aria-hidden="true" />
          <p className="page-loader__label">Entering Blackwood House</p>
        </div>
      </div>
    </>
  );
}
