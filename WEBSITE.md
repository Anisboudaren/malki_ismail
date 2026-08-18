# Malki Academy — What This Website Is

This document describes the **Malki Academy** marketing site in full: who it is for, what it sells, what every page does, how the cinematic hero works, what is real versus placeholder, and how the project is built.

Live production URL: [https://malki-ismail.vercel.app](https://malki-ismail.vercel.app)

Canonical brand domain (existing LMS, WordPress): [https://malkiacademy.com](https://malkiacademy.com)

---

## 1. One-sentence definition

**Malki Academy is a bilingual (French / Arabic) cinematic marketing website for an Algerian online academy of creators.** It currently sells one live smartphone-photography course, presents the academy as a multi-teacher marketplace, and sends enrolment to the existing WordPress learning platform.

It is **not** the LMS itself. There is no login, no checkout, no student dashboard, and no course player on this site. Those live on `malkiacademy.com`. This site is the storefront: story, catalogue teaser, course page, and a path to enrol.

---

## 2. The product and the audience

### Brand

| | |
| --- | --- |
| Wordmark | **Malki.** Academy (Latin in both languages) |
| Tagline (FR) | L'académie des créateurs algériens |
| Tagline (AR) | أكاديمية المبدعين الجزائريين |
| Founder / teacher | Ismail Malki — photographer and trainer |
| Contact | contact@malkiacademy.com · 0541 67 85 51 |
| Positioning | Professional photography **on the phone you already have** — no DSLR, no studio |

### Who it is for

Algerian (and Maghreb) creators who need better images without buying cameras:

- Fashion designers photographing their pieces
- Makeup artists and salon owners documenting work
- Musicians and content creators promoting themselves on Instagram / Reels
- Anyone who wants a first “real” portrait this weekend, with a phone

The teaching language of the live course is **Arabic**. The marketing site is fully **French and Arabic**, with RTL on `/ar`.

### What it is *not*

- Not a full learning platform (no video lessons hosted here except a Publitio preview iframe)
- Not a payment processor (enrolment CTA goes to WordPress)
- Not a multi-course catalogue yet (one live course; other categories are “coming soon” / locked)
- Not a CMS-driven site (all copy lives in one TypeScript file)

---

## 3. The promise the homepage makes

The hero tells a three-beat story as you scroll, over a film-like sequence cut from the client’s own photographer clip:

1. **Headline** — “Apprenez la photographie. Sur le téléphone que vous avez déjà.”
2. **Subheadline** — No DSLR, no studio: light, framing, and a trainer who shows you where to look.
3. **Close** — “Votre premier vrai portrait, ce week-end.” with CTAs to the course and to pricing.

Everything below that supports the same idea: this is an **academy**, not a one-off YouTube course. Photography opens the catalogue; makeup, hair, and design are next.

---

## 4. Site map and user journeys

Every public URL is locale-prefixed. `/` redirects to `/fr`.

```
/                         →  /fr
/fr                       Home (French, LTR)
/ar                       Home (Arabic, RTL)
/fr/categories/photographie
/ar/categories/photographie
/fr/categories/makeup     (empty “coming soon” state)
/fr/categories/hair
/fr/categories/next
/fr/courses/makeup-mode-smartphone
/ar/courses/makeup-mode-smartphone
```

### Journey A — Discover and enrol

1. Land on `/fr` or `/ar`.
2. Watch (or skip) the pinned hero sequence.
3. See categories: Photographie is **Disponible**; Make-up and Hair are **Bientôt**; a fourth slot is **Verrouillé**.
4. Open the featured course (home spotlight or category page).
5. Read the programme, watch the poster-first preview video, click **S'inscrire**.
6. Leave this site for the WordPress course URL on `malkiacademy.com`.

### Journey B — Browse as a future teacher / partner

1. Home → “Une académie, plusieurs formateurs.”
2. See upcoming disciplines (Make-up 2026, Hair 2026, Design 2027).
3. CTA **Devenir formateur** scrolls to the footer contact / newsletter block.

### Journey C — Language switch

The nav language control swaps `/fr/…` ↔ `/ar/…` on the same page type. Headings keep a bilingual accent: the other language is shown as a subtitle, using the correct script and font.

---

## 5. Homepage, section by section

The home page is a long single scroll. Order is fixed in `app/[locale]/page.tsx`.

### 5.1 Navigation

Fixed header. Over the hero it is transparent with a light scrim so white type survives bright frames. After the hero (`#hero-end` sentinel) it becomes a solid ink bar.

Links: Accueil, Formations, Formateurs, À propos, Contact, plus **S'inscrire** (to `#tarifs`) and a language switcher. **Connexion** is a placeholder (`TODO(auth)`).

### 5.2 Hero — scroll-driven film

A tall section (~460vh). A full-viewport stage is **pinned** (`position: fixed` while you are inside the section) so on phones the frame does not slide with the collapsing browser chrome. Only the **video frames** change as you scroll.

- Desktop: 120 WebP frames at 1280px.
- Mobile: 48 portrait-cropped frames at 405px.
- Slow networks / reduced motion / low RAM: a static poster, no pin, no sequence.

Frames preload with a percentage loader; page scroll is locked until they are ready (10s timeout so a failed image cannot trap the user).

**Copy beats** fade in place (headline → subheadline → closing CTA). After a flick, the page eases to the **next or previous beat only** — it does not skip two sentences in one gesture. The rest of the page has **no** scroll-snap.

Three gold dots on the side jump to the same three beats.

### 5.3 Categories (`#categories`)

Four cards:

| ID | Title | Status |
| --- | --- | --- |
| `photographie` | Photographie | Live — 1 formation |
| `makeup` | Make-up | Coming soon |
| `hair` | Hair Styling | Coming soon |
| `next` | Prochaine catégorie | Locked |

Live cards go to the category page. Others stay as teaser / empty state.

### 5.4 Stats

Count-up figures taken from the live catalogue (as of the December 2025 update):

- 293 learners enrolled
- 4.9 / 5 average rating
- 17 video lessons
- 24/7 platform access

Digits stay Western (0–9) in both locales.

### 5.5 Featured course (`#formation`) + teacher (`#formateurs`)

Large still of the course, title **Photographier make-up & mode au smartphone** / **دورة تصوير الميكاج والملابس بالموبايل**, launch price **40 000 DA** (was 50 000, −20%), rating 4.91 from 11 reviews, 293 enrolled.

Beside it: Ismail Malki’s portrait, role (Photographe · Formateur), short bio. Bio/credentials are marked `TODO(content)` pending client confirmation.

### 5.6 Value props

Four reasons to join: learn anywhere, real working trainers, lifetime access, community (feedback, monthly challenges).

### 5.7 Testimonials (`#temoignages`)

Five quotes. **Arabic is the original** (from the WordPress site); French is a rewrite. Avatars are still Unsplash placeholders. Horizontal snap carousel on small screens.

### 5.8 Academy / marketplace (`#academie`)

Parallax still from the same hero clip. Copy: this is not a one-off course; it is a platform for Algerian professionals. Upcoming trainer slots (names generic until they sign). CTA to become a trainer.

### 5.9 Pricing (`#tarifs`)

Two plans:

| Plan | Price | Notes |
| --- | --- | --- |
| Formation seule | 40 000 DA (strikethrough 50 000) | Mirrors the live course; CTA goes to the course page |
| Full Pack Académie | Hidden (`hidePrice`) | “Tarif annoncé prochainement”; CTA to `#contact` |

Guarantee line: 14-day refund, lifetime access, product in constant evolution.

### 5.10 Ambient music

Optional homepage bed: YouTube embed of [this track](https://www.youtube.com/watch?v=30jrmzzgHLc), starting at **0:17**, looped, volume ~14%. A speaker button bottom-start mutes/unmutes. Browsers often block unmuted autoplay until the first tap or scroll. The file is **not** downloaded or rehosted.

### 5.11 Footer (`#contact`)

Blurb, link columns (academy, useful links, account placeholders), newsletter form (**inert** — `TODO(backend)`), social icons (hrefs still `#`), legal links (placeholders), copyright.

---

## 6. Inner pages

### Category page — `/[locale]/categories/[category]`

Intro copy for that discipline. If the category has courses, a grid of course cards. If not, an empty state: “Cette catégorie ouvre bientôt” + email CTA (also inert).

### Course page — `/[locale]/courses/makeup-mode-smartphone`

Full marketing page for the live course:

- Hero still, bilingual title, social proof, meta (beginner, 17 videos, ~1h20, language Arabic)
- Learning outcomes (light, manual phone settings, makeup/fashion lighting, mobile retouch)
- **Programme** — 3 modules, 17 lessons (titles and durations from the real catalogue). Lessons are listed, not playable; lock label “Débloqué à l'inscription”
- Teacher block
- Poster-first **Publitio** preview (`malki.publit.io`) — the iframe loads only after play
- Enrol button → WordPress

Slug `makeup-mode-smartphone` is the French URL segment; the Arabic title is shown in copy, not in the path.

---

## 7. The live course in detail

Mirrored from:

`https://malkiacademy.com/courses/دورة-تصوير-الميكاج-والملابس-بالموبايل`

**Photographier make-up & mode au smartphone**

| | |
| --- | --- |
| Level | Beginner |
| Lessons | 17 videos |
| Duration | ~1 hour 20 minutes |
| Language | Arabic |
| Price | 40 000 DA (launch, −20% from 50 000) |
| Rating | 4.91 / 5 (11 reviews) |
| Enrolled | 293 |

**Module 1 — Les fondamentaux (théorie)**  
Introduction, what is video, colour temperature & CRI, soft vs hard light, phone settings.

**Module 2 — Éclairer comme un pro**  
Lighting setups in several parts (lessons 1–3).

**Module 3 — Retouche & montage**  
Mobile photo retouch, skin/makeup for Reels, another skin-in-video app, glitter highlight (two parts).

The promise is practical: light makeup and clothes with a phone, then retouch on the same device.

---

## 8. Languages, RTL, and type

| | French | Arabic |
| --- | --- | --- |
| Path | `/fr` | `/ar` |
| `lang` / `dir` | `fr` / `ltr` | `ar` / `rtl` |
| BCP-47 | `fr-DZ` | `ar-DZ` |
| Display font | Archivo | Noto Kufi Arabic |
| Body font | Inter | IBM Plex Sans Arabic |

Every user-facing string is a `{ fr, ar }` pair in `content/content.ts`. Components never hardcode copy; they call `useT()` / `t()`.

Layout uses **logical CSS** (`start` / `end` / `ms` / `ps`) so the UI flips in RTL. Directional icons rotate 180° in Arabic. Tracking and leading that work for Latin are overridden for Arabic so joined letterforms are not pulled apart.

Default landing locale is French (`/` → `/fr`).

---

## 9. Visual identity

Sampled in part from 22framesacademy.com gold, then tempered so the page stays cinematic rather than loud.

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#0A0A0A` | Page background |
| `ink-soft` | `#111111` | Alternating bands |
| `ink-card` | `#171717` | Cards |
| `gold` | `#FFB906` | Primary CTAs, active accents |
| `gold-muted` | `#C9A24B` | Eyebrows, borders, small type |
| `cream` | `#F5F1E8` | Primary text |
| `cream-dim` / `cream-faint` | muted creams | Secondary / tertiary text |

Motion uses one easing curve: `cubic-bezier(0.16, 1, 0.3, 1)` (`ease-cinema`). No bounce.

Hero, course still, and academy backdrop are **stills and frames from the client’s own clip**, not stock. Category cards and testimonial photos are still Unsplash until real shoots land.

---

## 10. How the hero sequence is produced and served

Pipeline:

1. Source file: `hero section phototgrapher vedio.mp4` (client footage).
2. `npm run frames:extract` — FFmpeg dumps lossless PNGs into `frames-source/` (gitignored, large).
3. `npm run frames` — Sharp samples, resizes, crops (mobile portrait), encodes WebP into `public/sequence/…`, plus `hero-fallback.webp`, `still-course.webp`, `still-academy.webp`.
4. `npm run frames:upload` — pushes those files to **Vercel Blob** with stable pathnames.

Runtime URLs come from Blob:

`https://6peenlbssgljumwa.public.blob.vercel-storage.com/…`

They are **not** committed to git (too heavy; they were missing from Git deploys before Blob). Config: `sequence.config.json` (`blobBaseUrl`, frame counts, quality).

A public Blob store `malki-ismail-media` is linked to the Vercel project. The hero `.mp4` is also stored as `video/hero.mp4` on Blob.

---

## 11. Architecture (technical)

**Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3, Framer Motion, Vercel, Vercel Blob.

**Shape:** static marketing shell. Pages are SSG (`generateStaticParams` for `fr` / `ar`). No database. No auth. No server actions for payments.

**Single source of truth:** `content/content.ts` — brand, meta, nav, hero timings, categories, stats, course, teacher, testimonials, plans, footer.

**Important libraries:**

| Path | Role |
| --- | --- |
| `lib/i18n.ts` | Locales, `t` / `alt`, `dir` |
| `lib/routes.ts` | Locale-prefixed paths and home anchors |
| `lib/sequence.ts` | Blob/local media URLs, frame src helpers |
| `lib/useFrameSequence.ts` | Ordered preload of the image sequence |
| `lib/useSequenceMode.ts` | desktop / mobile / static quality tier |
| `lib/LocaleProvider.tsx` | Active locale for client components |

**Deploy:** Vercel project `malki-ismail` (team `wajda-themes-projects`).

- `vercel deploy` → **preview** URL (does not change the main domain)
- `vercel deploy --prod` → **https://malki-ismail.vercel.app**

CLI deploys upload the working tree (respecting `.vercelignore`). Git pushes would omit generated frames; that is why Blob exists.

---

## 12. What is real vs still placeholder

### Real (from the live academy / client)

- Course title, curriculum, durations, price, rating, enrolment count
- Enrolment URL on WordPress
- Publitio preview video
- Hero / stills from the client’s photographer clip
- Arabic testimonial quotes (French rewritten from them)
- Contact email and phone
- Stats aligned with the catalogue

### Placeholder / incomplete (`TODO` in code)

| Marker | What |
| --- | --- |
| `TODO(content)` | Teacher bio/credentials confirmation; Full Pack price; some upcoming trainer names; Unsplash category/testimonial images |
| `TODO(auth)` | Login / create account / “mes formations” |
| `TODO(backend)` | Newsletter submit, checkout, FAQ, legal pages, social URLs |

The Full Pack price is **intentionally masked** with animated `#` until the client sets a tariff (`hidePrice: true`).

---

## 13. Relationship to the existing WordPress site

```
This Next.js site (malki-ismail.vercel.app)
    marketing, bilingual UI, cinematic hero
                    │
                    │  “S'inscrire”
                    ▼
malkiacademy.com (WordPress LMS)
    accounts, payments, video lessons, community
```

This rebuild is the public face. The LMS remains the product students actually use. Replacing WordPress is out of scope for this repository.

---

## 14. File map (where to look)

```
content/content.ts          All copy and catalogue data
sequence.config.json        Hero frame recipe + Blob base URL
app/[locale]/page.tsx       Homepage section order
app/[locale]/layout.tsx     Fonts, metadata, nav, footer
app/[locale]/categories/    Category pages
app/[locale]/courses/       Course pages
app/components/Hero.tsx     Pin, canvas scrub, one-beat magnet
app/components/AmbientMusic.tsx
lib/sequence.ts             Media URL helper
scripts/extract-frames.mjs
scripts/prepare-frames.mjs
scripts/upload-media.mjs
```

---

## 15. How to run it locally

```bash
npm install
vercel env pull .env.local --yes   # Blob token, if you need to upload media
npm run frames                     # if public/sequence is empty
npm run frames:upload              # optional; production already has Blob files
npm run dev                        # http://localhost:3000 → /fr
```

Without local frames, the hero still works in production/preview because images load from Blob.

---

## 16. Summary

Malki Academy (this repo) is a **dark, gold-accented, bilingual marketing site** for Ismail Malki’s Algerian creator academy. It sells a **smartphone course on photographing makeup and fashion**, framed as the first vertical of a larger multi-teacher platform. The memorable piece is a **scroll-scrubbed film hero** built from the client’s own footage, served from **Vercel Blob**. Enrolment, lessons, and money still happen on **malkiacademy.com**.
