"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLImageElement>(null);
  const brandSlotRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

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
      const room = roomRef.current;
      const scrollHint = scrollHintRef.current;

      if (!stage || !wordmark || !brandSlot || !house || !sky || !room || !scrollHint) {
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
            scale: slotBounds.width / wordmark.offsetWidth,
          };
        };

        gsap.set(wordmark, { x: 0, y: 0, scale: 1, transformOrigin: "50% 50%" });
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
          gsap.set(room, { scale: 1 });
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

        timeline
          .to(
            house,
            { scale: 1.3, duration: 40, ease: "power2.inOut" },
            0,
          )
          .to(
            wordmark,
            {
              x: () => wordmarkTarget().x,
              y: () => wordmarkTarget().y,
              scale: () => wordmarkTarget().scale,
              duration: 40,
              ease: "power2.inOut",
            },
            0,
          )
          .to(
            scrollHint,
            { opacity: 0, duration: 12, ease: "power2.out" },
            0,
          )
          .to(house, { scale: 32.5, duration: 35, ease: "power2.inOut" }, 40)
          .to(sky, { scale: 1.16, opacity: 0, duration: 35, ease: "power2.inOut" }, 40)
          .to(room, { scale: 1, duration: 35, ease: "power2.inOut" }, 40)
          .to(house, { opacity: 0, duration: 25, ease: "power2.out" }, 75);
      }, stage);

      cleanup = () => context.revert();
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
          <Image
            src="/images/hero-background.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="sky-layer__image"
          />
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
          <Image
            src="/images/mask.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="house-art__mask"
          />
        </div>

        <nav className="hero-nav" aria-label="Main navigation">
          <div className="hero-nav__links hero-nav__links--left">
            <a href="#rules">Rules</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="hero-nav__brand-slot" ref={brandSlotRef} aria-hidden="true" />
          <a className="hero-nav__register" href="#register">
            Register now
          </a>
        </nav>

        <div className="scroll-hint" ref={scrollHintRef} aria-hidden="true">
          <span>Scroll</span>
          <span className="scroll-hint__arrow" />
        </div>
      </section>

      <section className="story-section" id="rules">
        <div className="story-section__content">
          <p className="eyebrow">A place with a past</p>
          <h1>The house remembers.</h1>
          <p className="story-section__intro">
            Some doors are better left unopened. At Blackwood House, the
            curious are welcome—but the house has rules of its own.
          </p>
          <div className="story-section__links">
            <a id="faq" href="#register">
              Read the house rules
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
