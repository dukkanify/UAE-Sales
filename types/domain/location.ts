export type City = {
  id: string;
  name: string;
};

export type Country = {
  id: string;
  name: string;
};

export type LocationRecord = {
  id: string;
  name: string;
  emirate?: string;
  enabled: boolean;
  sortOrder: number;
};

export type LocationCreateInput = {
  name: string;
  emirate?: string;
  enabled?: boolean;
  sortOrder?: number;
};

export type LocationPatch = Partial<
  Pick<LocationRecord, "name" | "emirate" | "enabled" | "sortOrder">
>;
