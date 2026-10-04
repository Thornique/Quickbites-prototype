"use client";

import { CoffeeBrewBar } from "@/components/site/coffee/coffee-brew-bar";
import { CoffeeCategories } from "@/components/site/coffee/coffee-categories";
import { CoffeeHero } from "@/components/site/coffee/coffee-hero";
import { CoffeeSignatures } from "@/components/site/coffee/coffee-signatures";
import { useOutlet } from "@/features/outlet";
import { Bestsellers } from "./bestsellers";
import { CategoryRail } from "./category-rail";
import { ComboBand } from "./combo-band";
import { HeroCarousel } from "./hero-carousel";
import { HowItWorks } from "./how-it-works";
import { LocationBlock } from "./location-block";
import { Offers } from "./offers";
import { OutletChoice } from "./outlet-choice";
import { ReadyStrip } from "./ready-strip";
import { ReviewsPreview } from "./reviews-preview";
import { SocialGrid } from "./social-grid";

/**
 * The home page, per outlet.
 *
 * Two genuinely different pages rather than one page in two colours. The
 * restaurant leads with a rotating banner carousel, a photographic category
 * grid and a combo band — the shape of a quick-service menu. The coffee shop
 * leads with one still photograph, the drinks it is known for, and how an
 * order is built, which is how a specialty counter presents itself.
 *
 * The sections they share — offers, reviews, the social grid, the location
 * block — are the same components, re-skinned by the outlet's tokens.
 */
export function HomeSections() {
  const { outletId, isHydrated } = useOutlet();

  /*
    Before the stored choice is read the outlet is the restaurant, so render
    its page: it is the default and the larger of the two, and swapping a hero
    out from under someone is worse than a tick of delay. The chooser below
    handles a first-time visitor either way.
  */
  if (!isHydrated || outletId === "restaurant") {
    return (
      <>
        <OutletChoice />
        <HeroCarousel />
        <ReadyStrip />
        <CategoryRail />
        <Bestsellers />
        <Offers />
        <ComboBand />
        <HowItWorks />
        <ReviewsPreview />
        <SocialGrid />
        <LocationBlock />
      </>
    );
  }

  return (
    <>
      <OutletChoice />
      <CoffeeHero />
      <ReadyStrip />
      <CoffeeCategories />
      <CoffeeSignatures />
      <CoffeeBrewBar />
      <Offers />
      <ReviewsPreview />
      <SocialGrid />
      <LocationBlock />
    </>
  );
}
