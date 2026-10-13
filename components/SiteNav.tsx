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

function MobileMenuText({ children }: { children: string }) {
  const characters = Array.from(children);

  return (
    <span className="hero-mobile-menu__text-roll" aria-hidden="true">
      {[false, true].map((isDuplicate) => (
        <span
          className={`hero-mobile-menu__text-roll-line${isDuplicate ? " is-duplicate" : ""}`}
          key={isDuplicate ? "duplicate" : "original"}
        >
          {characters.map((character, index) => (
            <span
              className="hero-mobile-menu__text-roll-character"
              key={`${character}-${index}`}
              style={{
                transitionDelay: `${Math.abs(index - (characters.length - 1) / 2) * 35}ms`,
              }}
            >
              {character === " " ? "\u00a0" : character}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

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
          <span>Menu</span>
          <span
            className={`hero-nav__mobile-menu-symbol${isMobileMenuOpen ? " is-open" : ""}`}
            aria-hidden="true"
          >
            +
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
        <div
          className="hero-nav__brand-slot"
          ref={brandSlotRef}
          aria-hidden={!brandHref && !showBrandMark}
        >
          {brandHref ? (
            <a
              className="hero-nav__brand-link"
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
            </a>
          ) : (
            showBrandMark && (
              <Image
                src="/images/hero-svg.svg"
                alt=""
                width={964}
                height={127}
                priority
              />
            )
          )}
        </div>
        <div className="hero-nav__links hero-nav__links--right">
          <a
            className="hero-nav__register"
            href="https://mosaic-2k26.vercel.app/#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register now"
          >
            <Image
              src="/images/navbar/button-3-register.svg"
              alt="Register now"
              width={158}
              height={58}
              priority
            />
          </a>
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
              <nav className="hero-mobile-menu__links" aria-label="Mobile navigation">
                <Link
                  href="/rules"
                  className="hero-mobile-menu__link"
                  aria-label="Rules"
                  onClick={() => closeMobileMenu(false)}
                >
                  <MobileMenuText>Rules</MobileMenuText>
                </Link>
                <Link
                  href="/faq"
                  className="hero-mobile-menu__link"
                  aria-label="FAQ"
                  onClick={() => closeMobileMenu(false)}
                >
                  <MobileMenuText>FAQ</MobileMenuText>
                </Link>
                <a
                  href="https://mosaic-2k26.vercel.app/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-mobile-menu__link hero-mobile-menu__link--register"
                  aria-label="Register now"
                  onClick={() => closeMobileMenu(false)}
                >
                  <MobileMenuText>Register Now</MobileMenuText>
                </a>
              </nav>
            </div>
          </div>,
          menuPortalRoot,
        )}
    </>
  );
}
