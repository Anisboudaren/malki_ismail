import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";
import CategoryStrip from "../components/CategoryStrip";
import CourseSpotlight from "../components/CourseSpotlight";
import Hero from "../components/Hero";
import MarketplaceTeaser from "../components/MarketplaceTeaser";
import Pricing from "../components/Pricing";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import ValueProps from "../components/ValueProps";

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();

  return (
    <main>
      <Hero />
      {/*
        Nav watches this to decide when to go solid. It has to live out here
        rather than inside Hero: Hero swaps ScrubHero for StaticHero after
        mount, which would detach an observer bound to a node inside it.
      */}
      <div id="hero-end" aria-hidden className="h-px w-full" />
      <CategoryStrip />
      <Stats />
      <CourseSpotlight />
      <ValueProps />
      <Testimonials />
      <MarketplaceTeaser />
      <Pricing />
    </main>
  );
}
