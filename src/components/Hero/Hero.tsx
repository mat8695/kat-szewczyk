"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/Button";
import Navigation from "@/components/Navigation/Navigation";
import GridAnimation from "@/components/GridAnimation/GridAnimation";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onOpenAbout?: () => void;
}

const HEART_ANIMATION_SRC = "/animations/kat%20anim.json";

const TAGLINE = (
  <>
    I'm a designer with a special love
    <br />
    for visual communication and
    <br />
    turning chaos into clarity.
  </>
);

export default function Hero({ onOpenAbout }: HeroProps) {
  const heartWrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Same isMobile-detection pattern as BackgroundGrid.tsx: render exactly
  // one JSX tree per breakpoint. Mobile and desktop stay genuinely
  // different structures — mobile keeps only the heart in a sticky,
  // scroll-scrubbed stage; the headline/buttons live in normal document
  // flow and just play a one-time entrance on load. Desktop is the
  // original static, centered layout.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 810px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Mobile-only: the heart drifts up and shrinks slightly as the user
  // scrolls through .hero. This is the only scroll-linked animation —
  // the headline/buttons are handled separately below and never touch
  // ScrollTrigger, which is what was causing the Safari repaint bug
  // (position: sticky + overflow clipping + a scrubbed transform on the
  // text). Values are tuned by eye against the reference.
  useEffect(() => {
    if (!isMobile) return;
    const hero = heroRef.current;
    const heart = heartWrapRef.current;
    if (!hero || !heart) return;

    const tween = gsap.to(heart, {
      y: "-20vh",
      scale: 0.85,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [isMobile]);

  // Mobile-only: one-time entrance once the Hero is mounted — not tied
  // to scroll at all. Headline and buttons move together as a single
  // block (heroContent), a small settle-into-place nudge rather than a
  // reveal, since they're already in normal flow, not hidden/clipped.
  useEffect(() => {
    if (!isMobile) return;
    const content = contentRef.current;
    if (!content) return;

    const tween = gsap.fromTo(
      content,
      { y: 80 },
      { y: 0, duration: 0.5, delay: 0.5, ease: "power2.out" }
    );

    return () => {
      tween.kill();
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <section className={styles.hero} ref={heroRef}>
        <Navigation />
        <div className={styles.navSpacer} aria-hidden="true" />

        <div className={styles.heartStage}>
          <GridAnimation
            src={HEART_ANIMATION_SRC}
            wrapperRef={heartWrapRef}
            className={styles.heartAnimation}
          />
        </div>

        <div className={styles.heroContent} ref={contentRef}>
          <h1 className={styles.tagline}>{TAGLINE}</h1>
          <div className={styles.mobileActions}>
            <Button href="/works">works</Button>
            <Button onClick={onOpenAbout}>about me</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.hero}>
      <Navigation />
      <div className={styles.navSpacer} aria-hidden="true" />

      <div className={styles.taglineWrap}>
        <GridAnimation
          src={HEART_ANIMATION_SRC}
          wrapperRef={heartWrapRef}
          className={styles.heartAnimation}
        />
        <h1 className={styles.tagline}>{TAGLINE}</h1>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          <Button href="/works">works</Button>
        </div>
        <div className={styles.bottomBarRight}>
          <Button onClick={onOpenAbout}>about me</Button>
        </div>
      </div>
    </section>
  );
}
