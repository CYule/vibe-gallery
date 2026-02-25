export const MonetizationStatus = {
  NOT_MONETIZED: "NOT_MONETIZED",
  TRYING: "TRYING",
  MONETIZED_SELF_REPORTED: "MONETIZED_SELF_REPORTED",
  VERIFIED: "VERIFIED",
} as const;

export type MonetizationStatus = (typeof MonetizationStatus)[keyof typeof MonetizationStatus];
