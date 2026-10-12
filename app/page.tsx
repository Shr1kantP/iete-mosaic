"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import HoloCard from "../components/HoloCard";

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLImageElement>(null);
  const brandSlotRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const skyImageFrameRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<HTMLDivElement[]>([]);

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
      const cardWrappers = cardWrapperRefs.current.filter(Boolean);

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

      const mobileLayout = window.matchMedia("(max-width: 640px)").matches;

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
            scale: (slotBounds.width * 0.7) / wordmark.offsetWidth,
          };
        };

        gsap.set(wordmark, {
          ...(mobileLayout ? { x: 0, y: 0, scale: 1 } : wordmarkTarget()),
          transformOrigin: "50% 50%",
        });
        gsap.set(house, {
          scale: 1.04,
          transformOrigin: "50% 82%",
          willChange: "transform",
        });
        gsap.set(sky, { scale: 1, opacity: 1, willChange: "transform" });
        gsap.set(room, { scale: 0.9, opacity: 1, willChange: "transform" });
        gsap.set(cardWrappers, { autoAlpha: 0, y: 80 });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.set(wordmark, wordmarkTarget());
          gsap.set([house, sky], { opacity: 0 });
          gsap.set(room, { scale: 1, opacity: 0 });
          gsap.set(scrollHint, { opacity: 0 });
          gsap.set(cardWrappers, { autoAlpha: 1, y: 0 });
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

        if (mobileLayout) {
          timeline.to(
            wordmark,
            {
              x: () => wordmarkTarget().x,
              y: () => wordmarkTarget().y,
              scale: () => wordmarkTarget().scale,
              duration: 1.6,
              ease: "power2.inOut",
            },
            0,
          );
        }

        timeline
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
          .to(house, { opacity: 0, duration: 1, ease: "power2.out" }, 3)
          .to(room, { opacity: 0, duration: 1, ease: "power2.out" }, 3)
          .to(
            cardWrappers,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.08,
              ease: "power2.out",
            },
            3,
          );
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

  return (
    <main className="blackwood-page">
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

        <nav className="hero-nav" aria-label="Main navigation">
          <a className="hero-nav__mobile-menu" href="#rules" aria-label="Menu">
            Menu
          </a>
          <div className="hero-nav__links hero-nav__links--left">
            <a href="#rules" aria-label="Rules">
              <Image
                src="/images/navbar/button-1-rules.svg"
                alt="Rules"
                width={67}
                height={26}
                priority
              />
            </a>
            <a href="#faq" aria-label="Frequently asked questions">
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
          <a className="hero-nav__register" href="#register" aria-label="Register now">
            <Image
              src="/images/navbar/button-3-register.svg"
              alt="Register now"
              width={158}
              height={58}
              priority
            />
          </a>
        </nav>

        <div className="scroll-hint" ref={scrollHintRef} aria-hidden="true">
          <span>Scroll</span>
          <span className="scroll-hint__arrow" />
        </div>
      </section>

      <section className="story-section" id="rules" aria-label="Blackwood House room">
        <div className="story-section__content">
          <p className="eyebrow">A place with a past</p>
          <div className="room-cards">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                className={`room-card-wrap room-card-wrap--${index + 1}`}
                key={index + 1}
                ref={(element) => {
                  if (element) cardWrapperRefs.current[index] = element;
                }}
              >
                <HoloCard
                  image={`/cards/card-${index + 1}.jpg`}
                  alt={`Blackwood House rules card ${index + 1}`}
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
                  idle={true}
                />
              </div>
            ))}
          </div>
          <h1>Read the Blackwood House rules</h1>
          <p className="story-section__intro">
            Every card reveals another part of the house. Take a closer look
            before you step inside.
          </p>
          <div className="story-section__links">
            <a id="faq" href="#register">
              Frequently asked questions
            </a>
            <a id="register" href="mailto:hello@blackwood.house">
              Request an invitation
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
