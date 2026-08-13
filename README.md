# Malki Academy — Landing Page

Marketing front page for a multi-teacher LMS. Photography is the first category
live; make-up, hair styling and others are teased as coming soon so the page
reads as a marketplace rather than a single-course site.

Built as a **static marketing shell**: no backend, no auth, no payments.

- Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion
- French copy, structured so Arabic/RTL is a drop-in later

---

## Getting started

```bash
npm install
npm run frames   # builds the hero image sequence into /public
npm run dev      # http://localhost:3000
```

`npm run frames` is required before the first run — the hero sequence and the
still images it produces are generated assets and are not committed.

---

## The hero: scroll-driven frame sequence

The hero pins a `<canvas>` inside a tall scroll container and scrubs through an
image sequence as you scroll, Apple-product-page style.

**How it works**

1. `lib/useSequenceMode.ts` picks a quality tier on the client.
2. `lib/useFrameSequence.ts` preloads every frame (8 at a time, in order) and
   reports progress. Page scroll is locked behind a `%` loader until it
   finishes, with a 10 s safety timeout so a stalled image can never trap you.
3. `app/components/Hero.tsx` maps scroll progress `0→1` onto a frame index and
   paints it via a `requestAnimationFrame` loop. If a frame hasn't decoded yet
   it paints the nearest one that has, so the canvas never goes blank.

**Quality tiers**

| Mode | When | Frames | Width | Weight | Scroll length |
| --- | --- | --- | --- | --- | --- |
| `desktop` | ≥ 768 px | 120 | 1280 px | ~4.7 MB | 400vh |
| `mobile` | < 768 px | 48 | 720 px | ~0.9 MB | 260vh |
| `static` | reduced motion, Save-Data, 2G/3G, ≤ 2 GB RAM | — | — | 62 KB | normal |

`static` renders a normal-height hero with the poster image and no pinning, so
low-end devices never pay for the effect.

**Text checkpoints** are scroll-progress windows defined in `content/content.ts`
under `hero`. The headline is visible on arrival (it animates in on mount) and
only fades *out* on scroll; the subheadline and closing CTA fade in and out at
their own checkpoints. Retime the whole sequence by editing those numbers.

### Swapping in a new clip

```bash
ffmpeg -i your-clip.mp4 -vf fps=30 "frames/frame_%04d.jpg"
```

Point `source` in `sequence.config.json` at that folder and run `npm run frames`.
Frame counts, widths and quality all live in that file and are shared by the
build script and the runtime, so the two can't drift.

---

## Where to edit things

**`content/content.ts` holds every string and all course data.** Components read
from it and never hardcode copy, so adding a teacher or course is a data edit.
Anything still needing real content is marked `TODO(content)`:

- `teacher` — real bio, portrait and credentials
- `featuredCourse.price` and `plans` — confirm real pricing and payment terms
- `stats` — real platform figures (currently plausible placeholders)
- `testimonials` — these are rewritten in French from the Arabic originals on
  the current WordPress site; confirm or replace
- `marketplace.upcoming` — replace with real incoming teachers as they sign

Other markers: `TODO(auth)` on the login link, `TODO(backend)` on the newsletter
form and checkout buttons. All are intentionally inert.

### Images

The hero, the featured-course visual and the academy backdrop all use **real
stills cut from the client's own clip** by `npm run frames`. Category cards and
testimonial avatars are Unsplash placeholders — swap the URLs in `content.ts`.

---

## Design system

Palette is defined once as CSS variables in `app/globals.css` and exposed to
Tailwind in `tailwind.config.ts`. Never hardcode a hex in a component.

| Token | Value | Use |
| --- | --- | --- |
| `ink` / `ink-soft` / `ink-card` | `#0A0A0A` / `#111111` / `#171717` | backgrounds |
| `gold` | `#FFB906` | CTAs, active accents |
| `gold-muted` | `#C9A24B` | borders, eyebrows, small type |
| `cream` / `cream-dim` / `cream-faint` | `#F5F1E8` / … | text hierarchy |

`gold` is sampled from 22framesacademy.com. `gold-muted` is the tempered version
used for anything large or bordering, so the page stays cinematic rather than
bright.

Fonts are Archivo (display) and Inter (body) via `next/font`, standing in for
licensed faces like Neue Montreal. Swap them in `app/layout.tsx` — three
declarations, nothing else changes. Noto Sans Arabic is already wired up for
Arabic content.

Motion uses a single flat easing curve (`cubic-bezier(0.16, 1, 0.3, 1)`,
`ease-cinema` in Tailwind). Nothing bouncy.

---

## Bilingual / RTL

Copy is French. The structure is RTL-ready:

- Layouts use logical properties (`ms-`, `me-`, `ps-`, ` start-`, `end-`) rather
  than `ml-`/`mr-`, so direction flips cleanly.
- Directional icons carry `rtl:rotate-180`.
- Arabic titles already sit in the data (`titleAr`) and render with the Arabic
  font.

To flip the site: set `ACTIVE_LOCALE = "ar"` in `content/content.ts`. That drives
`lang` and `dir` on `<html>` in `app/layout.tsx`. Translating the strings is the
remaining work.

---

## Structure

```
app/
  layout.tsx            fonts, metadata, locale/direction
  page.tsx              section order
  globals.css           palette + shared component classes
  components/
    Hero.tsx            canvas scrubber + static fallback
    Nav.tsx             transparent over hero → solid on scroll
    CategoryStrip.tsx   live / coming-soon / locked cards
    Stats.tsx           count-up on scroll into view
    CourseSpotlight.tsx featured course + teacher card
    ValueProps.tsx
    Testimonials.tsx    autoplaying, swipeable carousel
    MarketplaceTeaser.tsx  multi-teacher story, parallax backdrop
    Pricing.tsx
    Footer.tsx
    ui/                 Icons, Reveal, Section/Button primitives
content/content.ts      all copy + data
lib/                    sequence config, preloader, quality tier
scripts/prepare-frames.mjs
sequence.config.json    shared by the script and the runtime
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run frames` | regenerate hero sequence, poster and stills |
| `npm run lint` | eslint |
