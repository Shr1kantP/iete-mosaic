"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import HoloCard from "../../components/HoloCard";

const rules = Array.from({ length: 5 }, (_, index) => index + 1);

export default function RulesPage() {
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const cardButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const expandedRuleRef = useRef(-1);

  useEffect(() => {
    if (expandedRule === null) {
      cardButtonRefs.current[expandedRuleRef.current]?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedRule(null);
    };
    const mobileViewport = window.matchMedia("(max-width: 768px)");
    const closeOnDesktop = () => {
      if (!mobileViewport.matches) setExpandedRule(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    mobileViewport.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      mobileViewport.removeEventListener("change", closeOnDesktop);
    };
  }, [expandedRule]);

  const openRule = (rule: number) => {
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    expandedRuleRef.current = rule - 1;
    setExpandedRule(rule);
  };

  return (
    <main className="rules-page">
      <nav className="rules-nav" aria-label="Rules navigation">
        <Link href="/" className="rules-nav__menu">
          Menu
        </Link>
      </nav>

      <section className="rules-screen" aria-labelledby="rules-title">
        <h1 id="rules-title">Rules</h1>
        <div className="rules-cards" id="faq">
          {rules.map((rule) => (
            <div className={`rules-card rules-card--${rule}`} key={rule}>
              <button
                ref={(element) => {
                  cardButtonRefs.current[rule - 1] = element;
                }}
                className="rules-card__button"
                type="button"
                aria-label={`Open rule ${rule} full screen on mobile`}
                onClick={() => openRule(rule)}
              >
                <HoloCard
                  image={`/cards/card-${rule}.jpg`}
                  alt={`Blackwood House rule ${rule}`}
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
                  idle
                />
              </button>
            </div>
          ))}
        </div>
        <p className="rules-screen__prompt">Click to read the rules</p>
        <div className="rules-screen__footer">
          <a href="mailto:hello@blackwood.house" id="register">
            Request an invitation
          </a>
        </div>
      </section>

      {expandedRule !== null && (
        <div
          className="expanded-rule"
          role="presentation"
          onClick={() => setExpandedRule(null)}
        >
          <div
            className="expanded-rule__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Rule ${expandedRule}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              className="expanded-rule__close"
              type="button"
              aria-label="Close expanded rule"
              onClick={() => setExpandedRule(null)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m2 2 12 12M14 2 2 14" />
              </svg>
            </button>
            <Image
              className="expanded-rule__image"
              src={`/cards/card-${expandedRule}.jpg`}
              alt={`Blackwood House rule ${expandedRule}`}
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
