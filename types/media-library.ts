/**
 * Aviation media library types.
 * Categories are data-driven — add new keys in constants without schema rewrites.
 */

export type MediaLibraryCategoryId =
  | "commercial_passenger_aircraft"
  | "cessna_172s"
  | "airport_images"
  | "cockpit_images"
  | "flight_training"
  | "atpl_training"
  | "pilot_lifestyle"
  | "aviation_icons"
  | "background_images"
  | "illustrations"
  | (string & {});

export type MediaAssetKind =
  | "logo"
  | "icon"
  | "background"
  | "document"
  | "certificate"
  | "marketing"
  | "email"
  | "media"
  | "other";

export interface MediaLibraryAsset {
  id: string;
  title: string;
  description: string;
  categoryId: MediaLibraryCategoryId;
  kind: MediaAssetKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  altText: string;
  seoTitle: string;
  seoDescription: string;
  width: number | null;
  height: number | null;
  tags: string[];
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaLibraryCategory {
  id: MediaLibraryCategoryId;
  label: string;
  description: string;
  sortOrder: number;
}

export interface MediaLibraryDatabase {
  categories: MediaLibraryCategory[];
  assets: MediaLibraryAsset[];
  seeded: boolean;
}
