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

/**
 * Converts a CSS padding value to a non-negative pixel number for the form.
 * Absolute source units are converted instead of merely having their suffix
 * removed (for example, 4pt is 5.3333px, not 4px).
 */
export function normalizePaddingInput(value: NumericFormValue): string {
  const measure = parseCssMeasure(value);
  const converted = measure
    ? absoluteMeasureInPx(measure) ?? measure.value
    : parseNumber(value);
  const padding = Number.isFinite(converted) ? Math.max(0, converted) : 0;
  return String(Math.round(padding * 10_000) / 10_000);
}

/** Keeps empty optional values empty, otherwise normalizes as padding. */
export function normalizeOptionalPaddingInput(
  value: NumericInputValue
): string {
  return String(value ?? '').trim() ? normalizePaddingInput(value ?? '') : '';
}

/** Preserves a positive decimal point size while removing units for form display. */
export function normalizeOptionalFontSizeInput(
  value: NumericInputValue
): string {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return '';
  }

  const measure = parseCssMeasure(rawValue);
  if (!measure || measure.value <= 0) {
    return '';
  }

  const absolutePixels = measure.unit ? absoluteMeasureInPx(measure) : null;
  const pointSize = measure.unit
    ? absolutePixels === null
      ? null
      : absolutePixels * (72 / 96)
    : measure.value;
  return pointSize === null || !Number.isFinite(pointSize)
    ? ''
    : formatMeasure(pointSize);
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

type ParsedCssMeasure = {
  value: number;
  unit: string;
};

function parseCssMeasure(value: NumericInputValue): ParsedCssMeasure | null {
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+))\s*([a-z%]*)$/i.exec(
    String(value ?? '').trim()
  );
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed)
    ? {value: parsed, unit: (match[2] ?? '').toLowerCase()}
    : null;
}

function absoluteMeasureInPx(measure: ParsedCssMeasure): number | null {
  const unitFactors: Record<string, number> = {
    px: 1,
    pt: 96 / 72,
    pc: 16,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    q: 96 / 101.6,
  };
  const factor = unitFactors[measure.unit];
  return factor === undefined ? null : measure.value * factor;
}

function formatMeasure(value: number): string {
  return String(Math.round(value * 10_000) / 10_000);
}

function fontSizeInPx(value: NumericInputValue): number | null {
  const measure = parseCssMeasure(value);
  if (!measure || measure.value <= 0) {
    return null;
  }

  // Unitless dialog font sizes are point values.
  return measure.unit
    ? absoluteMeasureInPx(measure)
    : measure.value * (96 / 72);
}

/**
 * Converts imported letter spacing to the pixel number used by the form.
 * Negative tracking and relative `em` values are preserved accurately.
 */
export function normalizeOptionalLetterSpacingInput(
  value: NumericInputValue,
  fontSize: NumericInputValue
): string {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return '';
  }
  if (rawValue.toLowerCase() === 'normal') {
    return '0';
  }

  const measure = parseCssMeasure(rawValue);
  if (!measure) {
    return '';
  }

  let pixels: number | null;
  if (!measure.unit || measure.unit === 'px') {
    pixels = measure.value;
  } else if (measure.unit === 'em') {
    const fontPixels = fontSizeInPx(fontSize);
    pixels = fontPixels === null ? null : measure.value * fontPixels;
  } else if (measure.unit === 'rem') {
    pixels = measure.value * 16;
  } else {
    pixels = absoluteMeasureInPx(measure);
  }

  return pixels === null || !Number.isFinite(pixels)
    ? ''
    : formatMeasure(pixels);
}

/**
 * Converts CSS line-height values to the unitless ratio used by the form.
 * Absolute values such as 14pt are divided by the effective font size, so
 * they cannot be misinterpreted by CSS as a multiplier of fourteen.
 */
export function normalizeOptionalLineHeightInput(
  lineHeight: NumericInputValue,
  fontSize: NumericInputValue,
  fallback: string
): string {
  const rawLineHeight = String(lineHeight ?? '').trim();
  if (!rawLineHeight) {
    return '';
  }
  if (rawLineHeight.toLowerCase() === 'normal') {
    return fallback;
  }

  const lineMeasure = parseCssMeasure(rawLineHeight);
  if (!lineMeasure || lineMeasure.value <= 0) {
    return fallback;
  }

  let ratio: number | null = null;
  if (!lineMeasure.unit) {
    ratio = lineMeasure.value;
  } else if (lineMeasure.unit === '%') {
    ratio = lineMeasure.value / 100;
  } else if (lineMeasure.unit === 'em') {
    ratio = lineMeasure.value;
  } else {
    const fontMeasure = parseCssMeasure(fontSize);
    const lineHeightPx = absoluteMeasureInPx(lineMeasure);
    const fontSizePx = fontMeasure ? absoluteMeasureInPx(fontMeasure) : null;
    if (lineHeightPx !== null && fontSizePx !== null && fontSizePx > 0) {
      ratio = lineHeightPx / fontSizePx;
    }
  }

  if (ratio === null || !Number.isFinite(ratio) || ratio <= 0) {
    return fallback;
  }
  return String(Math.round(ratio * 10_000) / 10_000);
}

/** Converts a numeric form value to a pixel string. */
export function normalizePx(value: NumericFormValue): string {
  return `${Math.max(0, Math.round(parseNumber(value) || 0))}px`;
}

/** Converts a padding form value to pixels without losing decimals. */
export function normalizePaddingPx(value: NumericFormValue): string {
  return `${normalizePaddingInput(value)}px`;
}

/** Keeps empty optional values empty, otherwise converts to a pixel string. */
export function normalizeOptionalPx(value: NumericInputValue): string {
  return String(value ?? '').trim() ? normalizePx(value ?? '') : '';
}

/** Preserves signed decimal letter spacing and returns pixel units. */
export function normalizeOptionalLetterSpacingPx(
  value: NumericInputValue
): string {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return '';
  }
  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? `${formatMeasure(parsed)}px` : '';
}

/** Preserves a positive decimal font size and returns the editor's point unit. */
export function normalizeOptionalPt(value: NumericInputValue): string {
  const normalized = normalizeOptionalFontSizeInput(value);
  return normalized ? `${normalized}pt` : '';
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
