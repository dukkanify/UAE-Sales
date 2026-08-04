/**
 * Default aviation media library categories (Task 026).
 * Append entries here — no code path changes required for new categories.
 */

import type { MediaLibraryCategory } from "@/types/media-library";

export const DEFAULT_MEDIA_LIBRARY_CATEGORIES: MediaLibraryCategory[] = [
  {
    id: "commercial_passenger_aircraft",
    label: "Commercial Passenger Aircraft",
    description: "Airliners and commercial fleet imagery",
    sortOrder: 10,
  },
  {
    id: "cessna_172s",
    label: "Cessna 172S (C172S)",
    description: "C172S training aircraft",
    sortOrder: 20,
  },
  {
    id: "airport_images",
    label: "Airport Images",
    description: "Airports, runways, and terminals",
    sortOrder: 30,
  },
  {
    id: "cockpit_images",
    label: "Cockpit Images",
    description: "Flight decks and instruments",
    sortOrder: 40,
  },
  {
    id: "flight_training",
    label: "Flight Training",
    description: "Training scenes and maneuvers",
    sortOrder: 50,
  },
  {
    id: "atpl_training",
    label: "ATPL Training",
    description: "ATPL theory and exam context",
    sortOrder: 60,
  },
  {
    id: "pilot_lifestyle",
    label: "Pilot Lifestyle",
    description: "Lifestyle and career imagery",
    sortOrder: 70,
  },
  {
    id: "aviation_icons",
    label: "Aviation Icons",
    description: "Icons and pictograms",
    sortOrder: 80,
  },
  {
    id: "background_images",
    label: "Background Images",
    description: "Hero and page backgrounds",
    sortOrder: 90,
  },
  {
    id: "illustrations",
    label: "Illustrations",
    description: "Illustrated aviation artwork",
    sortOrder: 100,
  },
];

export const MEDIA_ASSET_KINDS = [
  "logo",
  "icon",
  "background",
  "document",
  "certificate",
  "marketing",
  "email",
  "media",
  "other",
] as const;
