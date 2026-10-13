"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import HoloCard from "../../components/HoloCard";
import SiteNav from "../../components/SiteNav";

export default function RulesPage() {
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
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

  const closeExpandedRule = () => {
    setExpandedRule(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <main className="rules-page">
      <SiteNav showBrandMark brandHref="/#letter" />

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