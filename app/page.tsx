"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuPortalRoot, setMenuPortalRoot] = useState<HTMLElement | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMenuFocusRef = useRef(false);
  const wordmarkRef = useRef<HTMLImageElement>(null);
  const brandSlotRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const skyImageFrameRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setMenuPortalRoot(document.body);
  }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    void import("gsap").then(async ({ default: gsap }) => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const stage = stageRef.current;
      const wordmark = wordmarkRef.current;
      const brandSlot = brandSlotRef.current;
      const house = houseRef.current;
      const sky = skyRef.current;
      const skyImageFrame = skyImageFrameRef.current;
      const room = roomRef.current;
      const scrollHint = scrollHintRef.current;
      if (
        !stage ||
        !wordmark ||
        !brandSlot ||
        !house ||
        !sky ||
        !skyImageFrame ||
        !room ||
        !scrollHint
      ) {
        return;
      }

      const context = gsap.context(() => {
        const wordmarkTarget = () => {
          const stageBounds = stage.getBoundingClientRect();
          const slotBounds = brandSlot.getBoundingClientRect();
          const startCenterX = stageBounds.width / 2;
          const startCenterY = stageBounds.height * 0.43;
          const targetCenterX =
            slotBounds.left - stageBounds.left + slotBounds.width / 2;
          const targetCenterY =
            slotBounds.top - stageBounds.top + slotBounds.height / 2;

          return {
            x: targetCenterX - startCenterX,
            y: targetCenterY - startCenterY,
            scale: slotBounds.height / wordmark.offsetHeight,
          };
        };

        gsap.set(wordmark, {
          x: 0,
          y: 0,
          scale: 1,
          transformOrigin: "50% 50%",
        });
        gsap.set(house, {
          scale: 1.04,
          transformOrigin: "50% 82%",
          willChange: "transform",
        });
        gsap.set(sky, { scale: 1, opacity: 1, willChange: "transform" });
        gsap.set(room, { scale: 0.9, opacity: 1, willChange: "transform" });
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.set(wordmark, wordmarkTarget());
          gsap.set([house, sky], { opacity: 0 });
          gsap.set(room, { scale: 1, opacity: 1 });
          gsap.set(scrollHint, { opacity: 0 });
          return;
        }

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 0.15,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const pinSpacer = stage.parentElement;
        if (pinSpacer?.classList.contains("pin-spacer")) {
          gsap.set(pinSpacer, { pointerEvents: "none" });
        }

        timeline
          .to(
            wordmark,
            {
              x: () => wordmarkTarget().x,
              y: () => wordmarkTarget().y,
              scale: () => wordmarkTarget().scale,
              duration: 1.6,
              ease: "power2.inOut",
            },
            0,
          )
          .to(
            house,
            { scale: 1.3, duration: 1.6, ease: "power2.inOut" },
            0,
          )
          .to(
            scrollHint,
            { opacity: 0, duration: 0.48, ease: "power2.out" },
            0,
          )
          .to(house, { scale: 32.5, duration: 1.4, ease: "power2.inOut" }, 1.6)
          .to(sky, { scale: 1.16, opacity: 0, duration: 1.4, ease: "power2.inOut" }, 1.6)
          .to(room, { scale: 1, duration: 1.4, ease: "power2.inOut" }, 1.6)
          .to(house, { opacity: 0, duration: 1, ease: "power2.out" }, 3);
      }, stage);

      let refreshFrame = 0;
      const refreshForViewportChange = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      window.addEventListener("resize", refreshForViewportChange);
      window.visualViewport?.addEventListener("resize", refreshForViewportChange);

      cleanup = () => {
        cancelAnimationFrame(refreshFrame);
        window.removeEventListener("resize", refreshForViewportChange);
        window.visualViewport?.removeEventListener("resize", refreshForViewportChange);
        context.revert();
      };
      ScrollTrigger.refresh();
    });

    return () => {
      disposed = true;
      cleanup();
    };
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
    <main className="blackwood-page">
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
          {isMobileMenuOpen ? "Close" : "Menu"}
        </button>
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
          <a href="/rules#faq" aria-label="Frequently asked questions">
            <Image
              src="/images/navbar/button-2-faq.svg"
              alt="FAQ"
              width={43}
              height={28}
              priority
            />
          </a>
        </div>
        <div className="hero-nav__brand-slot" ref={brandSlotRef} aria-hidden="true" />
        <div className="hero-nav__links hero-nav__links--right">
         {/*  <a href="#rules">About game</a> */}
          <a className="hero-nav__register" href="/rules#register" aria-label="Register now">
            <Image
              src="/images/navbar/button-3-register.svg"
              alt="Register now"
              width={200}
              height={100}
              priority
            />
          </a>
        </div>
      </nav>

      <section
        className="hero-stage"
        ref={stageRef}
        style={{ pointerEvents: "none" }}
        aria-label="Blackwood House"
      >
        <div className="room-layer" ref={roomRef} aria-hidden="true">
          <Image
            src="/images/room.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="room-layer__image"
          />
        </div>
        <div className="sky-layer" ref={skyRef} aria-hidden="true">
          <div className="sky-layer__frame" ref={skyImageFrameRef}>
            <Image
              src="/images/hero-background.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 269vw, 100vw"
              className="sky-layer__image"
            />
          </div>
        </div>

        <Image
          ref={wordmarkRef}
          src="/images/hero-svg.svg"
          alt="Blackwood House"
          width={964}
          height={127}
          priority
          className="hero-wordmark"
        />

        <div className="house-art" ref={houseRef} aria-hidden="true">
          <div className="house-art__mask-frame">
            <Image
              src="/images/mask.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 223vw, 100vw"
              className="house-art__mask"
            />
          </div>
        </div>

        <div className="scroll-hint" ref={scrollHintRef} aria-hidden="true">
          <span>Scroll</span>
          <span className="scroll-hint__arrow" />
        </div>
      </section>

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
                <a
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
                </a>
                <a
                  href="/rules#faq"
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
                </a>
                <a
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
                </a>
              </nav>
              <p className="hero-mobile-menu__footer">A place with a past</p>
            </div>
          </div>,
          menuPortalRoot,
        )}

      <section className="final-room" aria-label="The room" />
    </main>
  );
}