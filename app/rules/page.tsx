"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import HoloCard from "../../components/HoloCard";

export default function RulesPage() {
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (expandedRule === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedRule(null);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };
    const mobileViewport = window.matchMedia("(max-width: 768px)");
    const closeOnDesktop = () => {
      if (!mobileViewport.matches) {
        setExpandedRule(null);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    mobileViewport.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      mobileViewport.removeEventListener("change", closeOnDesktop);
    };
  }, [expandedRule]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  const closeExpandedRule = () => {
    setExpandedRule(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <main className="rules-page">
      <nav className="hero-nav" aria-label="Main navigation">
        <div className="hero-nav__links hero-nav__links--left">
          <a href="/rules" aria-label="Rules">
            <Image
              src="/images/navbar/button-1-rules.svg"
              alt="Rules"
              width={67}
              height={26}
              priority
            />
          </a>
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
        <Link
          className="hero-nav__brand-slot rules-page__brand"
          href="/"
          aria-label="Blackwood House home"
        >
          <Image
            src="/images/hero-svg.svg"
            alt="Blackwood House"
            width={964}
            height={127}
            priority
          />
        </Link>
        <div className="hero-nav__links hero-nav__links--right">
          <a className="hero-nav__register" href="#register" aria-label="Register now">
            <Image
              src="/images/navbar/button-3-register.svg"
              alt="Register now"
              width={158}
              height={58}
              priority
            />
          </a>
        </div>
        <button
          className="rules-page__menu-button"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="rules-page-mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          Menu
        </button>
      </nav>

      {isMenuOpen && (
        <nav
          className="rules-page__mobile-menu"
          id="rules-page-mobile-menu"
          aria-label="Mobile navigation"
        >
          <a href="/rules" onClick={() => setIsMenuOpen(false)}>
            <Image src="/images/navbar/button-1-rules.svg" alt="Rules" width={67} height={26} />
          </a>
          <Link href="/faq" onClick={() => setIsMenuOpen(false)}>
            <Image src="/images/navbar/button-2-faq.svg" alt="FAQ" width={43} height={28} />
          </Link>
          <a href="#register" onClick={() => setIsMenuOpen(false)}>
            <Image src="/images/navbar/button-3-register.svg" alt="Register now" width={158} height={58} />
          </a>
        </nav>
      )}

      <section className="rules-page__content" aria-labelledby="rules-heading">
        <h1 id="rules-heading">Rules</h1>
        <div className="rules-page__cards" aria-label="Blackwood House rules cards">
          {Array.from({ length: 5 }, (_, index) => (
            <div className={`rules-page__card rules-page__card--${index + 1}`} key={index + 1}>
              <button
                className="rules-page__card-trigger"
                type="button"
                aria-label={`Read rule ${index + 1} full screen`}
                onClick={(event) => {
                  if (!window.matchMedia("(max-width: 768px)").matches) return;
                  triggerRef.current = event.currentTarget;
                  setExpandedRule(index);
                }}
              >
                <HoloCard
                  image={`/cards/card-${index + 1}.jpg`}
                  alt={`Blackwood House rule ${index + 1}`}
                  width={220}
                  preset="gold"
                  foilColor="#e8d9b0"
                  intensity={0.7}
                  frame={3}
                  glare={0.45}
                  edgeSparkle={0.7}
                  tiltMax={12}
                  hoverScale={1.06}
                  radius={6}
                />
              </button>
            </div>
          ))}
        </div>
        <p className="rules-page__prompt">Click to read the rules</p>
        <div className="rules-page__footer">
          <p id="faq">Every card reveals another part of the house.</p>
          <a id="register" href="mailto:hello@blackwood.house">
            Request an invitation
          </a>
        </div>
      </section>

      {expandedRule !== null && (
        <div className="expanded-rule" role="presentation" onClick={closeExpandedRule}>
          <div
            className="expanded-rule__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Rule ${expandedRule + 1}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              className="expanded-rule__close"
              type="button"
              aria-label="Close expanded rule"
              onClick={closeExpandedRule}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m2 2 12 12M14 2 2 14" />
              </svg>
            </button>
            <Image
              className="expanded-rule__image"
              src={`/cards/card-${expandedRule + 1}.jpg`}
              alt={`Blackwood House rule ${expandedRule + 1}`}
              width={800}
              height={1200}
              priority
            />
          </div>
        </div>
      )}
    </main>
  );
}