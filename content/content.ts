/* =============================================================================
   SINGLE SOURCE OF TRUTH FOR ALL COPY + DATA
   -----------------------------------------------------------------------------
   Every string rendered on the landing page lives here, in both languages, as
   `{ fr, ar }` pairs. Components resolve them with `useT()` and never hardcode
   copy, so adding a teacher/course/testimonial is a data edit.

   Non-translatable values (hrefs, image paths, numbers, icon keys) stay plain.

   >>> TODO(content): items flagged with TODO are placeholders awaiting real
   >>> assets or verified figures from the client.
   ========================================================================== */

import { mediaUrl } from "@/lib/sequence";
import type { L10n } from "@/lib/i18n";

export type { Locale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/* Brand                                                                       */
/* -------------------------------------------------------------------------- */

export const brand = {
  // The wordmark stays Latin in both locales.
  name: "Malki",
  nameAccent: "Academy",
  tagline: {
    fr: "L'académie des créateurs algériens",
    ar: "أكاديمية المبدعين الجزائريين",
  } satisfies L10n,
  // Contact details as published in the malkiacademy.com header.
  email: "contact@malkiacademy.com",
  phone: "0541 67 85 51",
  phoneHref: "tel:+213541678551",
};

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

export const meta = {
  title: {
    fr: "Malki Academy — Photographie par téléphone",
    ar: "أكاديمية مالكي — دورة التصوير بالموبايل",
  } satisfies L10n,
  description: {
    fr: "L'académie en ligne des créateurs algériens. Apprenez la photographie professionnelle avec le smartphone que vous avez déjà.",
    ar: "الأكاديمية الإلكترونية للمبدعين الجزائريين. تعلّم التصوير الاحترافي بالهاتف الذي تملكه بالفعل.",
  } satisfies L10n,
  ogDescription: {
    fr: "Apprenez la photographie professionnelle avec le smartphone que vous avez déjà.",
    ar: "تعلّم التصوير الاحترافي بالهاتف الذي تملكه بالفعل.",
  } satisfies L10n,
};

/* -------------------------------------------------------------------------- */
/* Pricing visibility                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The course price is real (scraped from the live catalogue). Anything still
 * being decided — currently the academy pack — is masked behind animated `#`
 * glyphs via the per-plan `hidePrice` flag instead of a global switch.
 */
export const revealPrices = true;

export const hiddenPriceLabel = {
  fr: "Tarif annoncé prochainement",
  ar: "يُعلن السعر قريباً",
} satisfies L10n;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export const nav = {
  links: [
    { label: { fr: "Accueil", ar: "الرئيسية" }, href: "#hero" },
    { label: { fr: "Formations", ar: "الدورات" }, href: "#categories" },
    { label: { fr: "Formateurs", ar: "المدرّبون" }, href: "#formateurs" },
    { label: { fr: "À propos", ar: "عن الأكاديمية" }, href: "#academie" },
    { label: { fr: "Contact", ar: "اتصل بنا" }, href: "#contact" },
  ] satisfies { label: L10n; href: string }[],
  login: { label: { fr: "Connexion", ar: "تسجيل الدخول" }, href: "/login" },
  cta: { label: { fr: "S'inscrire", ar: "سجّل الآن" }, href: "/login" },
  account: { fr: "Mon espace", ar: "مساحتي" } satisfies L10n,
  signedIn: { fr: "Connecté", ar: "متصل" } satisfies L10n,
  openMenu: { fr: "Ouvrir le menu", ar: "فتح القائمة" } satisfies L10n,
  closeMenu: { fr: "Fermer le menu", ar: "إغلاق القائمة" } satisfies L10n,
  languageLabel: { fr: "Langue", ar: "اللغة" } satisfies L10n,
};

/* -------------------------------------------------------------------------- */
/* Homepage ambient music (YouTube embed, not a downloaded file)               */
/* -------------------------------------------------------------------------- */

export const ambientMusic = {
  mute: { fr: "Couper le son", ar: "كتم الصوت" } satisfies L10n,
  unmute: { fr: "Activer le son", ar: "تشغيل الصوت" } satisfies L10n,
};

/* -------------------------------------------------------------------------- */
/* Hero — scroll-driven frame sequence                                         */
/* -------------------------------------------------------------------------- */

/**
 * Text checkpoints are expressed as scroll progress through the pinned hero
 * section (0 = section top hits viewport top, 1 = section fully scrolled).
 * `in`/`out` are the fade windows; tweak these to re-time the sequence.
 *
 * The headline deliberately has no `in` window — it is already on screen when
 * the page loads (it animates in on mount instead) so visitors never land on a
 * hero with no message. Everything after it is scroll-driven.
 *
 * `snaps` are the rest positions the hero magnetizes to after a flick — one
 * for each copy beat, at the centre of that beat's fully-visible window.
 */
export const hero = {
  eyebrow: {
    fr: "Photographie mobile · Algérie",
    ar: "التصوير بالهاتف · الجزائر",
  } satisfies L10n,
  headline: {
    lead: {
      fr: "Apprenez la photographie.",
      ar: "تعلّم التصوير الفوتوغرافي.",
    } satisfies L10n,
    accent: {
      fr: "Sur le téléphone que vous avez déjà.",
      ar: "بالهاتف الذي تملكه بالفعل.",
    } satisfies L10n,
    at: { out: [0.28, 0.4] } as const,
  },
  subheadline: {
    text: {
      fr: "Pas de reflex. Pas de studio. Juste la lumière, le cadre et un formateur qui vous montre exactement où regarder.",
      ar: "لا كاميرا احترافية. لا استوديو. فقط الضوء، والإطار، ومدرّب يريك أين تنظر بالضبط.",
    } satisfies L10n,
    at: { in: [0.4, 0.5], out: [0.66, 0.76] } as const,
  },
  closing: {
    // Rendered with `whitespace-pre-line`, so each language gets its own break.
    title: {
      fr: "Votre premier vrai portrait,\nce week-end.",
      ar: "أول صورة احترافية لك،\nنهاية هذا الأسبوع.",
    } satisfies L10n,
    primary: {
      label: { fr: "Découvrir la formation", ar: "اكتشف الدورة" },
      href: "#formation",
    },
    secondary: {
      label: { fr: "Voir les tarifs", ar: "عرض الأسعار" },
      href: "#tarifs",
    },
    at: { in: [0.8, 0.9] } as const,
  },
  /** Scroll-progress rest stops: headline, subheadline, closing CTA. */
  snaps: [0, 0.58, 0.95] as const,
  scrollHint: { fr: "Défilez", ar: "مرّر" } satisfies L10n,
  loadingLabel: {
    fr: "Chargement de la séquence",
    ar: "جارٍ تحميل المشاهد",
  } satisfies L10n,
};

/* -------------------------------------------------------------------------- */
/* Category strip                                                              */
/* -------------------------------------------------------------------------- */

export type CategoryStatus = "live" | "soon" | "locked";

export interface Category {
  /** Doubles as the URL segment: /fr/categories/<id>. */
  id: string;
  /** Rendered as the heading in the active language, and as the accent
   *  subtitle in the other one. */
  title: L10n;
  description: L10n;
  status: CategoryStatus;
  statusLabel: L10n;
  courseCount: L10n;
  image: string;
  /** Shown at the top of the category page in place of the strip copy. */
  intro: L10n;
}

export const categories: Category[] = [
  {
    id: "photographie",
    title: { fr: "Photographie", ar: "التصوير الفوتوغرافي" },
    description: {
      fr: "Maîtrisez la lumière, le cadrage et la retouche avec le smartphone que vous avez en poche.",
      ar: "أتقن الضوء والتأطير والمعالجة بالهاتف الذي في جيبك.",
    },
    status: "live",
    statusLabel: { fr: "Disponible", ar: "متاح" },
    courseCount: { fr: "1 formation", ar: "دورة واحدة" },
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=70",
    intro: {
      fr: "Tout ce qu'il faut pour tirer des images professionnelles d'un téléphone : la lumière, le cadrage, la direction et la retouche. Une formation est en ligne, d'autres suivent.",
      ar: "كل ما تحتاجه لانتزاع صور احترافية من هاتف: الضوء، والتأطير، والتوجيه، والمعالجة. دورة واحدة متاحة الآن، وأخرى في الطريق.",
    },
  },
  {
    id: "makeup",
    title: { fr: "Make-up", ar: "المكياج" },
    description: {
      fr: "Le maquillage professionnel, du teint parfait aux looks éditoriaux prêts pour l'objectif.",
      ar: "المكياج الاحترافي، من البشرة المثالية إلى الإطلالات الجاهزة للعدسة.",
    },
    status: "soon",
    statusLabel: { fr: "Bientôt", ar: "قريباً" },
    courseCount: { fr: "En préparation", ar: "قيد الإعداد" },
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=70",
    intro: {
      fr: "Teint, yeux, lèvres et looks complets, filmés de près. La catégorie ouvrira avec son propre formateur.",
      ar: "البشرة والعيون والشفاه وإطلالات كاملة، مصوّرة عن قرب. ستفتتح الفئة مع مدرّبها الخاص.",
    },
  },
  {
    id: "hair",
    title: { fr: "Hair Styling", ar: "تصفيف الشعر" },
    description: {
      fr: "Coupes, brushings et coiffures d'événement enseignés par des coiffeurs en activité.",
      ar: "قصّات وتسريحات ومناسبات، يدرّسها مصفّفون محترفون يمارسون المهنة.",
    },
    status: "soon",
    statusLabel: { fr: "Bientôt", ar: "قريباً" },
    courseCount: { fr: "En préparation", ar: "قيد الإعداد" },
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=70",
    intro: {
      fr: "Coupes, brushings et coiffures d'événement, enseignés pas à pas par des coiffeurs en activité.",
      ar: "قصّات وتسريحات ومناسبات، تُدرَّس خطوة بخطوة على يد مصفّفين يمارسون المهنة.",
    },
  },
  {
    id: "next",
    title: { fr: "Prochaine catégorie", ar: "الفئة القادمة" },
    description: {
      fr: "Design, vidéo, marketing… Les prochains formateurs de l'académie arrivent.",
      ar: "تصميم، فيديو، تسويق… مدرّبو الأكاديمية القادمون في الطريق.",
    },
    status: "locked",
    statusLabel: { fr: "Verrouillé", ar: "مقفل" },
    courseCount: { fr: "—", ar: "—" },
    image:
      "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1200&q=70",
    intro: {
      fr: "Design, vidéo, marketing… L'académie est construite pour accueillir de nouveaux formateurs.",
      ar: "تصميم، فيديو، تسويق… الأكاديمية مبنية لاستقبال مدرّبين جدد.",
    },
  },
];

export const categoryById = (id: string) => categories.find((c) => c.id === id);

export const categorySection = {
  eyebrow: { fr: "Catégories", ar: "الفئات" } satisfies L10n,
  title: {
    fr: "Des formations données par les meilleurs formateurs d'Algérie.",
    ar: "دورات يقدّمها أفضل المدربين في الجزائر.",
  } satisfies L10n,
  body: {
    fr: "L'académie s'ouvre avec la photographie mobile. Les catégories suivantes arrivent avec leurs propres formateurs.",
    ar: "تنطلق الأكاديمية بالتصوير بالهاتف. الفئات التالية ستأتي مع مدرّبيها الخاصين.",
  } satisfies L10n,
  explore: { fr: "Explorer la formation", ar: "استكشف الدورة" } satisfies L10n,
  soon: { fr: "Bientôt disponible", ar: "متاح قريباً" } satisfies L10n,
};

/* -------------------------------------------------------------------------- */
/* Stats                                                                       */
/* -------------------------------------------------------------------------- */

export interface Stat {
  value: number;
  /** Western digits in both locales — Algeria uses 0-9, not Arabic-Indic. */
  suffix: string;
  /** Digits after the decimal point in the count-up, e.g. a 4.9 rating. */
  decimals?: number;
  label: L10n;
}

/** Figures taken from the live catalogue, not placeholders. */
export const stats: Stat[] = [
  {
    value: 293,
    suffix: "",
    label: { fr: "Apprenants inscrits", ar: "المتعلّمون المسجّلون" },
  },
  {
    value: 4.9,
    suffix: "/5",
    decimals: 1,
    label: { fr: "Note moyenne", ar: "متوسّط التقييم" },
  },
  {
    value: 17,
    suffix: "",
    label: { fr: "Leçons vidéo", ar: "محاضرة فيديو" },
  },
  {
    value: 24,
    suffix: "/7",
    label: { fr: "Accès à la plateforme", ar: "الوصول إلى المنصة" },
  },
];

/* -------------------------------------------------------------------------- */
/* Course catalogue                                                            */
/* -------------------------------------------------------------------------- */

/** One video lesson. `duration` is omitted where the platform has none set. */
export interface Lesson {
  title: L10n;
  duration?: string;
}

export interface CourseModule {
  title: L10n;
  lessons: Lesson[];
}

/**
 * The single live course, mirrored from the catalogue entry at
 * malkiacademy.com/courses/دورة-تصوير-الميكاج-والملابس-بالموبايل.
 * Figures, curriculum and preview video are the real ones.
 */
const photographyMobileCourse = {
  /** URL segment: /fr/courses/<slug>. */
  slug: "makeup-mode-smartphone",
  /** Matches a `Category.id`, which is how the category page finds it. */
  categoryId: "photographie",
  eyebrow: { fr: "Formation vedette", ar: "الدورة المميّزة" } satisfies L10n,
  category: { fr: "Photographie", ar: "التصوير الفوتوغرافي" } satisfies L10n,
  /** Heading in the active language, accent subtitle in the other one. */
  title: {
    fr: "Photographier make-up & mode au smartphone",
    ar: "دورة تصوير الميكاج والملابس بالموبايل",
  } satisfies L10n,
  // The catalogue entry ships no description, so this is written from the
  // actual lesson list rather than invented.
  summary: {
    fr: "Éclairer, filmer et retoucher le make-up et les tenues avec un simple téléphone. De la théorie de la lumière aux montages d'éclairage professionnels, jusqu'à la retouche de la peau et l'éclat du glitter — le tout sur mobile.",
    ar: "أضئ وصوّر وعالج المكياج والملابس بهاتف بسيط. من نظرية الضوء إلى تركيبات الإضاءة الاحترافية، وصولاً إلى تنعيم البشرة وسرّ لمعة الغليتر — كل ذلك على الموبايل.",
  } satisfies L10n,
  price: {
    amount: "40 000",
    strikeAmount: "50 000",
    currency: { fr: "DA", ar: "دج" } satisfies L10n,
    discountBadge: { fr: "-20 %", ar: "-20٪" } satisfies L10n,
    note: {
      fr: "Prix de lancement, -20 % sur le tarif normal",
      ar: "سعر الإطلاق، خصم 20٪ عن السعر العادي",
    } satisfies L10n,
  },
  /** Live catalogue figures as of the December 2025 update. */
  social: {
    rating: "4.91",
    reviews: "11",
    enrolled: "293",
    ratingLabel: { fr: "sur 5", ar: "من 5" } satisfies L10n,
    reviewsLabel: { fr: "avis", ar: "تقييماً" } satisfies L10n,
    enrolledLabel: { fr: "déjà inscrits", ar: "مسجّلون بالفعل" } satisfies L10n,
    updatedLabel: { fr: "Mis à jour", ar: "آخر تحديث" } satisfies L10n,
    updated: { fr: "décembre 2025", ar: "ديسمبر 2025" } satisfies L10n,
  },
  meta: [
    {
      label: { fr: "Niveau", ar: "المستوى" },
      value: { fr: "Débutant", ar: "مبتدئ" },
    },
    {
      label: { fr: "Leçons", ar: "المحاضرات" },
      value: { fr: "17 vidéos", ar: "17 فيديو" },
    },
    {
      label: { fr: "Durée", ar: "المدة" },
      value: { fr: "1 h 20 environ", ar: "حوالي ساعة و20 دقيقة" },
    },
    {
      label: { fr: "Langue", ar: "اللغة" },
      value: { fr: "Arabe", ar: "العربية" },
    },
  ] satisfies { label: L10n; value: L10n }[],
  learnTitle: {
    fr: "Ce que vous allez maîtriser",
    ar: "ما الذي ستتقنه",
  } satisfies L10n,
  learn: [
    {
      fr: "Lire la lumière : douce ou dure, température et rendu des couleurs.",
      ar: "قراءة الضوء: ناعم أو حاد، ولون الإضاءة وتجسيد الألوان.",
    },
    {
      fr: "Régler votre téléphone à la main, comme un vrai appareil photo.",
      ar: "ضبط هاتفك يدوياً كما لو كان كاميرا احترافية.",
    },
    {
      fr: "Monter un éclairage professionnel pour le make-up et les tenues.",
      ar: "بناء إضاءة احترافية للمكياج والملابس.",
    },
    {
      fr: "Retoucher peau, make-up et glitter directement sur mobile.",
      ar: "معالجة البشرة والمكياج والغليتر مباشرة على الهاتف.",
    },
  ] satisfies L10n[],
  curriculumTitle: { fr: "Le programme", ar: "المناهج" } satisfies L10n,
  /** "3 modules · 17 leçons · 1 h 20" — assembled in the component. */
  curriculumSummary: {
    modules: { fr: "modules", ar: "وحدات" } satisfies L10n,
    lessons: { fr: "leçons", ar: "محاضرة" } satisfies L10n,
    total: { fr: "1 h 20 de vidéo", ar: "ساعة و20 دقيقة من الفيديو" } satisfies L10n,
  },
  lockedLabel: {
    fr: "Débloqué à l'inscription",
    ar: "يُفتح عند التسجيل",
  } satisfies L10n,
  curriculum: [
    {
      title: { fr: "Les fondamentaux", ar: "الجزء النظري" },
      lessons: [
        { title: { fr: "Introduction", ar: "مقدمة" } },
        { title: { fr: "Qu'est-ce que la vidéo ?", ar: "ما هو الفيديو" }, duration: "1:58" },
        {
          title: {
            fr: "Température de lumière & rendu des couleurs",
            ar: "لون الاضاءة و مؤشر تجسيد اللون",
          },
          duration: "3:02",
        },
        {
          title: { fr: "Lumière douce / lumière dure", ar: "الضوء الناعم / الضوء الحاد" },
          duration: "1:32",
        },
        {
          title: { fr: "Régler les paramètres du téléphone", ar: "ضبط إعدادات الهاتف" },
          duration: "5:42",
        },
      ],
    },
    {
      title: {
        fr: "Éclairer comme un pro",
        ar: "توزيع الإضاءة بطرق إحترافية",
      },
      lessons: [
        { title: { fr: "Leçon 1 · partie 1", ar: "الدرس الأول part 1" }, duration: "7:44" },
        { title: { fr: "Leçon 1 · partie 2", ar: "الدرس الأول part 2" }, duration: "5:55" },
        { title: { fr: "Leçon 1 · partie 3", ar: "الدرس الأول part 3" }, duration: "5:28" },
        { title: { fr: "Leçon 2", ar: "الدرس 2" }, duration: "8:25" },
        { title: { fr: "Leçon 3", ar: "الدرس 3" }, duration: "3:29" },
      ],
    },
    {
      title: { fr: "Retouche & montage", ar: "جزء التعديل والمونتاج" },
      lessons: [
        {
          title: {
            fr: "Retoucher ses photos au mobile · partie 1",
            ar: "الطريقة الإحترافية لتعديل الصور بالموبايل part 1",
          },
          duration: "8:58",
        },
        {
          title: {
            fr: "Retoucher ses photos au mobile · partie 2",
            ar: "الطريقة الإحترافية لتعديل الصور بالموبايل part 2",
          },
          duration: "6:59",
        },
        {
          title: {
            fr: "Peau & make-up pour les Reels · partie 1",
            ar: "تنعيم وتعديل البشرة والمايكآب لفيديوهات الريلز والتيتوريال part 1",
          },
          duration: "6:39",
        },
        {
          title: {
            fr: "Peau & make-up pour les Reels · partie 2",
            ar: "تنعيم وتعديل البشرة والمايكآب لفيديوهات الريلز part 2",
          },
          duration: "4:49",
        },
        {
          title: {
            fr: "Une autre app pour la peau en vidéo",
            ar: "تطبيق أخر لتعديل البشرة في الفيديو",
          },
          duration: "9:54",
        },
        {
          title: { fr: "Le secret de l'éclat du glitter · partie 1", ar: "سر لمعة الغليتر part 1" },
        },
        {
          title: { fr: "Le secret de l'éclat du glitter · partie 2", ar: "سر لمعة الغليتر part 2" },
        },
      ],
    },
  ] satisfies CourseModule[],
  /** Enrolment still happens on the WordPress platform. */
  enrolHref:
    "https://malkiacademy.com/courses/%d8%af%d9%88%d8%b1%d8%a9-%d8%aa%d8%b5%d9%88%d9%8a%d8%b1-%d8%a7%d9%84%d9%85%d9%8a%d9%83%d8%a7%d8%ac-%d9%88%d8%a7%d9%84%d9%85%d9%84%d8%a7%d8%a8%d8%b3-%d8%a8%d8%a7%d9%84%d9%85%d9%88%d8%a8%d8%a7%d9%8a/",
  /** Publitio-hosted preview, loaded only once the poster is clicked. */
  previewVideo: "https://malki.publit.io/file/JGfyztu3.html",
  playLabel: {
    fr: "Lire la vidéo de présentation",
    ar: "شاهد فيديو التقديم",
  } satisfies L10n,
  // Real still cut from the client's own clip by `npm run frames`.
  image: mediaUrl("still-course.webp"),
};

export type Course = typeof photographyMobileCourse;

export const courses: Course[] = [photographyMobileCourse];

export const courseBySlug = (slug: string) => courses.find((c) => c.slug === slug);

export const coursesInCategory = (categoryId: string) =>
  courses.filter((c) => c.categoryId === categoryId);

/** The one the home page teases. */
export const featuredCourse = photographyMobileCourse;

/** Shared chrome for course cards and course pages. */
export const courseUi = {
  enrol: { fr: "S'inscrire à la formation", ar: "سجّل في الدورة" } satisfies L10n,
  viewCourse: { fr: "Voir la formation", ar: "عرض الدورة" } satisfies L10n,
  viewProgramme: { fr: "Voir le programme", ar: "عرض المناهج" } satisfies L10n,
  backToCategory: { fr: "Toutes les formations", ar: "كل الدورات" } satisfies L10n,
  home: { fr: "Accueil", ar: "الرئيسية" } satisfies L10n,
  breadcrumbLabel: { fr: "Fil d'ariane", ar: "مسار التنقّل" } satisfies L10n,
  taughtBy: { fr: "Formateur", ar: "المدرّب" } satisfies L10n,
  emptyTitle: {
    fr: "Cette catégorie ouvre bientôt.",
    ar: "هذه الفئة تفتح قريباً.",
  } satisfies L10n,
  emptyBody: {
    fr: "Le formateur est en cours de tournage. Laissez-nous votre e-mail et vous serez prévenu en premier.",
    ar: "المدرّب في مرحلة التصوير. اترك بريدك الإلكتروني وستكون أول من يُخطر.",
  } satisfies L10n,
  emptyCta: { fr: "Être prévenu", ar: "أعلمني" } satisfies L10n,
  courseCountLabel: {
    one: { fr: "formation disponible", ar: "دورة متاحة" } satisfies L10n,
    many: { fr: "formations disponibles", ar: "دورات متاحة" } satisfies L10n,
  },
};

export const teacher = {
  eyebrow: { fr: "Formateur", ar: "المدرّب" } satisfies L10n,
  // TODO(content): confirm the bio and credentials with the client.
  name: { fr: "Ismail Malki", ar: "إسماعيل مالكي" } satisfies L10n,
  role: { fr: "Photographe · Formateur", ar: "مصوّر · مدرّب" } satisfies L10n,
  credentials: [
    { fr: "Photographe portrait & produit", ar: "مصوّر بورتريه ومنتجات" },
    { fr: "10 ans de terrain", ar: "10 سنوات في الميدان" },
    { fr: "Fondateur de Malki Academy", ar: "مؤسس أكاديمية مالكي" },
  ] satisfies L10n[],
  bio: {
    fr: "Ismail forme depuis dix ans des créateurs algériens à tirer des images professionnelles d'un simple téléphone. Sa méthode est volontairement dépouillée : comprendre la lumière avant d'acheter du matériel.",
    ar: "يدرّب إسماعيل منذ عشر سنوات المبدعين الجزائريين على انتزاع صور احترافية من هاتف بسيط. منهجه مجرّد عن قصد: افهم الضوء قبل أن تشتري المعدّات.",
  } satisfies L10n,
  /**
   * Head-and-shoulders crop of `/teachers/ismail-malki.png`. The source photo
   * is a square full-body shot, which leaves the face occupying barely a third
   * of a circular avatar; this is cropped to frame him properly at 64-80px.
   */
  portrait: "/teachers/ismail-malki-avatar.png",
};

/* -------------------------------------------------------------------------- */
/* Value props                                                                 */
/* -------------------------------------------------------------------------- */

export interface ValueProp {
  icon: "globe" | "user" | "infinity" | "users";
  title: L10n;
  body: L10n;
}

export const valuePropSection = {
  eyebrow: { fr: "Avantages", ar: "المزايا" } satisfies L10n,
  title: {
    fr: "Pourquoi choisir Malki Academy ?",
    ar: "لماذا تختار أكاديمية مالكي؟",
  } satisfies L10n,
  body: {
    fr: "Des cours en ligne, pour tout le monde, partout.",
    ar: "دورات عبر الإنترنت لأي شخص وفي أي مكان.",
  } satisfies L10n,
};

export const valueProps: ValueProp[] = [
  {
    icon: "globe",
    title: { fr: "Apprenez où vous voulez", ar: "تعلّم أينما كنت" },
    body: {
      fr: "La plateforme suit votre téléphone. Un trajet de bus suffit pour boucler un module.",
      ar: "المنصة تتبع هاتفك. رحلة حافلة واحدة تكفي لإنهاء وحدة كاملة.",
    },
  },
  {
    icon: "user",
    title: { fr: "De vrais formateurs", ar: "مدرّبون حقيقيون" },
    body: {
      fr: "Des professionnels en activité, pas des vidéos anonymes achetées en gros.",
      ar: "محترفون يمارسون المهنة، لا مقاطع مجهولة تُشترى بالجملة.",
    },
  },
  {
    icon: "infinity",
    title: { fr: "Accès à vie", ar: "وصول مدى الحياة" },
    body: {
      fr: "Achetée une fois, la formation reste à vous — mises à jour comprises.",
      ar: "تشتريها مرة واحدة فتبقى لك — مع كل التحديثات.",
    },
  },
  {
    icon: "users",
    title: { fr: "Une communauté", ar: "مجتمع متكامل" },
    body: {
      fr: "Retours sur vos images, défis mensuels et entraide entre apprenants.",
      ar: "ملاحظات على صورك، تحدّيات شهرية، وتعاون بين المتعلّمين.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Testimonials                                                                */
/* -----------------------------------------------------------------------------
   The Arabic quotes are the ORIGINALS from malkiacademy.com. The French is a
   rewrite of them, not the other way round.
   -------------------------------------------------------------------------- */

export interface Testimonial {
  name: L10n;
  role: L10n;
  quote: L10n;
  avatar: string;
}

export const testimonialSection = {
  eyebrow: { fr: "Nos premiers membres", ar: "أعضاؤنا الأوائل" } satisfies L10n,
  title: {
    fr: "Ce que disent nos étudiants",
    ar: "ما يقوله طلابنا",
  } satisfies L10n,
  previous: { fr: "Précédent", ar: "السابق" } satisfies L10n,
  next: { fr: "Suivant", ar: "التالي" } satisfies L10n,
  slide: { fr: "Témoignage", ar: "شهادة" } satisfies L10n,
};

export const testimonials: Testimonial[] = [
  {
    name: { fr: "Asma H.", ar: "أسماء ح." },
    role: { fr: "Créatrice de mode", ar: "مصمّمة أزياء" },
    quote: {
      fr: "La formation photo au mobile était bluffante. J'ai enfin compris la lumière et les angles : mes pièces sont bien plus professionnelles et attirantes sur les réseaux.",
      ar: "كانت دورة التصوير بالموبايل مذهلة! كمصممة أزياء، استفدت كثيراً من تعلّم كيفية التقاط الصور بجودة عالية لأعمالي. ساعدني المدرب في فهم أساسيات الإضاءة والزوايا مما جعل صوري تبدو أكثر احترافية وجاذبية على وسائل التواصل الاجتماعي.",
    },
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: { fr: "Samir K.", ar: "سمير ك." },
    role: { fr: "Propriétaire de salon", ar: "صاحب صالون تجميل" },
    quote: {
      fr: "Très utile pour mon salon. J'ai appris à photographier mes coiffures avec mon smartphone, et je présente aujourd'hui mon travail en ligne bien plus sérieusement.",
      ar: "الدورة كانت مفيدة جداً لي كصاحب صالون تجميل. تعلمت كيفية استخدام هاتفي الذكي لالتقاط صور رائعة لتسريحات الشعر التي أقوم بها. الآن يمكنني عرض عملي على الإنترنت بطريقة أكثر احترافية وجذب المزيد من العملاء.",
    },
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: { fr: "Lila A.", ar: "ليلى أ." },
    role: { fr: "Maquilleuse", ar: "خبيرة مكياج" },
    quote: {
      fr: "J'ai appris à capturer mes maquillages et ceux de mes clientes grâce aux conseils du formateur. Mes créations sont enfin mises en valeur comme elles le méritent.",
      ar: "دورة التصوير بالموبايل كانت رائعة! تعلمت كيف ألتقط صوراً جميلة لمكياجي ولعميلاتي بفضل النصائح القيمة التي قدمها المدرب. الآن يمكنني عرض مهاراتي وإبداعاتي بشكل أفضل على وسائل التواصل الاجتماعي، مما يزيد من شهرتي وعملائي.",
    },
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: { fr: "Rachid M.", ar: "رشيد م." },
    role: { fr: "Musicien", ar: "موسيقي" },
    quote: {
      fr: "En tant que musicien, il me faut de bonnes images pour promouvoir mes concerts. Je crée maintenant un contenu visuel qui me ressemble, avec mon seul téléphone.",
      ar: "كموسيقي، أحتاج دائماً إلى صور جيدة لصفحاتي على وسائل التواصل وللترويج لعروضي. دورة التصوير بالموبايل كانت مفيدة جداً، تعلمت كيفية التقاط صور احترافية باستخدام هاتفي الذكي فقط. الآن يمكنني إنشاء محتوى بصري رائع يلفت الأنظار ويعبّر عن شخصيتي الفنية.",
    },
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: { fr: "Nouria S.", ar: "نورية س." },
    role: { fr: "Créatrice de contenu", ar: "صانعة محتوى" },
    quote: {
      fr: "Je cherchais à améliorer la qualité de mes photos. La lumière naturelle et le choix des angles ont tout changé : plus d'engagement, et de nouveaux abonnés.",
      ar: "كشخصية مؤثرة على إنستغرام، كنت أبحث دائماً عن طرق لتحسين جودة صوري. هذه الدورة أعطتني الأدوات والتقنيات التي أحتاجها لجعل محتواي يبرز. من خلال تعلّم كيفية استخدام الضوء الطبيعي واختيار الزوايا المناسبة، أصبحت صوري تحصل على تفاعل أكبر ومتابعين جدد.",
    },
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=70",
  },
];

/* -------------------------------------------------------------------------- */
/* Multi-teacher teaser — the marketplace story                                */
/* -------------------------------------------------------------------------- */

export const marketplace = {
  eyebrow: { fr: "L'académie", ar: "الأكاديمية" } satisfies L10n,
  title: {
    fr: "Une académie, plusieurs formateurs.",
    ar: "أكاديمية واحدة، مدرّبون متعدّدون.",
  } satisfies L10n,
  body: [
    {
      fr: "Malki Academy n'est pas une formation isolée. C'est une plateforme conçue pour accueillir les meilleurs professionnels algériens, chacun avec sa discipline et sa méthode.",
      ar: "أكاديمية مالكي ليست دورة منفردة. إنها منصة صُمّمت لاستقبال أفضل المحترفين الجزائريين، لكلٍّ منهم تخصّصه ومنهجه.",
    },
    {
      fr: "La photographie mobile ouvre le catalogue. Le make-up, la coiffure et le design suivent, avec leurs propres formateurs et leurs propres certifications.",
      ar: "التصوير بالهاتف يفتتح الكتالوج. المكياج وتصفيف الشعر والتصميم تليها، بمدرّبيها وشهاداتها الخاصة.",
    },
  ] satisfies L10n[],
  // TODO(content): replace with real incoming teachers as they sign.
  upcoming: [
    {
      name: { fr: "Formateur Make-up", ar: "مدرّب المكياج" },
      discipline: { fr: "Maquillage professionnel", ar: "مكياج احترافي" },
      eta: "2026",
    },
    {
      name: { fr: "Formateur Hair", ar: "مدرّب تصفيف الشعر" },
      discipline: { fr: "Coiffure & Styling", ar: "الحلاقة والتصفيف" },
      eta: "2026",
    },
    {
      name: { fr: "Formateur Design", ar: "مدرّب التصميم" },
      discipline: { fr: "Identité visuelle", ar: "الهوية البصرية" },
      eta: "2027",
    },
  ] satisfies { name: L10n; discipline: L10n; eta: string }[],
  cta: { label: { fr: "Devenir formateur", ar: "كن مدرّباً" }, href: "#contact" },
  // Real still cut from the client's own clip by `npm run frames`.
  image: mediaUrl("still-academy.webp"),
};

/* -------------------------------------------------------------------------- */
/* Pricing                                                                     */
/* -------------------------------------------------------------------------- */

export interface Plan {
  id: string;
  name: L10n;
  /** Western digits in both locales. */
  price: string;
  currency: L10n;
  /** Amount only — it is rendered with `currency`, so it stays a bare figure. */
  strikePrice?: string;
  /** Masks the figure behind animated `#` until the client fixes the tariff. */
  hidePrice?: boolean;
  note: L10n;
  description: L10n;
  features: L10n[];
  cta: L10n;
  /** Resolved to a locale-prefixed course URL by the component. */
  courseSlug?: string;
  /** Used when the plan isn't a single course. */
  ctaHref?: string;
  featured: boolean;
}

export const pricingSection = {
  eyebrow: { fr: "Le prix", ar: "السعر" } satisfies L10n,
  title: {
    fr: "Investir dans ses compétences.",
    ar: "استثمر في مهاراتك.",
  } satisfies L10n,
  body: {
    fr: "Accès à vie, mises à jour incluses, satisfait ou remboursé sous 14 jours.",
    ar: "وصول مدى الحياة، تحديثات مجانية، واسترجاع خلال 14 يوماً.",
  } satisfies L10n,
  featuredBadge: { fr: "Recommandé", ar: "موصى به" } satisfies L10n,
  guarantee: {
    fr: "Garantie satisfait ou remboursé · Accès à vie · Produit en évolution permanente",
    ar: "ضمان استرجاع المال · وصول مدى الحياة · منتج في تطوّر دائم",
  } satisfies L10n,
};

export const plans: Plan[] = [
  {
    id: "single",
    // Real catalogue tariff — mirrors the course page.
    name: { fr: "Formation seule", ar: "الدورة وحدها" },
    price: featuredCourse.price.amount,
    currency: { fr: "DA", ar: "دج" },
    strikePrice: featuredCourse.price.strikeAmount,
    note: featuredCourse.price.note,
    description: {
      fr: "La formation Make-up & mode au smartphone, intégralement.",
      ar: "دورة تصوير الميكاج والملابس بالموبايل كاملة.",
    },
    features: [
      { fr: "3 modules · 17 leçons vidéo", ar: "3 وحدات · 17 محاضرة فيديو" },
      { fr: "Accès à vie et mises à jour", ar: "وصول مدى الحياة مع التحديثات" },
      { fr: "Certificat de fin de formation", ar: "شهادة إتمام الدورة" },
      { fr: "Accès à la communauté", ar: "الدخول إلى المجتمع" },
    ],
    cta: { fr: "Voir la formation", ar: "عرض الدورة" },
    // Sends people to the course page rather than straight to checkout, so
    // they can watch the preview and read the programme first.
    courseSlug: featuredCourse.slug,
    featured: false,
  },
  {
    id: "full",
    name: { fr: "Full Pack Académie", ar: "الباقة الكاملة" },
    // TODO(content): the pack tariff is still being decided, so it stays masked.
    price: "29 000",
    currency: { fr: "DA", ar: "دج" },
    strikePrice: "42 000",
    hidePrice: true,
    note: { fr: "Paiement en 1, 3 ou 6 fois", ar: "الدفع على 1 أو 3 أو 6 دفعات" },
    description: {
      fr: "Toutes les formations actuelles et à venir, au tarif de lancement.",
      ar: "كل الدورات الحالية والقادمة، بسعر الإطلاق.",
    },
    features: [
      { fr: "Toutes les formations actuelles", ar: "كل الدورات الحالية" },
      { fr: "Toutes les formations à venir incluses", ar: "كل الدورات القادمة مشمولة" },
      { fr: "Accès à vie et mises à jour", ar: "وصول مدى الحياة مع التحديثات" },
      { fr: "Certificats pour chaque formation", ar: "شهادة لكل دورة" },
      { fr: "Retours personnalisés sur vos images", ar: "ملاحظات شخصية على صورك" },
      { fr: "Accès prioritaire aux ateliers", ar: "أولوية الوصول إلى ورشات العمل" },
    ],
    cta: { fr: "Rejoindre l'académie", ar: "انضم إلى الأكاديمية" },
    ctaHref: "#contact",
    featured: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

export const footer = {
  blurb: {
    fr: "L'académie en ligne des créateurs algériens. Photographie aujourd'hui, bien plus demain.",
    ar: "الأكاديمية الإلكترونية للمبدعين الجزائريين. التصوير اليوم، وأكثر من ذلك غداً.",
  } satisfies L10n,
  columns: [
    {
      title: { fr: "Académie", ar: "الأكاديمية" },
      links: [
        { label: { fr: "Formations", ar: "الدورات" }, href: "#categories" },
        { label: { fr: "Formateurs", ar: "المدرّبون" }, href: "#formateurs" },
        { label: { fr: "Tarifs", ar: "الأسعار" }, href: "#tarifs" },
        { label: { fr: "Devenir formateur", ar: "كن مدرّباً" }, href: "#contact" },
      ],
    },
    {
      title: { fr: "Liens utiles", ar: "روابط مفيدة" },
      links: [
        { label: { fr: "Catégories", ar: "الفئات" }, href: "#categories" },
        { label: { fr: "Avis sur les cours", ar: "تقييمات الدورات" }, href: "#temoignages" },
        { label: { fr: "FAQ", ar: "الأسئلة الشائعة" }, href: "/faq" },
        { label: { fr: "Contact", ar: "اتصل بنا" }, href: "#contact" },
      ],
    },
    {
      title: { fr: "Mon compte", ar: "حسابي" },
      links: [
        { label: { fr: "Connexion / Inscription", ar: "دخول / تسجيل" }, href: "/login" },
        { label: { fr: "Mes formations", ar: "دوراتي" }, href: "/student" },
      ],
    },
  ] satisfies { title: L10n; links: { label: L10n; href: string }[] }[],
  newsletter: {
    title: {
      fr: "Inscrivez-vous à la newsletter",
      ar: "اشترك في النشرة الإخبارية",
    } satisfies L10n,
    body: {
      fr: "Ressources gratuites, nouveautés de l'académie et offres de lancement.",
      ar: "موارد مجانية، أخبار الأكاديمية، وعروض الإطلاق.",
    } satisfies L10n,
    placeholder: { fr: "votre@email.com", ar: "بريدك الإلكتروني" } satisfies L10n,
    cta: { fr: "Rejoindre", ar: "انضم" } satisfies L10n,
    success: {
      fr: "Merci. Vous êtes sur la liste.",
      ar: "شكراً. أنت الآن في القائمة.",
    } satisfies L10n,
    duplicate: {
      fr: "Cet email est déjà inscrit.",
      ar: "هذا البريد مسجّل مسبقاً.",
    } satisfies L10n,
    error: {
      fr: "Impossible d'enregistrer l'email. Réessayez.",
      ar: "تعذّر حفظ البريد. حاول مرة أخرى.",
    } satisfies L10n,
  },
  socials: [] as { label: string; href: string; icon: "instagram" | "facebook" | "tiktok" | "youtube" }[],
  legal: [
    { label: { fr: "Mentions légales", ar: "الإشعارات القانونية" }, href: "/mentions-legales" },
    { label: { fr: "Conditions générales", ar: "الشروط العامة" }, href: "/conditions" },
    { label: { fr: "Confidentialité", ar: "الخصوصية" }, href: "/confidentialite" },
  ] satisfies { label: L10n; href: string }[],
  copyright: {
    fr: `© ${new Date().getFullYear()} Malki Academy. Tous droits réservés.`,
    ar: `© ${new Date().getFullYear()} أكاديمية مالكي. جميع الحقوق محفوظة.`,
  } satisfies L10n,
};

export const contactForm = {
  title: { fr: "Écrivez-nous", ar: "راسلنا" } satisfies L10n,
  body: {
    fr: "Une question sur une formation ou un paiement ? Laissez vos coordonnées — on vous répond.",
    ar: "سؤال عن دورة أو دفع؟ اترك بياناتك وسنرد عليك.",
  } satisfies L10n,
  name: { fr: "Nom", ar: "الاسم" } satisfies L10n,
  contact: { fr: "Email ou WhatsApp", ar: "البريد أو واتساب" } satisfies L10n,
  contactPlaceholder: { fr: "email@… ou +213…", ar: "email@… أو +213…" } satisfies L10n,
  message: { fr: "Message", ar: "الرسالة" } satisfies L10n,
  submit: { fr: "Envoyer", ar: "إرسال" } satisfies L10n,
  sending: { fr: "Envoi…", ar: "جاري الإرسال…" } satisfies L10n,
  success: {
    fr: "Message envoyé. Nous vous répondons dès que possible.",
    ar: "تم الإرسال. سنرد في أقرب وقت.",
  } satisfies L10n,
};

export const legalPages = {
  mentions: {
    title: { fr: "Mentions légales", ar: "الإشعارات القانونية" } satisfies L10n,
    body: {
      fr: "Malki Academy est une académie en ligne de photographie et de création, opérée en Algérie. Contact : contact@malkiacademy.com — 0541 67 85 51.",
      ar: "أكاديمية مالكي أكاديمية إلكترونية للتصوير والإبداع، تعمل من الجزائر. للتواصل: contact@malkiacademy.com — 0541 67 85 51.",
    } satisfies L10n,
  },
  terms: {
    title: { fr: "Conditions générales", ar: "الشروط العامة" } satisfies L10n,
    body: {
      fr: "L’accès aux formations se fait après confirmation du paiement (WhatsApp, virement ou autre moyen convenu). Un compte se crée automatiquement à la première connexion par email. L’accès est personnel et non cessible. Pour toute réclamation, écrivez-nous via la page Contact.",
      ar: "يُفعَّل الوصول إلى الدورات بعد تأكيد الدفع (واتساب أو تحويل أو وسيلة متفق عليها). يُنشأ الحساب تلقائياً عند أول دخول بالبريد. الوصول شخصي وغير قابل للتنازل. لأي شكوى، راسلنا عبر صفحة الاتصال.",
    } satisfies L10n,
  },
  privacy: {
    title: { fr: "Confidentialité", ar: "الخصوصية" } satisfies L10n,
    body: {
      fr: "Nous collectons uniquement ce qui sert à vous inscrire, vous contacter et vous donner accès aux cours : nom, email, WhatsApp, messages et progression. Ces données ne sont pas vendues. Vous pouvez demander leur suppression en nous écrivant à contact@malkiacademy.com.",
      ar: "نجمع فقط ما يلزم للتسجيل والتواصل ومنح الوصول: الاسم والبريد وواتساب والرسائل والتقدم. لا نبيع هذه البيانات. يمكنك طلب حذفها عبر contact@malkiacademy.com.",
    } satisfies L10n,
  },
};

export const faqPage = {
  title: { fr: "Questions fréquentes", ar: "أسئلة شائعة" } satisfies L10n,
  items: [
    {
      q: { fr: "Comment je m’inscris ?", ar: "كيف أسجّل؟" } satisfies L10n,
      a: {
        fr: "Entrez votre email sur la page Connexion. Nous envoyons un code à 6 chiffres — pas de mot de passe. Un compte élève se crée tout seul au premier code validé.",
        ar: "أدخل بريدك في صفحة الدخول. نرسل رمزاً من 6 أرقام — بدون كلمة مرور. يُنشأ حساب الطالب تلقائياً عند أول رمز صحيح.",
      } satisfies L10n,
    },
    {
      q: { fr: "Comment j’accède à un cours ?", ar: "كيف أصل إلى دورة؟" } satisfies L10n,
      a: {
        fr: "Demandez l’accès depuis la page du cours (ou commandez en invité avec votre nom et WhatsApp). Nous vous contactons pour le paiement, puis l’accès s’ouvre dans votre espace élève.",
        ar: "اطلب الوصول من صفحة الدورة (أو اطلب كزائر باسمك وواتساب). نتواصل معك لإتمام الدفع ثم يُفتح الوصول في مساحتك.",
      } satisfies L10n,
    },
    {
      q: { fr: "Quels moyens de paiement ?", ar: "ما وسائل الدفع؟" } satisfies L10n,
      a: {
        fr: "Le paiement se fait hors plateforme (WhatsApp, virement, espèces). Dès confirmation, l’équipe active votre accès.",
        ar: "الدفع خارج المنصة (واتساب أو تحويل أو نقداً). بعد التأكيد تفعّل الإدارة وصولك.",
      } satisfies L10n,
    },
  ],
};
