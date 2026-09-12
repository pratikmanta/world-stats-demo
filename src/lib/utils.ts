import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export function formatCurrency(
  value: number | null | undefined,
  currency = "USD"
) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDecimal(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return value.toFixed(1);
}

export function resolveCountryIso(input: string): string | null {
  const value = input?.trim();

  if (!value) return null;

  // Already an ISO-2 code: "ES", "HR", "IN"
  if (/^[A-Za-z]{2}$/.test(value)) {
    const iso2 = value.toUpperCase();

    if (countries.isValid(iso2)) {
      return iso2;
    }
  }

  // Country name: "Spain", "spain", "Croatia", etc.
  const iso2 = countries.getAlpha2Code(value, "en");

  return iso2?.toUpperCase() ?? null;
}