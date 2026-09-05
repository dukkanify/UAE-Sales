export type CategoryFieldType =
  | "text"
  | "number"
  | "select"
  | "combobox"
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
  /** Helper note shown under the field */
  note?: string;
  /** Included in auto-generated listing title */
  titlePart?: boolean;
  /** Searchable in query matching */
  searchable?: boolean;
  /** Show field only when another spec matches one of the values */
  showWhen?: { key: string; values: string[] };
};

export type CategorySpecValue = string | number | boolean;

export type CategorySpecs = Record<string, CategorySpecValue>;
