# Portfolio review — Apple Design principles

Review of `~/Desktop/portfolio/` against the WWDC *Designing Fluid Interfaces* principles.
Severity: **Bug** = broken behaviour · **Craft** = feel/polish · **A11y** = accessibility.

---

## What's working well

- Clean light theme with consistent `--bg` / `--bg-soft` / `--text` / `--muted` / `--line` tokens → craft principle (every spacing / color value is deliberate).
- Sticky nav uses `backdrop-filter: blur()` + translucent background → correct "material as floating layer" (§12).
- Hero banner has a thoughtful `@media (prefers-reduced-motion: reduce)` block (§14).
- Justified body with `hyphens: auto` on paragraphs that need it (§15).
- Section headings use `clamp()` + negative letter-spacing → optical sizing on the right track (§15).

---

## 1. BUGS

### 1.1 Reveal-on-scroll is wired but has no visual effect
**File:** `script.js:21-30` adds `.in` to `.section`, `.t-item`, `.project`, `.skill-col`, `.contact-card` on viewport entry.
**Problem:** `styles.css` has no `.in` rule and no "pre-reveal" state. The IntersectionObserver fires and does nothing. Dead code masquerading as an animation.

**Fix (either delete the JS or add the CSS). To keep the animation:**

```css
/* styles.css — add near .section */
.section, .t-item, .project, .skill-col, .contact-card {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.section.in, .t-item.in, .project.in, .skill-col.in, .contact-card.in {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .section, .t-item, .project, .skill-col, .contact-card {
    opacity: 1; transform: none; transition: none;
  }
}
```

### 1.2 `scroll-behavior: smooth` ignores reduced-motion
**File:** `styles.css:18`, `projects/cf-motor-sales.html:24`
**Problem:** Vestibular-motion-sensitive users get smooth-scroll even with reduced-motion on. Skill §14.

**Fix:**
```css
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

### 1.3 `backdrop-filter` has no Safari prefix
**File:** `styles.css:34` (nav), `projects/cf-motor-sales.html:40` (case nav)
**Problem:** Older Safari and some iPad versions ignore unprefixed `backdrop-filter` → nav loses its glass material and looks opaque.

**Fix:**
```css
.nav { -webkit-backdrop-filter: saturate(180%) blur(10px); backdrop-filter: saturate(180%) blur(10px); }
```

---

## 2. CRAFT — Apple-feel improvements

### 2.1 No pointer-down feedback anywhere (`:active` missing)
Skill §1: *respond on pointer-down, not on release.* Buttons, project cards, and contact cards only react on `:hover` (desktop-only). On tap, nothing happens until the destination loads.

**Fix:**
```css
.btn:active { transform: scale(0.97); transition: transform 80ms ease-out; }
.project:active, .contact-card:active { transform: scale(0.995); }
.contact-card:active { background: var(--bg-soft); }
```

### 2.2 Hover transitions use linear `ease`, not spring-like easing
Skill §4: Apple ships springs. On the web we approximate with cubic-bezier that overshoots slightly for momentum, settles for structural moves.

**Current:** `transition: transform 0.2s ease` on `.project`, `.contact-card`.
**Fix (settle curve — no overshoot, Apple-ish):**
```css
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
.project { transition: transform 220ms var(--ease-out-expo),
                       border-color 180ms ease,
                       box-shadow   220ms var(--ease-out-expo); }
```

### 2.3 Sticky nav has a hard 1px bottom border — use a scroll-edge fade instead
Skill §12 (scroll edge effects): a hard divider under floating chrome reads as a cut. Fade a soft gradient mask where content meets the nav.

**Fix:**
```css
.nav { border-bottom: none; position: sticky; top: 0; }
.nav::after {
  content: ""; position: absolute; left: 0; right: 0; top: 100%;
  height: 14px; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0));
}
```

### 2.4 Mobile nav slides from top with no backdrop and no `transform-origin`
Skill §7: anchor to source. Right now the panel just appears over content; the trigger (hamburger) and panel don't visually connect.

**Fix (add a dim scrim; keep the slide):**
```css
@media (max-width: 880px) {
  .nav-links { box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
  .nav-links.open ~ .scrim { opacity: 1; pointer-events: auto; }
  /* add a <div class="scrim"></div> inside .nav or body */
  .scrim { position: fixed; inset: 56px 0 0; background: rgba(0,0,0,0.25);
           opacity: 0; pointer-events: none; transition: opacity 180ms ease; z-index: 40; }
}
```

### 2.5 Hero banner KPI tiles pop a shade too hard on the already-pale banner
Skill §12: materials weight hierarchy — tiles should feel like they sit *on* the banner, not punch through it.
**Fix:** change the SVG `<rect fill="#ffffff">` to `fill="#ffffff" fill-opacity="0.95"` and add `filter="drop-shadow(0 2px 4px rgba(11,18,32,0.08))"` so they read as light-weight material resting on the surface.

### 2.6 `will-change` hint on the hero avatar for the animated line that paints behind it
Skill §11: hint compositor-friendly properties when motion is imminent.
```css
.profile-avatar { will-change: transform; }
.banner-chart .line-stroke { will-change: stroke-dashoffset; }
```

### 2.7 Dark-mode is unsupported
Skill §16 (Craft, Flexibility): Apple ships both. Users with `prefers-color-scheme: dark` get the light theme forced on them.
**Fix (tokens flip; everything else inherits):**
```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0b1220; --bg-soft: #111c36; --card: #111c36;
    --text: #e6ecff; --muted: #93a3c7;
    --line: #1e2a48; --line-strong: #2b3a5e;
    --shadow: 0 10px 30px rgba(0,0,0,.35);
    --shadow-strong: 0 16px 40px rgba(0,0,0,.45);
  }
}
```

### 2.8 Typography — tracking isn't tuned per size
Skill §15: tracking is size-specific; large display tightens, body stays near 0, chip/button text can take a touch of positive tracking.
**Current:** `.hero h1` has `-0.02em` (good). Body paragraphs inherit `0` (good). But project `h3` (1.08rem) and section-head `h2` could tighten to `-0.005em`/`-0.01em` respectively; monospace chips/pills can relax to `0.02em`.

```css
.project h3, .t-body h3 { letter-spacing: -0.005em; }
.chips span, .pill, .c-label { letter-spacing: 0.03em; }
```

### 2.9 Snapshot card = 7 rows → one row too many
Skill §16 (Simplicity): the "Tools" and "Methods" rows overlap with the Skills section below. Keep 4 strong rows.

**Suggested rows:** Role · Location · Open to · Education. Delete Tools / Methods / Cloud (they live in Skills).

### 2.10 Mobile nav toggle has no visible hamburger-to-close morph
Skill §8 (hint direction): the three bars should become an "×" when the menu is open so the control telegraphs its new effect.
**Fix (CSS-only morph):**
```css
.nav-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
.nav-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.nav-toggle span { transition: transform 180ms ease, opacity 120ms ease; }
```

---

## 3. ACCESSIBILITY

### 3.1 No `:focus-visible` styles anywhere
Keyboard users get only the browser default outline, which the backdrop-blurred nav partially eats.

**Fix (one style, apply to all interactives):**
```css
a:focus-visible, button:focus-visible, .btn:focus-visible,
.project:focus-visible, .contact-card:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
  border-radius: 10px;
}
```

### 3.2 No skip-to-content link
Keyboard users must tab through 6 nav links on every page.
**Fix (first element inside `<body>`):**
```html
<a class="skip" href="#top-content">Skip to content</a>
```
```css
.skip { position: absolute; left: -9999px; }
.skip:focus-visible { left: 1rem; top: 0.6rem; background: var(--text);
  color: #fff; padding: .5rem .8rem; border-radius: 8px; z-index: 100; }
```
Then wrap `<main>` with `id="top-content"`.

### 3.3 `.project` is a card but not keyboard-reachable (no link wrapper, no `tabindex`)
Right now a user can only reach the project's "Read case study →" sub-link, not the card itself. Hover feedback (lift, border change) teaches it's clickable, keyboard tells it isn't.

**Fix (CF Motor Sales is the only one with its own page — leave the rest as display-only but make the "cta" link the clear affordance; or wrap the whole card as `<a>`).**

### 3.4 Avatar `<img alt="Abhishek Yadav">` is OK, but the circle has no visible-to-screenreader context
Minor. Alt is fine. Confirm the hero `aria-label`s don't duplicate the h1.

---

## 4. OPTIONAL polish

- **Scroll-margin for anchor jumps:** when the sticky nav sits above a section, `#about` jumps leave the heading hidden under the nav.
  ```css
  section[id] { scroll-margin-top: 80px; }
  ```
- **Preload headshot:** it's above-the-fold.
  ```html
  <link rel="preload" as="image" href="assets/headshot.jpg">
  ```
- **Favicon:** none set — defaults to the globe. Even a 1-letter "A" SVG favicon lifts craft.
  ```html
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230b1220'/><text x='50' y='68' text-anchor='middle' font-family='-apple-system,BlinkMacSystemFont,Inter,sans-serif' font-weight='800' font-size='56' fill='white'>A</text></svg>">
  ```
- **Open Graph / social card:** no `og:` or `twitter:` meta. When you share the link, LinkedIn shows a bare preview.
  ```html
  <meta property="og:title" content="Abhishek Yadav · Business Analyst Portfolio" />
  <meta property="og:description" content="BA in Dublin. SQL · Power BI · Agile. Projects, case studies, and more." />
  <meta property="og:image" content="https://abhishekncirl.github.io/portfolio/assets/headshot.jpg" />
  <meta property="og:url" content="https://abhishekncirl.github.io/portfolio/" />
  <meta name="twitter:card" content="summary_large_image" />
  ```
- **Reduced-transparency media query** on the nav blur (skill §14):
  ```css
  @media (prefers-reduced-transparency: reduce) {
    .nav, .case-nav { background: #fff; backdrop-filter: none; -webkit-backdrop-filter: none; border-bottom: 1px solid var(--line); }
  }
  ```

---

## Priority order (if you want me to apply)

1. Fix dead reveal-on-scroll (1.1) — 2 min, immediately visible.
2. Pointer-down `:active` + focus-visible + skip link (2.1, 3.1, 3.2) — real a11y + feel bump.
3. Scroll-behavior + backdrop-filter prefix + reduced-transparency (1.2, 1.3, polish) — 1-line each.
4. Scroll-margin + favicon + OG tags (polish) — social proof when you share.
5. Dark mode (2.7) — bigger lift but one commit; your white-black palette inverts cleanly.
6. Nav scrim + hamburger morph + spring-ish easing (2.3, 2.4, 2.10, 2.2) — the "feels alive" tier.

Say the word on which batch to ship.
