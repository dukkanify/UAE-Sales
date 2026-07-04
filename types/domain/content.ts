export type ContentIconName =
  | "shield"
  | "wallet"
  | "check"
  | "message"
  | "star"
  | "chart"
  | "package"
  | "home";

export type HomeStat = {
  icon?: ContentIconName;
  label: string;
  value: string;
};

export type HomeTestimonial = {
  city: string;
  name: string;
  quote: string;
  role: string;
};

export type HomeReason = {
  description: string;
  icon: ContentIconName;
  title: string;
};

export type HomeStep = {
  description: string;
  title: string;
};

export type HomeEscrowStep = {
  description: string;
  icon: ContentIconName;
  title: string;
};

export type HomeTrustPoint = {
  icon: ContentIconName;
  label: string;
};

export type HomeCityHighlight = {
  cityId: string;
  listingCount: number;
};
