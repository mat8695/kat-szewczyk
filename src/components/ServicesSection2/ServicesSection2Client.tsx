"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import Arrow, { type ArrowHandle } from "@/components/Arrow";
import LanguageSwitch, { type Language } from "@/components/LanguageSwitch/LanguageSwitch";
import { SHARP_EASE } from "@/lib/easing";
import type { SanityServiceCategory } from "@/components/Services/types";
import styles from "./ServicesSection2.module.css";

interface ServicesSection2ClientProps {
  categories: SanityServiceCategory[];
}

interface ServiceColumnProps {
  category: SanityServiceCategory;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function ServiceColumn({ category, language, onLanguageChange }: ServiceColumnProps) {
  const bodyId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<ArrowHandle>(null);
  const isFirstRun = useRef(true);

  const [isOpen, setIsOpen] = useState(false);

  const description = language === "en" ? category.descriptionEN : category.descriptionPL;

  // Blank lines typed in the CMS split the text into separate <p> blocks
  // rather than relying on `white-space: pre-line` to render them inside one
  // block. Chromium's line balancer only balances until it exhausts a ~6-line
  // budget per block, so in a single <p> the last paragraph was always left
  // ragged; as its own block each paragraph gets balanced independently.
  const paragraphs = (description ?? "")
    .split(/\r?\n[ \t]*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  // CSS owns the collapsed resting state (height 0 / opacity 0); GSAP only
  // animates the transition — same split as WorkHero's read-more panel and
  // AboutOverlay's slide. Skipped on mount so the closed state doesn't get
  // re-animated to where CSS already put it. `language` is a dependency
  // because switching EN/PL changes the text's natural height, and an open
  // panel is pinned to a fixed px height by the previous tween.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const tween = isOpen
      ? gsap.to(el, { height: "auto", opacity: 1, duration: 0.5, ease: SHARP_EASE })
      : gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: SHARP_EASE });

    return () => {
      tween.kill();
    };
  }, [isOpen, language]);

  // Arrow is driven externally (interactive={false}) rather than by its own
  // hover listeners: the hover target here is the whole SEE MORE button, not
  // just the circle, and the filled state has to persist while the column is
  // open instead of reverting the moment the pointer leaves.
  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) arrowRef.current?.play();
    else arrowRef.current?.reverse();
  };

  const handleMouseEnter = () => arrowRef.current?.play();
  const handleMouseLeave = () => {
    if (!isOpen) arrowRef.current?.reverse();
  };

  return (
    <div className={styles.column}>
      <h2 className={styles.heading}>{category.title}</h2>

      <button
        type="button"
        className={styles.toggle}
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-expanded={isOpen}
        aria-controls={bodyId}
      >
        <span className={styles.toggleLabel}>see more</span>
        <Arrow ref={arrowRef} size={46} interactive={false} className={styles.arrow} />
      </button>

      {/* EN | PL sits above the description text inside the revealed panel,
          the same position it holds on the /works/[slug] pages. */}
      <div id={bodyId} ref={bodyRef} className={styles.body} aria-hidden={!isOpen}>
        <div className={styles.bodyInner}>
          <LanguageSwitch
            language={language}
            onChange={onLanguageChange}
            className={styles.languageSwitch}
          />
          {paragraphs.length > 0 && (
            <div className={styles.description}>
              {paragraphs.map((paragraph, index) => (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection2Client({ categories }: ServicesSection2ClientProps) {
  // One language for the whole section — picking PL in one column switches
  // the other too, rather than letting the two columns disagree.
  const [language, setLanguage] = useState<Language>("en");

  if (!categories.length) return null;

  // id="services" is the anchor the Footer's Services link (/#services)
  // targets — it moved here from the old Services section when this one
  // replaced it on the homepage.
  return (
    <section id="services" className={styles.section} aria-label="Services">
      <div className={styles.grid}>
        {categories.map((category) => (
          <ServiceColumn
            key={category._id}
            category={category}
            language={language}
            onLanguageChange={setLanguage}
          />
        ))}
      </div>
    </section>
  );
}
