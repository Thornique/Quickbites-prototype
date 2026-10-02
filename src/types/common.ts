/** Text that must exist in both site languages. */
export interface LocalizedText {
  en: string;
  hi: string;
}

/** ISO-8601 timestamp string. Stored as a string so it survives JSON round-trips. */
export type IsoDateTime = string;

/** ISO date without a time component, e.g. "2026-10-02". */
export type IsoDate = string;

/** Clock time in 24-hour "HH:mm" form, e.g. "19:30". */
export type ClockTime = string;

/** Every stored record carries a creation timestamp. */
export interface Timestamped {
  createdAt: IsoDateTime;
  updatedAt?: IsoDateTime;
}

/** Shape used by list helpers that support simple paging in the admin tables. */
export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}
