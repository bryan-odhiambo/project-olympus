/**
 * GSAP + ScrollTrigger orchestration for the entire deck.
 * Loaded once from Base.astro. Each section opts in via data attributes
 * or known IDs — no per-section script tags.
 *
 * Respects `prefers-reduced-motion` globally (matchMedia).
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "../content/deck-data";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Generic reveal: any element with .reveal becomes visible ──────────
function initReveals() {
  if (prefersReducedMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => observer.observe(el));
}

// (Hero plane interactivity now lives in src/scripts/heroPlane3d.ts —
//  Three.js WebGL render with mouse-driven 3D rotation. The Hero.astro
//  component imports and boots it directly.)

// ─── Hero: gentle parallax + scroll-cued chevron fade ──────────────────
function initHero() {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero || prefersReducedMotion) return;

  const heroLockup = hero.querySelector<HTMLElement>("[data-hero-lockup]");
  const heroSub = hero.querySelector<HTMLElement>("[data-hero-sub]");
  const heroChevron = hero.querySelector<HTMLElement>("[data-hero-chevron]");

  if (heroLockup) {
    gsap.from(heroLockup, {
      y: 40,
      opacity: 0,
      duration: 1.4,
      ease: motion.ease,
      delay: 0.15,
    });
  }
  if (heroSub) {
    gsap.from(heroSub, {
      y: 16,
      opacity: 0,
      duration: 1.0,
      ease: motion.ease,
      delay: 0.6,
    });
  }
  if (heroChevron) {
    gsap.from(heroChevron, {
      opacity: 0,
      duration: 0.8,
      ease: motion.ease,
      delay: 1.1,
    });
    // Fade chevron out on first scroll
    gsap.to(heroChevron, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom 80%",
        scrub: true,
      },
    });
  }

  // Subtle parallax on the lockup
  gsap.to(heroLockup, {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 0.4,
    },
  });
}

// ─── Snapshot: pinned scroll-driven 4-stat reveal w/ count-up ──────────
function initSnapshot() {
  const section = document.querySelector<HTMLElement>("[data-snapshot]");
  if (!section) return;

  const stats = section.querySelectorAll<HTMLElement>("[data-stat]");
  const thesis = section.querySelector<HTMLElement>("[data-snapshot-thesis]");
  if (!stats.length) return;

  // Reduced-motion: just show everything
  if (prefersReducedMotion) {
    stats.forEach((s) => {
      s.style.opacity = "1";
      const numEl = s.querySelector<HTMLElement>("[data-stat-number]");
      const rule = s.querySelector<HTMLElement>("[data-stat-rule]");
      if (numEl) numEl.textContent = formatStatic(numEl);
      if (rule) rule.style.transform = "scaleX(1)";
    });
    if (thesis) thesis.style.opacity = "1";
    return;
  }

  // Pin the section while we step through the four stats
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * 0.7}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.4,
      anticipatePin: 1,
    },
  });

  // All four stats reveal simultaneously at position 0
  stats.forEach((stat) => {
    const numEl = stat.querySelector<HTMLElement>("[data-stat-number]");
    const rule = stat.querySelector<HTMLElement>("[data-stat-rule]");
    const target = parseFloat(stat.dataset.target ?? "0");
    const decimals = parseInt(stat.dataset.decimals ?? "0", 10);
    const prefix = stat.dataset.prefix ?? "";
    const suffix = stat.dataset.suffix ?? "";

    const counter = { v: 0 };

    tl.fromTo(
      stat,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.4, ease: motion.ease },
      0,
    );

    if (numEl) {
      tl.to(
        counter,
        {
          v: target,
          duration: 0.5,
          ease: "power2.out",
          snap: { v: decimals === 0 ? 1 : 1 / Math.pow(10, decimals) },
          onUpdate: () => {
            numEl.textContent = `${prefix}${counter.v.toFixed(decimals)}${suffix}`;
          },
          onComplete: () => {
            numEl.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
          },
        },
        0.05,
      );
    }

    if (rule) {
      tl.fromTo(
        rule,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, ease: motion.ease },
        0.15,
      );
    }
  });

  if (thesis) {
    tl.fromTo(
      thesis,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: motion.ease },
      0.6,
    );
  }
}

function formatStatic(el: HTMLElement): string {
  const target = parseFloat(el.closest<HTMLElement>("[data-stat]")?.dataset.target ?? "0");
  const decimals = parseInt(el.closest<HTMLElement>("[data-stat]")?.dataset.decimals ?? "0", 10);
  const prefix = el.closest<HTMLElement>("[data-stat]")?.dataset.prefix ?? "";
  const suffix = el.closest<HTMLElement>("[data-stat]")?.dataset.suffix ?? "";
  return `${prefix}${target.toFixed(decimals)}${suffix}`;
}

// ─── Scenario chart: morph SVG paths between Base / Underwritten / Upside ─
type ScenarioKey = "base" | "underwritten" | "upside";

interface ScenarioSeries {
  revenue: number[];
  ebitda: number[];
  finalRevenue: number;
  finalEbitda: number;
  name: string;
  description: string;
}

function initScenarioChart() {
  const root = document.querySelector<HTMLElement>("[data-scenario]");
  if (!root) return;

  const dataAttr = root.dataset.series;
  if (!dataAttr) return;
  const series = JSON.parse(dataAttr) as Record<ScenarioKey, ScenarioSeries>;

  const svg = root.querySelector<SVGSVGElement>("[data-scenario-svg]");
  const revPath = root.querySelector<SVGPathElement>("[data-scenario-rev]");
  const ebitdaPath = root.querySelector<SVGPathElement>("[data-scenario-ebitda]");
  const revArea = root.querySelector<SVGPathElement>("[data-scenario-rev-area]");
  const ebitdaArea = root.querySelector<SVGPathElement>("[data-scenario-ebitda-area]");
  const revLabel = root.querySelector<HTMLElement>("[data-scenario-rev-label]");
  const ebitdaLabel = root.querySelector<HTMLElement>("[data-scenario-ebitda-label]");
  const descLabel = root.querySelector<HTMLElement>("[data-scenario-desc]");
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-scenario-btn]");

  // Returns card
  const returnsCard       = root.querySelector<HTMLElement>("[data-returns-card]");
  const returnsAllData    = returnsCard?.dataset.returns
    ? (JSON.parse(returnsCard.dataset.returns) as Record<ScenarioKey, { exitEV: number; moic: number; irr: number }>)
    : null;
  const returnsEVEl       = root.querySelector<HTMLElement>("[data-returns-ev]");
  const returnsMOICEl     = root.querySelector<HTMLElement>("[data-returns-moic]");
  const returnsIRREl      = root.querySelector<HTMLElement>("[data-returns-irr]");
  const returnsScenLabel  = root.querySelector<HTMLElement>("[data-returns-scenario-label]");

  if (!svg || !revPath || !ebitdaPath) return;

  // Geometry constants — must match the SVG viewBox in Scenarios.astro
  const W = 1000;
  const H = 360;
  const PAD_X = 70;
  const PAD_Y = 40;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  // Dual Y-axis: revenue 0–500M (left), EBITDA 0–60M (right).
  const Y_REV_MAX = 500;
  const Y_EBI_MAX = 60;
  const xFor = (i: number, count: number) =>
    PAD_X + (innerW * i) / (count - 1);
  const yForRev = (v: number) => PAD_Y + innerH - (v / Y_REV_MAX) * innerH;
  const yForEbi = (v: number) => PAD_Y + innerH - (v / Y_EBI_MAX) * innerH;

  function buildLine(values: number[], yMap: (v: number) => number): string {
    return values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i, values.length).toFixed(2)} ${yMap(v).toFixed(2)}`)
      .join(" ");
  }

  function buildArea(values: number[], yMap: (v: number) => number): string {
    const top = buildLine(values, yMap);
    const last = xFor(values.length - 1, values.length).toFixed(2);
    const first = xFor(0, values.length).toFixed(2);
    const baseY = yMap(0).toFixed(2);
    return `${top} L ${last} ${baseY} L ${first} ${baseY} Z`;
  }

  function applyScenario(key: ScenarioKey, animate = true) {
    const s = series[key];
    if (!s) return;

    // Clear any in-progress draw animation so path morphing works cleanly
    if (revPath) {
      gsap.killTweensOf(revPath, "strokeDashoffset");
      revPath.style.strokeDasharray = "";
      revPath.style.strokeDashoffset = "";
    }
    if (ebitdaPath) {
      gsap.killTweensOf(ebitdaPath, "strokeDashoffset");
      ebitdaPath.style.strokeDasharray = "";
      ebitdaPath.style.strokeDashoffset = "";
    }
    if (revArea)    revArea.style.opacity    = "1";
    if (ebitdaArea) ebitdaArea.style.opacity = "1";

    const newRev = buildLine(s.revenue, yForRev);
    const newEbi = buildLine(s.ebitda, yForEbi);
    const newRevArea = buildArea(s.revenue, yForRev);
    const newEbiArea = buildArea(s.ebitda, yForEbi);

    if (prefersReducedMotion || !animate) {
      revPath?.setAttribute("d", newRev);
      ebitdaPath?.setAttribute("d", newEbi);
      revArea?.setAttribute("d", newRevArea);
      ebitdaArea?.setAttribute("d", newEbiArea);
    } else {
      gsap.to(revPath, { attr: { d: newRev }, duration: 0.9, ease: motion.ease });
      gsap.to(ebitdaPath, { attr: { d: newEbi }, duration: 0.9, ease: motion.ease });
      if (revArea) gsap.to(revArea, { attr: { d: newRevArea }, duration: 0.9, ease: motion.ease });
      if (ebitdaArea) gsap.to(ebitdaArea, { attr: { d: newEbiArea }, duration: 0.9, ease: motion.ease });
    }

    // Animate the headline numbers
    if (revLabel) {
      const cur = { v: parseFloat(revLabel.dataset.current ?? "0") };
      gsap.to(cur, {
        v: s.finalRevenue,
        duration: 0.7,
        ease: "power2.out",
        snap: { v: 1 },
        onUpdate: () => {
          revLabel.textContent = `$${Math.round(cur.v)}M`;
        },
        onComplete: () => {
          revLabel.dataset.current = String(s.finalRevenue);
        },
      });
    }
    if (ebitdaLabel) {
      const cur = { v: parseFloat(ebitdaLabel.dataset.current ?? "0") };
      gsap.to(cur, {
        v: s.finalEbitda,
        duration: 0.7,
        ease: "power2.out",
        snap: { v: 0.1 },
        onUpdate: () => {
          ebitdaLabel.textContent = `$${cur.v.toFixed(1)}M`;
        },
        onComplete: () => {
          ebitdaLabel.dataset.current = String(s.finalEbitda);
        },
      });
    }
    if (descLabel) descLabel.textContent = s.description;

    // Returns card — animate numbers to new scenario values
    if (returnsAllData && returnsAllData[key]) {
      const r = returnsAllData[key];
      if (returnsScenLabel) returnsScenLabel.textContent = s.name;

      if (returnsEVEl) {
        const cur = { v: parseFloat(returnsEVEl.dataset.current ?? String(r.exitEV)) };
        if (prefersReducedMotion || !animate) {
          returnsEVEl.textContent = `$${r.exitEV.toFixed(1)}M`;
          returnsEVEl.dataset.current = String(r.exitEV);
        } else {
          gsap.to(cur, {
            v: r.exitEV, duration: 0.7, ease: "power2.out", snap: { v: 0.1 },
            onUpdate: () => { returnsEVEl.textContent = `$${cur.v.toFixed(1)}M`; },
            onComplete: () => { returnsEVEl.dataset.current = String(r.exitEV); },
          });
        }
      }
      if (returnsMOICEl) {
        const cur = { v: parseFloat(returnsMOICEl.dataset.current ?? String(r.moic)) };
        if (prefersReducedMotion || !animate) {
          returnsMOICEl.textContent = `${r.moic.toFixed(1)}x`;
          returnsMOICEl.dataset.current = String(r.moic);
        } else {
          gsap.to(cur, {
            v: r.moic, duration: 0.7, ease: "power2.out", snap: { v: 0.1 },
            onUpdate: () => { returnsMOICEl.textContent = `${cur.v.toFixed(1)}x`; },
            onComplete: () => { returnsMOICEl.dataset.current = String(r.moic); },
          });
        }
      }
      if (returnsIRREl) {
        const cur = { v: parseFloat(returnsIRREl.dataset.current ?? String(r.irr)) };
        if (prefersReducedMotion || !animate) {
          returnsIRREl.textContent = `~${r.irr}%`;
          returnsIRREl.dataset.current = String(r.irr);
        } else {
          gsap.to(cur, {
            v: r.irr, duration: 0.7, ease: "power2.out", snap: { v: 1 },
            onUpdate: () => { returnsIRREl.textContent = `~${Math.round(cur.v)}%`; },
            onComplete: () => { returnsIRREl.dataset.current = String(r.irr); },
          });
        }
      }
    }

    // Update active button state
    buttons.forEach((btn) => {
      const isActive = btn.dataset.scenarioBtn === key;
      btn.dataset.active = String(isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  // Track active scenario key so the tooltip reads the right data
  let activeKey: ScenarioKey = "base";
  const _applyScenario = applyScenario;
  function applyScenarioTracked(key: ScenarioKey, animate = true) {
    activeKey = key;
    _applyScenario(key, animate);
  }

  // Initialize with base case (no animation on first paint)
  applyScenarioTracked("base", false);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.scenarioBtn as ScenarioKey;
      applyScenarioTracked(k);
    });
  });

  // ── Hover crosshair + tooltip ──────────────────────────────────────
  const chartWrapper = svg.parentElement; // the h-[210px] relative div
  const cursorGroup  = svg.querySelector<SVGGElement>("[data-chart-cursor]");
  const cursorLine   = svg.querySelector<SVGLineElement>("[data-cursor-line]");
  const ringRev      = svg.querySelector<SVGCircleElement>("[data-cursor-ring-rev]");
  const dotRev       = svg.querySelector<SVGCircleElement>("[data-cursor-dot-rev]");
  const ringEbi      = svg.querySelector<SVGCircleElement>("[data-cursor-ring-ebi]");
  const dotEbi       = svg.querySelector<SVGCircleElement>("[data-cursor-dot-ebi]");
  const tooltip      = chartWrapper?.querySelector<HTMLElement>("[data-chart-tooltip]");
  const tipYear      = tooltip?.querySelector<HTMLElement>("[data-tooltip-year]");
  const tipRev       = tooltip?.querySelector<HTMLElement>("[data-tooltip-rev]");
  const tipEbi       = tooltip?.querySelector<HTMLElement>("[data-tooltip-ebi]");

  const COUNT = 5;
  const years = ["FY26E", "FY27E", "FY28E", "FY29E", "FY30E"];
  const xPos  = Array.from({ length: COUNT }, (_, i) => xFor(i, COUNT));

  if (chartWrapper && cursorGroup && cursorLine && dotRev && dotEbi && tooltip) {
    let hoverActive = false;
    let activeIdx   = -1;

    // Move all cursor geometry to the snapped column (GSAP for silky transitions)
    function moveCursorTo(idx: number): void {
      const s  = series[activeKey];
      const cx = xPos[idx];
      const ry = yForRev(s.revenue[idx]);
      const ey = yForEbi(s.ebitda[idx]);
      const dur = activeIdx === -1 ? 0 : 0.15; // instant on first appear, smooth after
      activeIdx = idx;

      gsap.to(cursorLine!, {
        attr: { x1: cx, x2: cx },
        duration: dur, ease: "power2.out", overwrite: true,
      });
      const revEls = ([dotRev, ringRev] as (SVGElement | null)[]).filter(Boolean) as SVGElement[];
      const ebiEls = ([dotEbi, ringEbi] as (SVGElement | null)[]).filter(Boolean) as SVGElement[];
      gsap.to(revEls, { attr: { cx, cy: ry }, duration: dur, ease: "power2.out", overwrite: true });
      gsap.to(ebiEls, { attr: { cx, cy: ey }, duration: dur, ease: "power2.out", overwrite: true });

      // Refresh text — always (picks up scenario changes mid-hover)
      if (tipYear) tipYear.textContent = years[idx];
      if (tipRev)  tipRev.textContent  = `$${s.revenue[idx]}M`;
      if (tipEbi)  tipEbi.textContent  = `$${s.ebitda[idx].toFixed(1)}M`;
    }

    // Place the tooltip card beside the cursor, flip when near the right edge
    function positionTooltip(mouseX: number): void {
      const rect = chartWrapper!.getBoundingClientRect();
      const TOOLTIP_W = 168;
      const left = mouseX + TOOLTIP_W + 16 > rect.width
        ? mouseX - TOOLTIP_W - 12
        : mouseX + 12;
      tooltip!.style.left = `${left}px`;
    }

    // Fade cursor group + tooltip card in on first entry
    function enterChart(mouseX: number): void {
      hoverActive = true;
      gsap.to(cursorGroup!, { opacity: 1, duration: 0.18, ease: "power2.out", overwrite: true });
      gsap.killTweensOf(tooltip!);
      tooltip!.style.display = "block";
      gsap.to(tooltip!, { opacity: 1, duration: 0.18, ease: "power2.out" });
      positionTooltip(mouseX);
    }

    // Fade cursor group + tooltip card out on leave
    function leaveChart(): void {
      hoverActive = false;
      activeIdx   = -1;
      gsap.to(cursorGroup!, { opacity: 0, duration: 0.2, ease: "power2.out", overwrite: true });
      gsap.to(tooltip!, {
        opacity: 0, duration: 0.2, ease: "power2.out",
        onComplete: () => { if (!hoverActive) tooltip!.style.display = "none"; },
      });
    }

    chartWrapper.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = chartWrapper!.getBoundingClientRect();
      const svgX = (e.offsetX / rect.width) * W;

      // Snap to nearest year column
      let idx = 0, minD = Infinity;
      xPos.forEach((x, i) => { const d = Math.abs(x - svgX); if (d < minD) { minD = d; idx = i; } });

      moveCursorTo(idx);

      if (!hoverActive) enterChart(e.offsetX);
      else positionTooltip(e.offsetX);
    });

    chartWrapper.addEventListener("mouseleave", leaveChart);
  }

  // Draw chart lines on scroll entry
  if (!prefersReducedMotion) {
    // Hide paths immediately via dash offset so they're invisible before the trigger fires
    const revLen0 = revPath.getTotalLength();
    const ebiLen0 = ebitdaPath.getTotalLength();
    gsap.set(revPath,    { strokeDasharray: revLen0, strokeDashoffset: revLen0 });
    gsap.set(ebitdaPath, { strokeDasharray: ebiLen0, strokeDashoffset: ebiLen0 });
    if (revArea)    gsap.set(revArea,    { opacity: 0 });
    if (ebitdaArea) gsap.set(ebitdaArea, { opacity: 0 });

    ScrollTrigger.create({
      trigger: root,
      start: motion.scrollStart,
      once: true,
      onEnter: () => {
        // Revenue line draws left → right
        const revLen = revPath.getTotalLength();
        gsap.set(revPath, { strokeDasharray: revLen, strokeDashoffset: revLen });
        gsap.to(revPath, {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.inOut",
          onComplete() {
            revPath.style.strokeDasharray  = "";
            revPath.style.strokeDashoffset = "";
          },
        });

        // EBITDA line draws with a slight delay
        const ebiLen = ebitdaPath.getTotalLength();
        gsap.set(ebitdaPath, { strokeDasharray: ebiLen, strokeDashoffset: ebiLen });
        gsap.to(ebitdaPath, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power2.inOut",
          delay: 0.25,
          onComplete() {
            ebitdaPath.style.strokeDasharray  = "";
            ebitdaPath.style.strokeDashoffset = "";
          },
        });

        // Area fills fade in behind the lines
        if (revArea)    gsap.to(revArea,    { opacity: 1, duration: 0.8, delay: 0.5 });
        if (ebitdaArea) gsap.to(ebitdaArea, { opacity: 1, duration: 0.8, delay: 0.7 });
      },
    });
  }
}

// ─── Floor: pinned section + bar wipe + visibility count-ups ───────────
function initFloorBars() {
  const root  = document.querySelector<HTMLElement>("[data-floor]");
  if (!root) return;
  const bars  = root.querySelectorAll<HTMLElement>("[data-floor-bar]");
  const stats = root.querySelectorAll<HTMLElement>("[data-floor-stat]");
  if (!bars.length) return;

  if (prefersReducedMotion) {
    bars.forEach((b) => (b.style.transform = "scaleX(1)"));
    stats.forEach((el) => {
      const { prefix = "", suffix = "", target = "0", decimals = "0" } = el.dataset;
      el.textContent = `${prefix}${parseFloat(target).toFixed(parseInt(decimals, 10))}${suffix}`;
    });
    return;
  }

  // Reset stat text to "0" so count-up starts cleanly
  stats.forEach((el) => {
    const { prefix = "", suffix = "" } = el.dataset;
    el.textContent = `${prefix}0${suffix}`;
  });

  // Keep the section pinned (independent of animation timing)
  ScrollTrigger.create({
    trigger: root,
    start: "top top",
    end: () => `+=${window.innerHeight * 0.6}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
  });

  // On entry: bars wipe left → right, then visibility numbers count up
  ScrollTrigger.create({
    trigger: root,
    start: motion.scrollStart,
    once: true,
    onEnter: () => {
      // Staggered bar wipe — expo ease for a crisp snap feel
      gsap.fromTo(bars, { scaleX: 0 }, {
        scaleX: 1,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.18,
      });

      // Count-up visibility stats after bars finish
      stats.forEach((el, i) => {
        const prefix   = el.dataset.prefix   ?? "";
        const suffix   = el.dataset.suffix   ?? "";
        const target   = parseFloat(el.dataset.target   ?? "0");
        const decimals = parseInt(el.dataset.decimals ?? "0", 10);
        const counter  = { v: 0 };

        gsap.to(counter, {
          v: target,
          duration: motion.countUpDuration,
          ease: "power2.out",
          delay: 0.8 + i * 0.2,
          snap: { v: decimals === 0 ? 1 : 1 / Math.pow(10, decimals) },
          onUpdate() {
            el.textContent = `${prefix}${counter.v.toFixed(decimals)}${suffix}`;
          },
          onComplete() {
            el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
          },
        });
      });
    },
  });
}

// ─── Transaction: capital stack segments build + click micro-interaction ─
function initCapitalStack() {
  const root = document.querySelector<HTMLElement>("[data-stack]");
  if (!root) return;
  const segments = Array.from(root.querySelectorAll<HTMLElement>("[data-stack-segment]"));
  if (!segments.length) return;

  // Detail cards live in Transaction section (same data-stack wrapper)
  const detailCards = Array.from(
    document.querySelectorAll<HTMLElement>("[data-stack-detail]"),
  );

  if (prefersReducedMotion) {
    segments.forEach((s) => (s.style.transform = "scaleX(1)"));
    return;
  }

  // ── Build animation on scroll ─────────────────────────────────────
  ScrollTrigger.create({
    trigger: root,
    start: motion.scrollStart,
    once: true,
    onEnter: () => {
      gsap.fromTo(
        segments,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: motion.durationSlow,
          ease: motion.ease,
          stagger: 0.18,
        },
      );
    },
  });

  // ── Click micro-interaction ───────────────────────────────────────
  let activeIdx: number | null = null;

  function clearActive() {
    activeIdx = null;
    segments.forEach((s) => delete s.dataset.stackActive);
    detailCards.forEach((d) => delete d.dataset.stackActive);
  }

  segments.forEach((seg, i) => {
    seg.addEventListener("click", () => {
      // Toggle off if same segment clicked again
      if (activeIdx === i) {
        clearActive();
        return;
      }

      activeIdx = i;

      // Dim/brighten segments
      segments.forEach((s, j) => {
        s.dataset.stackActive = j === i ? "true" : "false";
      });

      // Accent border on matching detail card, reset others
      detailCards.forEach((d, j) => {
        d.dataset.stackActive = j === i ? "true" : "false";
      });

      // Brief pulse on the active detail card's stat number
      const num = detailCards[i]?.querySelector<HTMLElement>(".stat-number");
      if (num) {
        gsap.fromTo(
          num,
          { scale: 1.06 },
          { scale: 1, duration: 0.5, ease: "back.out(2.5)" },
        );
      }
    });
  });
}

// ─── Phases: pin section while phases scroll into view ─────────────────
function initPhases() {
  const section = document.querySelector<HTMLElement>("[data-phases]");
  if (!section || prefersReducedMotion) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * 0.6}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
  });
}

// ─── Ask: $100M animated count-up on section enter ─────────────────────
function initAskCountUp() {
  const el = document.querySelector<HTMLElement>("[data-ask-amount]");
  if (!el) return;

  if (prefersReducedMotion) {
    el.textContent = "$100M";
    return;
  }

  el.textContent = "$0M";
  const counter = { v: 0 };

  // Trigger off the section, not the span — the span is inside a .reveal
  // that fades in at the same time, so triggering off the tiny element causes
  // the count to run while opacity is still 0 and the user sees a snap to $100M.
  // A short delay lets the reveal fade-in (0.9s) start before the count begins.
  const section = document.querySelector<HTMLElement>("[data-ask]") ?? el;
  ScrollTrigger.create({
    trigger: section,
    start: "top center",
    once: true,
    onEnter: () => {
      gsap.to(counter, {
        v: 100,
        duration: motion.countUpDuration,
        ease: "power2.out",
        delay: 0.5,
        snap: { v: 1 },
        onUpdate: () => {
          el.textContent = `$${Math.round(counter.v)}M`;
        },
        onComplete: () => {
          el.textContent = "$100M";
        },
      });
    },
  });
}

// ─── Hover tilt on [data-tilt] cards ───────────────────────────────────
function initTiltCards() {
  const cards = document.querySelectorAll<HTMLElement>("[data-tilt]");
  if (!cards.length || prefersReducedMotion) return;

  cards.forEach((card) => {
    const MAX = parseFloat(card.dataset.tiltMax ?? "3");

    card.addEventListener("mousemove", (e: MouseEvent) => {
      const r  = card.getBoundingClientRect();
      const dx = ((e.clientX - r.left)  / r.width  - 0.5) * 2; // −1 → 1
      const dy = ((e.clientY - r.top)   / r.height - 0.5) * 2; // −1 → 1
      gsap.to(card, {
        rotateY: dx * MAX,
        rotateX: -dy * MAX,
        transformPerspective: 900,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.5)",
        overwrite: true,
      });
    });
  });
}

// ─── Magnetic CTAs: nav dots + Ask $100M ───────────────────────────────
function initMagneticElements() {
  if (prefersReducedMotion) return;

  const askAmount = document.querySelector<HTMLElement>("[data-ask-amount]");
  if (askAmount) gsap.set(askAmount, { display: "inline-block" });

  const targets = [
    // Nav dots — small radius, subtle pull
    ...Array.from(document.querySelectorAll<HTMLElement>(".nav-dot")).map(
      (el) => ({ el, radius: 60, strength: 0.45 }),
    ),
    // Ask $100M — wider reach, generous pull
    ...(askAmount ? [{ el: askAmount, radius: 150, strength: 0.35 }] : []),
  ];

  if (!targets.length) return;

  let rafPending = false;
  let lastX = 0, lastY = 0;

  window.addEventListener("mousemove", (e: MouseEvent) => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (rafPending) return;
    rafPending = true;

    requestAnimationFrame(() => {
      rafPending = false;
      targets.forEach(({ el, radius, strength }) => {
        const r    = el.getBoundingClientRect();
        const cx   = r.left + r.width  / 2;
        const cy   = r.top  + r.height / 2;
        const dist = Math.hypot(lastX - cx, lastY - cy);

        if (dist < radius) {
          const pull = (1 - dist / radius) * strength;
          gsap.to(el, {
            x: (lastX - cx) * pull,
            y: (lastY - cy) * pull,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
          });
        } else {
          gsap.to(el, {
            x: 0, y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.4)",
            overwrite: true,
          });
        }
      });
    });
  }, { passive: true });
}

// ─── Demand anchor expand / collapse ───────────────────────────────────
function initDemandAnchors() {
  const anchors = document.querySelectorAll<HTMLElement>("[data-anchor]");
  if (!anchors.length) return;

  anchors.forEach((anchor) => {
    const trigger = anchor.querySelector<HTMLButtonElement>("[data-anchor-trigger]");
    const body    = anchor.querySelector<HTMLElement>("[data-anchor-body]");
    const inner   = anchor.querySelector<HTMLElement>("[data-anchor-inner]");
    const vbar    = anchor.querySelector<HTMLElement>("[data-anchor-vbar]");
    const label   = anchor.querySelector<HTMLElement>("[data-anchor-label]");
    if (!trigger || !body || !inner) return;

    let open = false;

    trigger.addEventListener("click", () => {
      open = !open;
      trigger.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "close" : "expand";

      if (open) {
        // Measure natural height, animate to it, then release to "auto"
        const h = inner.offsetHeight;
        gsap.to(body, {
          height: h,
          duration: prefersReducedMotion ? 0 : 0.42,
          ease: "power2.out",
          onComplete: () => { body.style.height = "auto"; },
        });
        if (vbar) gsap.to(vbar, { scaleY: 0, duration: 0.22, ease: "power2.out" });
      } else {
        gsap.to(body, {
          height: 0,
          duration: prefersReducedMotion ? 0 : 0.32,
          ease: "power2.in",
        });
        if (vbar) gsap.to(vbar, { scaleY: 1, duration: 0.22, ease: "power2.out" });
      }
    });
  });
}

// ─── Gradient drift with scroll ─────────────────────────────────────────
// Updates CSS custom properties on <body> so the terracotta radial glow
// drifts downward as the user scrolls through the deck.
function initGradientDrift() {
  if (prefersReducedMotion) return;

  let rafPending = false;

  function update() {
    rafPending = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? Math.min(window.scrollY / total, 1) : 0;

    // Glow migrates from top-right toward center-left as you scroll down
    const g1y = -20 + ratio * 65;   // -20% → 45%
    const g1x = 80  - ratio * 18;   // 80%  → 62%

    document.body.style.setProperty("--g1x", `${g1x.toFixed(1)}%`);
    document.body.style.setProperty("--g1y", `${g1y.toFixed(1)}%`);
  }

  window.addEventListener("scroll", () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(update);
  }, { passive: true });
}


// ─── Section transition wipe ────────────────────────────────────────────
// A very-subtle terracotta full-screen overlay that scaleX-wipes left→right
// then right→left whenever a nav dot or keyboard arrow triggers navigation.
function initSectionWipe() {
  if (prefersReducedMotion) return;

  const wipe = document.createElement("div");
  wipe.id = "section-wipe";
  wipe.setAttribute("aria-hidden", "true");
  Object.assign(wipe.style, {
    position:        "fixed",
    inset:           "0",
    backgroundColor: "rgba(196, 85, 30, 0.06)",
    pointerEvents:   "none",
    zIndex:          "190",
    transform:       "scaleX(0)",
    transformOrigin: "left center",
    willChange:      "transform",
  });
  document.body.appendChild(wipe);

  let wiping = false;

  function triggerWipe() {
    if (wiping) return;
    wiping = true;
    gsap.fromTo(
      wipe,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 0.26,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(wipe, {
            scaleX: 0,
            duration: 0.30,
            ease: "power2.out",
            transformOrigin: "right center",
            onComplete: () => { wiping = false; },
          });
        },
      },
    );
  }

  document.querySelectorAll<HTMLElement>(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", triggerWipe);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "PageDown" && e.key !== "PageUp") return;
    const tag = (document.activeElement as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    triggerWipe();
  });
}

// ─── Scroll velocity indicator ──────────────────────────────────────────
// The `#scroll-progress` bar grows taller when the user scrolls fast and
// decays back to 2 px after 150 ms of inactivity — a pulse that says "momentum."
function initScrollVelocity() {
  if (prefersReducedMotion) return;

  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  // Baseline height is already set to 2px via the fixed CSS class "h-[2px]".
  // We animate the inline `height` property directly.
  bar.style.height = "2px";

  let lastY    = window.scrollY;
  let lastTime = performance.now();
  let decayId: ReturnType<typeof setTimeout> | null = null;

  window.addEventListener("scroll", () => {
    const now = performance.now();
    const dy  = Math.abs(window.scrollY - lastY);
    const dt  = Math.max(now - lastTime, 8); // guard divide-by-zero
    const vel = dy / dt; // px / ms

    // Map velocity 0 → 2 px, 2+ px/ms → 6 px (capped)
    const h = Math.min(2 + vel * 1.5, 6);
    gsap.to(bar, { height: h, duration: 0.08, ease: "none", overwrite: true });

    lastY    = window.scrollY;
    lastTime = now;

    if (decayId) clearTimeout(decayId);
    decayId = setTimeout(() => {
      gsap.to(bar, { height: 2, duration: 0.5, ease: "power2.out" });
    }, 150);
  }, { passive: true });
}

// ─── Generic section pin ────────────────────────────────────────────────
function pinSection(selector: string, scrollMultiplier = 0.5) {
  const section = document.querySelector<HTMLElement>(selector);
  if (!section || prefersReducedMotion) return;
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * scrollMultiplier}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
  });
}

// ─── Boot ───────────────────────────────────────────────────────────────
function boot() {
  initReveals();
  initHero();
  initSnapshot();
  initScenarioChart();
  initFloorBars();
  initPhases();
  initCapitalStack();
  initAskCountUp();
  initTiltCards();
  initMagneticElements();
  initDemandAnchors();
  initGradientDrift();
initSectionWipe();
  initScrollVelocity();
  pinSection("[data-asset]");
  pinSection("[data-scenario]");
  pinSection("[data-transaction]");
  pinSection("[data-ask]");
  pinSection("[data-close]");

  // Refresh ScrollTrigger after fonts settle to avoid offset drift
  if ("fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  // ── beforeprint: fit each section to exactly one page ─────────────────
  window.addEventListener("beforeprint", () => {
    gsap.globalTimeline.pause();

    // Step 1 — clear GSAP pin-spacer inline heights.
    // CSS `display:contents` removes them from layout, but the inline
    // `height` GSAP set would otherwise override that.
    document.querySelectorAll<HTMLElement>(".pin-spacer").forEach((el) => {
      el.style.removeProperty("height");
      el.style.removeProperty("padding-bottom");
      el.style.removeProperty("padding-top");
    });

    // Step 2 — resolve all animated values to their final state.
    // Page sizing is now handled entirely by @media print CSS:
    // section { height:100vh; overflow:hidden } + section > * { zoom:0.80 }
    document.querySelectorAll<HTMLElement>("[data-stat-number]").forEach((el) => {
      el.textContent = formatStatic(el);
    });
    document.querySelectorAll<HTMLElement>("[data-stat-rule]").forEach((el) => {
      el.style.transform = "scaleX(1)";
    });
    const thesis = document.querySelector<HTMLElement>("[data-snapshot-thesis]");
    if (thesis) { thesis.style.opacity = "1"; thesis.style.transform = "none"; }

    const askEl = document.querySelector<HTMLElement>("[data-ask-amount]");
    if (askEl) askEl.textContent = "$100M";

    document.querySelectorAll<HTMLElement>("[data-stack-segment]").forEach((el) => {
      el.style.transform = "scaleX(1)";
    });
    document.querySelectorAll<HTMLElement>("[data-floor-bar]").forEach((el) => {
      el.style.transform = "scaleX(1)";
    });
    // Restore floor stat numbers to their final values
    document.querySelectorAll<HTMLElement>("[data-floor-stat]").forEach((el) => {
      const prefix   = el.dataset.prefix   ?? "";
      const suffix   = el.dataset.suffix   ?? "";
      const target   = parseFloat(el.dataset.target   ?? "0");
      const decimals = parseInt(el.dataset.decimals ?? "0", 10);
      el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
    });
    // Clear scenario chart draw animation so paths are fully visible
    document.querySelectorAll<SVGPathElement>(
      "[data-scenario-rev],[data-scenario-ebitda],[data-scenario-rev-area],[data-scenario-ebitda-area]"
    ).forEach((el) => {
      el.style.strokeDasharray  = "";
      el.style.strokeDashoffset = "";
      el.style.opacity          = "1";
    });
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
  });

  // ── afterprint: restore the interactive screen layout ──────────────────
  window.addEventListener("afterprint", () => {
    gsap.globalTimeline.resume();
    // Rebuild all ScrollTrigger instances so pin-spacers are restored
    // with the correct heights for the current scroll position.
    ScrollTrigger.refresh();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
