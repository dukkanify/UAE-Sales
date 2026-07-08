export type CategoryFieldType =
  | "text"
  | "number"
  | "select"
  | "textarea"
  | "checkbox-group";

export type CategoryFieldOption = {
  label: string;
  value: string;
};

export type CategoryFieldDefinition = {
  key: string;
  label: string;
  type: CategoryFieldType;
  required?: boolean;
  placeholder?: string;
  options?: CategoryFieldOption[];
  /** Included in auto-generated listing title */
  titlePart?: boolean;
  /** Searchable in query matching */
  searchable?: boolean;
};

export type CategorySpecValue = string | number | boolean;

export type CategorySpecs = Record<string, CategorySpecValue>;
