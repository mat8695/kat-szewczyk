"use client";

import { useRef } from "react";
import Button from "@/components/Button";
import Navigation from "@/components/Navigation/Navigation";
import GridAnimation from "@/components/GridAnimation/GridAnimation";
import styles from "./NotFound.module.css";

// Same heart animation the homepage Hero plays, same source file and same
// 0.45 opacity — the 404 is deliberately a stripped-down Hero.
const HEART_ANIMATION_SRC = "/animations/kat%20anim.json";

export default function NotFound() {
  const heartWrapRef = useRef<HTMLDivElement>(null);

  return (
    <section className={styles.notFound}>
      <Navigation />
      {/* Navigation is position: fixed, so it takes no space in this flex
          column — the spacer reserves its footprint the same way Hero's
          does. 52px here (not Hero's 64) is what puts the "404" on the
          vertical centre line of the design. */}
      <div className={styles.navSpacer} aria-hidden="true" />

      <div className={styles.codeWrap}>
        <GridAnimation
          src={HEART_ANIMATION_SRC}
          wrapperRef={heartWrapRef}
          className={styles.heartAnimation}
        />
        <h1 className={styles.code}>404</h1>
      </div>

      <div className={styles.bottomBar}>
        <Button href="/">Back to home</Button>
      </div>
    </section>
  );
}
