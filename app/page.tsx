"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import SiteNav from "../components/SiteNav";

type LetterPage = 1 | 2;

function LetterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const envelopeButtonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const frontPageRef = useRef<HTMLButtonElement>(null);
  const backPageRef = useRef<HTMLButtonElement>(null);
  const backShadeRef = useRef<HTMLSpanElement>(null);
  const pageHintRef = useRef<HTMLParagraphElement>(null);
  const openingTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const pageTurnTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const finishCloseRef = useRef<(() => void) | null>(null);
  const hintDelayRef = useRef<gsap.core.Tween | null>(null);
  const openingOriginRef = useRef({ x: 0, y: 0 });
  const pointerStartXRef = useRef<number | null>(null);
  const swipedRef = useRef(false);
  const bodyOverflowRef = useRef("");
  const closingRef = useRef(false);
  const modalActiveRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<LetterPage>(1);
  const [showRulesReminder, setShowRulesReminder] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const envelope = envelopeRef.current;
    const overlay = overlayRef.current;
    const backdrop = backdropRef.current;
    const dialog = dialogRef.current;
    const heading = headingRef.current;
    const frontPage = frontPageRef.current;
    const backPage = backPageRef.current;
    const backShade = backShadeRef.current;
    const pageHint = pageHintRef.current;

    if (
      !section ||
      !envelope ||
      !overlay ||
      !backdrop ||
      !dialog ||
      !heading ||
      !frontPage ||
      !backPage ||
      !backShade ||
      !pageHint
    ) {
      return;
    }

    const desktopRoomImage =
      section.parentElement?.querySelector<HTMLImageElement>(
        ".room-layer__image--desktop",
      );
    const positionDesktopEnvelopeTarget = () => {
      if (!desktopRoomImage || !desktopRoomImage.naturalWidth) {
        return;
      }

      if (window.matchMedia("(max-width: 768px)").matches) {
        envelope.style.removeProperty("left");
        envelope.style.removeProperty("top");
        envelope.style.removeProperty("width");
        envelope.style.removeProperty("height");
        return;
      }

      const sectionWidth = section.clientWidth;
      const sectionHeight = section.clientHeight;
      const imageScale = Math.max(
        sectionWidth / desktopRoomImage.naturalWidth,
        sectionHeight / desktopRoomImage.naturalHeight,
      );
      const renderedWidth = desktopRoomImage.naturalWidth * imageScale;
      const renderedHeight = desktopRoomImage.naturalHeight * imageScale;
      const imageLeft = (sectionWidth - renderedWidth) / 2;
      const imageTop = (sectionHeight - renderedHeight) / 2;

      envelope.style.left = `${imageLeft + renderedWidth * 0.435}px`;
      envelope.style.top = `${imageTop + renderedHeight * 0.715}px`;
      envelope.style.width = `${renderedWidth * 0.25}px`;
      envelope.style.height = `${renderedHeight * 0.17}px`;
    };

    positionDesktopEnvelopeTarget();
    desktopRoomImage?.addEventListener("load", positionDesktopEnvelopeTarget);
    window.addEventListener("resize", positionDesktopEnvelopeTarget);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    finishCloseRef.current = () => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(envelope, { opacity: 1, scale: 1, x: 0, y: 0 });
      gsap.set(heading, { opacity: 1 });
      gsap.set(frontPage, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        rotation: reducedMotion ? 0 : -1,
        opacity: 0,
        zIndex: 2,
      });
      gsap.set(backPage, {
        xPercent: -50,
        yPercent: -50,
        x: reducedMotion ? 0 : 10,
        y: reducedMotion ? 0 : 8,
        scale: 1,
        rotation: reducedMotion ? 0 : 2,
        opacity: 0,
        zIndex: 1,
      });
      gsap.set(backShade, { opacity: reducedMotion ? 0 : 0.15 });
      gsap.set(pageHint, { opacity: 0 });
      closingRef.current = false;
      modalActiveRef.current = false;
      setIsOpen(false);
      setCurrentPage(1);
      document.body.style.overflow = bodyOverflowRef.current;
      envelopeButtonRef.current?.focus();
    };

    const context = gsap.context(() => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(heading, { opacity: 1 });
      gsap.set(frontPage, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        rotation: reducedMotion ? 0 : -1,
        opacity: 0,
        zIndex: 2,
        transformOrigin: "50% 50%",
        willChange: "transform",
      });
      gsap.set(backPage, {
        xPercent: -50,
        yPercent: -50,
        x: reducedMotion ? 0 : 10,
        y: reducedMotion ? 0 : 8,
        scale: 1,
        rotation: reducedMotion ? 0 : 2,
        opacity: 0,
        zIndex: 1,
        transformOrigin: "50% 50%",
        willChange: "transform",
      });
      gsap.set(backShade, { opacity: reducedMotion ? 0 : 0.15 });
      gsap.set(pageHint, { opacity: 0 });

      const openingDuration = reducedMotion ? 0.2 : 0.75;
      const openingTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: () => {
          hintDelayRef.current?.kill();
          hintDelayRef.current = gsap.delayedCall(2, () => {
            gsap.to(pageHint, {
              opacity: 0,
              duration: reducedMotion ? 0.2 : 0.25,
            });
          });
        },
        onReverseComplete: () => finishCloseRef.current?.(),
      });

      if (reducedMotion) {
        openingTimeline
          .to(overlay, { autoAlpha: 1, duration: 0.2 }, 0)
          .to(backdrop, { opacity: 1, duration: 0.2 }, 0)
          .to(envelope, { opacity: 0, duration: 0.2 }, 0)
          .fromTo(frontPage, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
          .fromTo(backPage, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
          .to(pageHint, { opacity: 1, duration: 0.2 }, 0)
          .to(heading, { opacity: 0, duration: 0.2 }, 0);
      } else {
        openingTimeline
          .to(overlay, { autoAlpha: 1, duration: 0.4 }, 0)
          .to(backdrop, { opacity: 1, duration: 0.4 }, 0)
          .fromTo(
            envelope,
            { opacity: 1, scale: 1, y: 0 },
            { opacity: 0, scale: 1.15, duration: 0.4 },
            0.08,
          )
          .fromTo(
            backPage,
            {
              x: () => openingOriginRef.current.x,
              y: () => openingOriginRef.current.y,
              scale: 0.2,
              opacity: 0,
              rotation: 2,
            },
            {
              x: 10,
              y: 8,
              scale: 1,
              opacity: 1,
              duration: openingDuration,
            },
            0.25,
          )
          .fromTo(
            frontPage,
            {
              x: () => openingOriginRef.current.x,
              y: () => openingOriginRef.current.y,
              scale: 0.2,
              opacity: 0,
              rotation: -1,
            },
            {
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              duration: openingDuration,
            },
            0.35,
          )
          .to(pageHint, { opacity: 1, duration: 0.25 }, 0.85)
          .to(heading, { opacity: 0, duration: 0.25 }, 0.1);
      }

      const pageTurnTimeline = gsap.timeline({
        paused: true,
        defaults: {
          duration: reducedMotion ? 0.2 : 0.7,
          ease: "power3.out",
        },
        onComplete: () => {
          gsap.set(backPage, { zIndex: 3 });
          gsap.set(frontPage, { zIndex: 2 });
          gsap.killTweensOf(pageHint);
          gsap.set(pageHint, { opacity: 1 });
          gsap.set(backShade, { opacity: 0 });
          hintDelayRef.current?.kill();
          setCurrentPage(2);
          requestAnimationFrame(() => backPage.focus());
        },
        onReverseComplete: () => {
          gsap.set(backPage, { zIndex: 1 });
          gsap.set(frontPage, { zIndex: 2 });
          if (closingRef.current) return;
          gsap.killTweensOf(pageHint);
          gsap.to(pageHint, { opacity: 0, duration: 0.2 });
          setCurrentPage(1);
          requestAnimationFrame(() => frontPage.focus());
        },
      });

      if (reducedMotion) {
        pageTurnTimeline
          .to(frontPage, { opacity: 0 }, 0)
          .to(backPage, { opacity: 1 }, 0)
          .to(backShade, { opacity: 0 }, 0);
      } else {
        pageTurnTimeline
          .to(frontPage, { xPercent: -110, rotation: -12, opacity: 0 }, 0)
          .to(backPage, { x: 0, y: 0, rotation: 0 }, 0)
          .to(backShade, { opacity: 0 }, 0);
      }

      openingTimelineRef.current = openingTimeline;
      pageTurnTimelineRef.current = pageTurnTimeline;
    }, sectionRef);

    return () => {
      hintDelayRef.current?.kill();
      desktopRoomImage?.removeEventListener(
        "load",
        positionDesktopEnvelopeTarget,
      );
      window.removeEventListener("resize", positionDesktopEnvelopeTarget);
      finishCloseRef.current = null;
      openingTimelineRef.current = null;
      pageTurnTimelineRef.current = null;
      if (modalActiveRef.current) {
        document.body.style.overflow = bodyOverflowRef.current;
        modalActiveRef.current = false;
      }
      context.revert();
    };
  }, []);

  const openLetter = () => {
    const envelope = envelopeRef.current;
    const button = envelopeButtonRef.current;
    const overlay = overlayRef.current;
    const dialog = dialogRef.current;
    const openingTimeline = openingTimelineRef.current;
    if (
      !envelope ||
      !button ||
      !overlay ||
      !dialog ||
      !openingTimeline ||
      modalActiveRef.current
    ) {
      return;
    }

    setShowRulesReminder(false);

    const bounds = button.getBoundingClientRect();
    openingOriginRef.current = {
      x: bounds.left + bounds.width / 2 - window.innerWidth / 2,
      y: bounds.top + bounds.height / 2 - window.innerHeight / 2,
    };
    gsap.killTweensOf(envelope);
    hintDelayRef.current?.kill();
    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalActiveRef.current = true;
    closingRef.current = false;
    setCurrentPage(1);
    setIsOpen(true);
    gsap.set(overlay, { autoAlpha: 0, pointerEvents: "auto" });
    gsap.set(envelope, { opacity: 1, scale: 1, y: 0 });
    gsap.set(headingRef.current, { opacity: 1 });
    openingTimeline.invalidate();
    gsap.set(backdropRef.current, { opacity: 0 });
    gsap.set(pageHintRef.current, { opacity: 0 });
    openingTimeline.restart();
    dialog.focus();
  };

  const closeLetter = useCallback(() => {
    const openingTimeline = openingTimelineRef.current;
    const pageTurnTimeline = pageTurnTimelineRef.current;
    if (!openingTimeline || !modalActiveRef.current || closingRef.current) return;

    const completedLetter = currentPage === 2 || (pageTurnTimeline?.progress() ?? 0) > 0;

    hintDelayRef.current?.kill();
    gsap.killTweensOf(pageHintRef.current);
    closingRef.current = true;
    if (completedLetter) {
      pageTurnTimeline?.pause(0);
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (frontPageRef.current) {
        gsap.set(frontPageRef.current, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          scale: 1,
          rotation: reducedMotion ? 0 : -1,
          opacity: 1,
          zIndex: 2,
        });
      }
      if (backPageRef.current) {
        gsap.set(backPageRef.current, {
          xPercent: -50,
          yPercent: -50,
          x: reducedMotion ? 0 : 10,
          y: reducedMotion ? 0 : 8,
          scale: 1,
          rotation: reducedMotion ? 0 : 2,
          opacity: 1,
          zIndex: 1,
        });
      }
      if (backShadeRef.current) {
        gsap.set(backShadeRef.current, {
          opacity: reducedMotion ? 0 : 0.15,
        });
      }
    }
    setCurrentPage(1);
    if (completedLetter) {
      setShowRulesReminder(true);
    }
    if (openingTimeline.progress() === 0) {
      openingTimeline.pause(0);
      finishCloseRef.current?.();
      return;
    }
    openingTimeline.reverse();
  }, [currentPage]);

  const turnPageForward = useCallback(() => {
    if (currentPage !== 1) return;
    const timeline = pageTurnTimelineRef.current;
    if (!timeline) return;
    timeline.play();
  }, [currentPage]);

  const turnPageBackward = useCallback(() => {
    if (currentPage !== 2) return;
    pageTurnTimelineRef.current?.reverse();
  }, [currentPage]);

  const togglePage = useCallback(() => {
    if (currentPage === 1) turnPageForward();
    else turnPageBackward();
  }, [currentPage, turnPageBackward, turnPageForward]);

  useEffect(() => {
    if (!isOpen) return;

    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLetter();
        return;
      }

      if (event.key === "ArrowRight" && currentPage === 1) {
        event.preventDefault();
        turnPageForward();
        return;
      }

      if (event.key === "ArrowLeft" && currentPage === 2) {
        event.preventDefault();
        turnPageBackward();
        return;
      }

      if (event.key === "Enter" && event.target !== closeButtonRef.current) {
        event.preventDefault();
        togglePage();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          (element) =>
            !element.closest("[inert]") && element.getClientRects().length > 0,
        );
        if (!focusable.length) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialogRef.current ||
            !dialogRef.current.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === dialogRef.current ||
            !dialogRef.current.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleDialogKeys, true);
    return () =>
      document.removeEventListener("keydown", handleDialogKeys, true);
  }, [
    closeLetter,
    currentPage,
    isOpen,
    togglePage,
    turnPageBackward,
    turnPageForward,
  ]);

  const handlePagePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerStartXRef.current = event.clientX;
    swipedRef.current = false;
  };

  const handlePagePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const startX = pointerStartXRef.current;
    pointerStartXRef.current = null;
    if (startX === null || Math.abs(event.clientX - startX) < 50) return;

    swipedRef.current = true;
    if (event.clientX < startX) turnPageForward();
    else turnPageBackward();
  };

  const handleEnvelopePointerEnter = () => {
    if (modalActiveRef.current || !envelopeRef.current) return;
    gsap.to(envelopeRef.current, {
      scale: 1.05,
      duration: 0.2,
      overwrite: "auto",
    });
  };

  const handleEnvelopePointerLeave = () => {
    const envelope = envelopeRef.current;
    if (modalActiveRef.current || !envelope) return;
    gsap.to(envelope, {
      scale: 1,
      duration: 0.25,
      overwrite: "auto",
    });
  };

  return (
    <section
      className="letter-section"
      ref={sectionRef}
      aria-label="Read Judy's letter"
    >
      <div className="letter-section__shade" aria-hidden="true" />

      <div className="letter-envelope-wrap" ref={envelopeRef}>
        <button
          className="letter-envelope"
          type="button"
          aria-label="Open Judy's letter"
          ref={envelopeButtonRef}
          onClick={openLetter}
          onPointerEnter={handleEnvelopePointerEnter}
          onPointerLeave={handleEnvelopePointerLeave}
          onFocus={handleEnvelopePointerEnter}
          onBlur={handleEnvelopePointerLeave}
        >
          <Image
            src="/images/letters/letter.png"
            alt=""
            width={348}
            height={68}
            unoptimized
            className="letter-envelope__image"
          />
        </button>
      </div>

      <h6 className="letter-section__heading" ref={headingRef}>
        Read Judy&apos;s letter
      </h6>

      <div
        className="letter-overlay"
        ref={overlayRef}
        aria-hidden={!isOpen}
        onClick={(event) => {
          if (
            event.target instanceof Element &&
            !event.target.closest(".letter-page, .letter-dialog__close")
          ) {
            closeLetter();
          }
        }}
      >
        <div
          className="letter-overlay__backdrop"
          ref={backdropRef}
          aria-hidden="true"
        />
        <div
          className="letter-dialog"
          role="dialog"
          aria-modal={isOpen}
          aria-label="Judy's letter"
          tabIndex={-1}
          ref={dialogRef}
        >
          <button
            className="letter-dialog__close"
            type="button"
            aria-label="Close Judy's letter"
            ref={closeButtonRef}
            onClick={closeLetter}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>

          <div className="letter-page-stage">
            <button
              className="letter-page letter-page--back"
              type="button"
              aria-label="Turn to page 1"
              aria-hidden={currentPage !== 2}
              inert={currentPage !== 2}
              ref={backPageRef}
              onClick={() => {
                if (swipedRef.current) {
                  swipedRef.current = false;
                  return;
                }
                turnPageBackward();
              }}
              onPointerDown={handlePagePointerDown}
              onPointerUp={handlePagePointerUp}
            >
              <Image
                src="/images/letters/letter-back.jpg"
                alt="Judy's letter, page 2"
                width={800}
                height={1200}
                sizes="(max-width: 768px) 92vw, 60vh"
                preload
              />
              <span
                className="letter-page__shade"
                aria-hidden="true"
                ref={backShadeRef}
              />
            </button>

            <button
              className="letter-page letter-page--front"
              type="button"
              aria-label="Turn to page 2"
              aria-hidden={currentPage !== 1}
              inert={currentPage !== 1}
              ref={frontPageRef}
              onClick={() => {
                if (swipedRef.current) {
                  swipedRef.current = false;
                  return;
                }
                turnPageForward();
              }}
              onPointerDown={handlePagePointerDown}
              onPointerUp={handlePagePointerUp}
            >
              <Image
                src="/images/letters/letter-front.jpg"
                alt="Judy's letter, page 1"
                width={800}
                height={1200}
                sizes="(max-width: 768px) 92vw, 60vh"
                preload
              />
            </button>
          </div>

          <p className="letter-page-hint" ref={pageHintRef} aria-live="polite">
            {currentPage === 2 ? "Page 2 of 2" : "Click the page to turn"}
          </p>
        </div>
      </div>

      {showRulesReminder && (
        <div
          className="letter-rules-pop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="letter-rules-pop-title"
          onClick={() => setShowRulesReminder(false)}
        >
          <div
            className="letter-rules-pop__card"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="letter-rules-pop__eyebrow">Before you continue</p>
            <h2 id="letter-rules-pop-title">Check the house rules</h2>
            <p>
              You&apos;ve read Judy&apos;s letter. Take a moment to confirm the
              house rules before you move on.
            </p>
            <div className="letter-rules-pop__actions">
              <button
                type="button"
                className="letter-rules-pop__button"
                onClick={() => setShowRulesReminder(false)}
              >
                Continue
              </button>
              <Link
                href="/rules"
                className="letter-rules-pop__link"
                onClick={() => setShowRulesReminder(false)}
              >
                Read rules
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLImageElement>(null);
  const brandSlotRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const skyImageFrameRef = useRef<HTMLDivElement>(null);
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
      const skyImageFrame = skyImageFrameRef.current;
      const room = roomRef.current;
      const scrollHint = scrollHintRef.current;
      const letterSection =
        stage?.querySelector<HTMLElement>(".letter-section") ?? null;
      if (
        !stage ||
        !wordmark ||
        !brandSlot ||
        !house ||
        !sky ||
        !skyImageFrame ||
        !room ||
        !scrollHint ||
        !letterSection
      ) {
        return;
      }

      const context = gsap.context(() => {
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        const wordmarkTarget = () => {
          const stageBounds = stage.getBoundingClientRect();
          const slotBounds = brandSlot.getBoundingClientRect();
          const startCenterX = stageBounds.width / 2;
          const startCenterY = stageBounds.height * 0.43;
          const targetCenterX = isMobile
            ? startCenterX
            : slotBounds.left - stageBounds.left + slotBounds.width / 2;
          const targetCenterY = isMobile
            ? Math.max(100, stageBounds.height * 0.14)
            : slotBounds.top - stageBounds.top + slotBounds.height / 2;

          return {
            x: targetCenterX - startCenterX,
            y: targetCenterY - startCenterY,
            scale: isMobile ? 1 : slotBounds.height / wordmark.offsetHeight,
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
        gsap.set(letterSection, { autoAlpha: 0 });
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.set(wordmark, wordmarkTarget());
          gsap.set([house, sky], { opacity: 0 });
          gsap.set(room, { scale: 1, opacity: 1 });
          gsap.set(letterSection, { autoAlpha: 1 });
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
            id: "home-journey",
          },
        });

        timeline
          .to(
            wordmark,
            {
              x: () => wordmarkTarget().x,
              y: () => wordmarkTarget().y,
              scale: () => wordmarkTarget().scale,
              duration: 1.6,
              ease: isMobile ? "none" : "power2.inOut",
            },
            isMobile ? 1 : 0,
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
          .to(house, { opacity: 0, duration: 1, ease: "power2.out" }, 3)
          .to(letterSection, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 3.5);
      }, stage);

      let refreshFrame = 0;
      let letterNavigationFrame = 0;
      const refreshForViewportChange = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      window.addEventListener("resize", refreshForViewportChange);
      window.visualViewport?.addEventListener("resize", refreshForViewportChange);
      cleanup = () => {
        cancelAnimationFrame(refreshFrame);
        cancelAnimationFrame(letterNavigationFrame);
        window.removeEventListener("resize", refreshForViewportChange);
        window.visualViewport?.removeEventListener("resize", refreshForViewportChange);
        context.revert();
      };
      ScrollTrigger.refresh();
      if (window.location.hash === "#letter") {
        letterNavigationFrame = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          const homeTrigger = ScrollTrigger.getById("home-journey");
          if (homeTrigger) homeTrigger.scroll(homeTrigger.end);
        });
      }
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <main className="blackwood-page">
      <SiteNav brandSlotRef={brandSlotRef} brandHref="/#letter" />

      <section
        className="hero-stage"
        ref={stageRef}
        id="letter"
        aria-label="Blackwood House"
      >
        <div className="room-layer" ref={roomRef} aria-hidden="true">
          <Image
            src="/images/room.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="room-layer__image room-layer__image--desktop"
          />
          <Image
            src="/images/background/the-room-vertical.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="room-layer__image room-layer__image--mobile"
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
        <LetterSection />
      </section>
    </main>
  );
}