"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type RefObject } from "react";

type SiteNavProps = {
  brandSlotRef?: RefObject<HTMLDivElement | null>;
  brandHref?: string;
  showBrandMark?: boolean;
};

export default function SiteNav({
  brandSlotRef,
  brandHref,
  showBrandMark = false,
}: SiteNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuPortalRoot, setMenuPortalRoot] = useState<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMenuFocusRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMenuPortalRoot(document.body);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreMenuFocusRef.current = true;
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      mobileMenuCloseButtonRef.current?.focus();
    } else if (restoreMenuFocusRef.current) {
      mobileMenuButtonRef.current?.focus();
      restoreMenuFocusRef.current = false;
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = (restoreFocus = true) => {
    restoreMenuFocusRef.current = restoreFocus;
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="hero-nav" aria-label="Main navigation">
        <button
          ref={mobileMenuButtonRef}
          className="hero-nav__mobile-menu"
          type="button"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="hero-mobile-menu"
          onClick={() => {
            if (isMobileMenuOpen) restoreMenuFocusRef.current = true;
            setIsMobileMenuOpen((open) => !open);
          }}
        >
          <span
            className={`hero-nav__mobile-menu-icon${isMobileMenuOpen ? " is-open" : ""}`}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className="hero-nav__links hero-nav__links--left">
          <Link href="/rules" aria-label="Rules">
            <Image
              src="/images/navbar/button-1-rules.svg"
              alt="Rules"
              width={67}
              height={26}
              priority
            />
          </Link>
          <Link href="/faq" aria-label="Frequently asked questions">
            <Image
              src="/images/navbar/button-2-faq.svg"
              alt="FAQ"
              width={43}
              height={28}
              priority
            />
          </Link>
        </div>
        {brandHref ? (
          <Link
            className="hero-nav__brand-slot"
            href={brandHref}
            aria-label="Blackwood House home"
          >
            {showBrandMark && (
              <Image
                src="/images/hero-svg.svg"
                alt=""
                width={964}
                height={127}
                priority
              />
            )}
          </Link>
        ) : (
          <div
            className="hero-nav__brand-slot"
            ref={brandSlotRef}
            aria-hidden="true"
          >
            {showBrandMark && (
              <Image
                src="/images/hero-svg.svg"
                alt=""
                width={964}
                height={127}
                priority
              />
            )}
          </div>
        )}
        <div className="hero-nav__links hero-nav__links--right">
          <Link
            className="hero-nav__register"
            href="/rules#register"
            aria-label="Register now"
          >
            <Image
              src="/images/navbar/button-3-register.svg"
              alt="Register now"
              width={158}
              height={58}
              priority
            />
          </Link>
        </div>
      </nav>

      {menuPortalRoot &&
        createPortal(
          <div
            className={`hero-mobile-menu${isMobileMenuOpen ? " is-open" : ""}`}
            id="hero-mobile-menu"
            aria-hidden={!isMobileMenuOpen}
            inert={!isMobileMenuOpen}
          >
            <button
              className="hero-mobile-menu__backdrop"
              type="button"
              aria-label="Close navigation menu"
              tabIndex={-1}
              onClick={() => closeMobileMenu()}
            />
            <div className="hero-mobile-menu__panel">
              <button
                ref={mobileMenuCloseButtonRef}
                className="hero-mobile-menu__close"
                type="button"
                onClick={() => closeMobileMenu()}
              >
                Close
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m2 2 12 12M14 2 2 14" />
                </svg>
              </button>
              <p className="hero-mobile-menu__eyebrow">Blackwood House</p>
              <nav className="hero-mobile-menu__links" aria-label="Mobile navigation">
                <Link
                  href="/rules"
                  className="hero-mobile-menu__link"
                  onClick={() => closeMobileMenu(false)}
                >
                  <span className="hero-mobile-menu__index">01</span>
                  <Image
                    src="/images/navbar/button-1-rules.svg"
                    alt="Rules"
                    width={200}
                    height={100}
                  />
                  <span className="hero-mobile-menu__arrow" aria-hidden="true">
                    <svg viewBox="0 0 16 16">
                      <path d="M3 13 13 3M5 3h8v8" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/faq"
                  className="hero-mobile-menu__link"
                  onClick={() => closeMobileMenu(false)}
                >
                  <span className="hero-mobile-menu__index">02</span>
                  <Image
                    src="/images/navbar/button-2-faq.svg"
                    alt="FAQ"
                    width={200}
                    height={100}
                  />
                  <span className="hero-mobile-menu__arrow" aria-hidden="true">
                    <svg viewBox="0 0 16 16">
                      <path d="M3 13 13 3M5 3h8v8" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/rules#register"
                  className="hero-mobile-menu__link hero-mobile-menu__link--register"
                  onClick={() => closeMobileMenu(false)}
                >
                  <span className="hero-mobile-menu__index">03</span>
                  <Image
                    src="/images/navbar/button-3-register.svg"
                    alt="Register now"
                    width={200}
                    height={100}
                  />
                  <span className="hero-mobile-menu__arrow" aria-hidden="true">
                    <svg viewBox="0 0 16 16">
                      <path d="M3 13 13 3M5 3h8v8" />
                    </svg>
                  </span>
                </Link>
              </nav>
              <p className="hero-mobile-menu__footer">A place with a past</p>
            </div>
          </div>,
          menuPortalRoot,
        )}
    </>
  );
}
