/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import type {
  NumericFormValue,
  NumericInputValue,
} from './table-editor-dialog.model';

/** Parses a loose numeric value by ignoring units and labels. */
export function parseNumber(value: NumericInputValue): number {
  return Number.parseFloat(String(value ?? '').replaceAll(/[^0-9.-]/g, ''));
}

/** Converts a numeric form value to a non-negative whole-number string. */
export function normalizePaddingInput(value: NumericFormValue): string {
  return String(Math.max(0, Math.round(parseNumber(value) || 0)));
}

/** Keeps empty optional values empty, otherwise normalizes as padding. */
export function normalizeOptionalPaddingInput(
  value: NumericInputValue
): string {
  return String(value ?? '').trim() ? normalizePaddingInput(value ?? '') : '';
}

/** Converts a loose dimension value to a non-negative whole-number string. */
export function normalizeDimensionInput(value: NumericInputValue): string {
  const parsed = parseNumber(value);
  const dimension = Number.isFinite(parsed)
    ? Math.max(0, Math.round(parsed))
    : 0;

  return String(dimension);
}

/** Converts a loose count value to a non-negative whole number. */
export function normalizeCountInput(value: NumericInputValue): number {
  return Number(normalizeDimensionInput(value));
}

/** Converts a numeric form value to a non-negative measurement string. */
export function normalizeMeasureInput(value: NumericFormValue): string {
  return String(Math.max(0, parseNumber(value) || 0));
}

/** Keeps empty optional values empty, otherwise normalizes as a measurement. */
export function normalizeOptionalMeasureInput(
  value: NumericInputValue
): string {
  return String(value ?? '').trim() ? normalizeMeasureInput(value ?? '') : '';
}

/** Converts a numeric form value to a positive measurement string. */
export function normalizePositiveMeasureInput(
  value: NumericFormValue,
  fallback: string
): string {
  const parsed = parseNumber(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : fallback;
}

/** Keeps empty optional values empty, otherwise normalizes as positive. */
export function normalizeOptionalPositiveMeasureInput(
  value: NumericInputValue,
  fallback: string
): string {
  return String(value ?? '').trim()
    ? normalizePositiveMeasureInput(value ?? '', fallback)
    : '';
}

/** Converts a numeric form value to a pixel string. */
export function normalizePx(value: NumericFormValue): string {
  return `${normalizePaddingInput(value)}px`;
}

/** Keeps empty optional values empty, otherwise converts to a pixel string. */
export function normalizeOptionalPx(value: NumericInputValue): string {
  return String(value ?? '').trim() ? normalizePx(value ?? '') : '';
}

/** Converts supported hex colors into native color-input values. */
export function nativeColorValue(
  value: string | null | undefined,
  fallback = '#000000'
): string {
  const color = String(value ?? '').trim();
  const shortHex = /^#([0-9a-f]{3})$/i.exec(color);
  const rgbColor = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(
    color
  );

  if (shortHex) {
    return `#${shortHex[1]
      .split('')
      .map((character) => `${character}${character}`)
      .join('')}`.toLowerCase();
  }

  if (rgbColor) {
    return `#${rgbColor
      .slice(1, 4)
      .map((channel) =>
        Math.min(255, Number(channel)).toString(16).padStart(2, '0')
      )
      .join('')}`;
  }

  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
}
