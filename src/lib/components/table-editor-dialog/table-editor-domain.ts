/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import {
  DEFAULT_BORDER,
  DEFAULT_BORDER_WIDTH_OPTIONS,
  DEFAULT_FONT_SIZE_OPTIONS,
  DEFAULT_LAYOUT,
  DEFAULT_METADATA,
  DEFAULT_PAGE_LIMITS,
  DEFAULT_TABLE,
  DEFAULT_TYPOGRAPHY,
  EDGE_DEFINITIONS,
} from './table-editor-dialog-defaults';
import type {
  BorderEdge,
  BorderEdgeDefinition,
  BorderStyle,
  LayoutConfig,
  PageOrientation,
  SelectionMode,
  TableDetails,
  TableEditorDefaults,
  TableMetadata,
  TablePageLimits,
  TypographyConfig,
} from './table-editor-dialog.model';
import {
  normalizeCountInput,
  normalizeDimensionInput,
  normalizeOptionalLetterSpacingInput,
  normalizeOptionalLetterSpacingPx,
  normalizeOptionalFontSizeInput,
  normalizeOptionalLineHeightInput,
  normalizeOptionalPt,
  normalizePaddingInput,
  normalizePaddingPx,
  normalizePx,
  parseNumber,
} from './table-editor-normalizers';

export interface ResolvedTableEditorDefaults {
  border: BorderStyle;
  typography: TypographyConfig;
  layout: LayoutConfig;
  table: TableDetails;
  metadata: TableMetadata;
  pageLimits: TablePageLimits;
  edgeDefinitions: BorderEdgeDefinition[];
  fontSizeOptions: number[];
  borderWidthOptions: number[];
}

/** Resolves token-provided defaults against built-in table editor values. */
export function resolveTableEditorDefaults(
  defaults: TableEditorDefaults
): ResolvedTableEditorDefaults {
  return {
    border: { ...DEFAULT_BORDER, ...defaults.border },
    typography: { ...DEFAULT_TYPOGRAPHY, ...defaults.typography },
    layout: { ...DEFAULT_LAYOUT, ...defaults.layout },
    table: { ...DEFAULT_TABLE, ...defaults.table },
    metadata: { ...DEFAULT_METADATA, ...defaults.metadata },
    pageLimits: {
      portrait: {
        ...DEFAULT_PAGE_LIMITS.portrait,
        ...defaults.pageLimits?.portrait,
      },
      landscape: {
        ...DEFAULT_PAGE_LIMITS.landscape,
        ...defaults.pageLimits?.landscape,
      },
    },
    edgeDefinitions: defaults.edgeDefinitions?.length
      ? defaults.edgeDefinitions
      : EDGE_DEFINITIONS,
    fontSizeOptions: defaults.fontSizeOptions?.length
      ? defaults.fontSizeOptions
      : DEFAULT_FONT_SIZE_OPTIONS,
    borderWidthOptions: defaults.borderWidthOptions?.length
      ? defaults.borderWidthOptions
      : DEFAULT_BORDER_WIDTH_OPTIONS,
  };
}

/** Normalizes border controls with default values applied. */
export function normalizeBorderStyle(
  defaults: BorderStyle,
  value: Partial<BorderStyle>
): BorderStyle {
  return { ...defaults, ...value };
}

/** Converts layout values to number-only strings for form display. */
export function normalizeLayoutForForm(layout: LayoutConfig): LayoutConfig {
  return {
    ...layout,
    paddingTop: normalizePaddingInput(layout.paddingTop),
    paddingRight: normalizePaddingInput(layout.paddingRight),
    paddingBottom: normalizePaddingInput(layout.paddingBottom),
    paddingLeft: normalizePaddingInput(layout.paddingLeft),
  };
}

/** Restores pixel units to layout values for the Apply result. */
export function normalizeLayoutForResult(
  layout: LayoutConfig,
  paddingLocked: boolean
): LayoutConfig {
  return {
    ...layout,
    paddingLocked,
    paddingTop: normalizePaddingPx(layout.paddingTop),
    paddingRight: normalizePaddingPx(layout.paddingRight),
    paddingBottom: normalizePaddingPx(layout.paddingBottom),
    paddingLeft: normalizePaddingPx(layout.paddingLeft),
  };
}

/** Converts typography measurements to number-only strings for form display. */
export function normalizeTypographyForForm(
  typography: TypographyConfig
): TypographyConfig {
  return {
    ...typography,
    fontSize: normalizeOptionalFontSizeInput(typography.fontSize),
    letterSpacing: normalizeOptionalLetterSpacingInput(
      typography.letterSpacing,
      typography.fontSize
    ),
    lineHeight: normalizeOptionalLineHeightInput(
      typography.lineHeight,
      typography.fontSize,
      DEFAULT_TYPOGRAPHY.lineHeight
    ),
  };
}

/** Restores normalized typography units for the Apply result. */
export function normalizeTypographyForResult(
  typography: TypographyConfig
): TypographyConfig {
  return {
    ...typography,
    fontSize: normalizeOptionalPt(typography.fontSize),
    letterSpacing: normalizeOptionalLetterSpacingPx(
      typography.letterSpacing
    ),
    lineHeight: normalizeOptionalLineHeightInput(
      typography.lineHeight,
      typography.fontSize,
      DEFAULT_TYPOGRAPHY.lineHeight
    ),
  };
}

/** Normalizes table dimensions for readonly Table Details fields. */
export function normalizeTableForForm(
  value: Partial<TableDetails>,
  defaults: TableDetails
): TableDetails {
  const tableWidth = normalizeDimensionInput(
    value.tableWidthPx ?? value.tableWidth ?? defaults.tableWidth
  );
  const tableHeight = normalizeDimensionInput(
    value.tableHeightPx ?? value.tableHeight ?? defaults.tableHeight
  );
  const selectedCellWidth = normalizeDimensionInput(
    value.selectedCellWidthPx ??
      value.selectedCellWidth ??
      defaults.selectedCellWidth
  );
  const selectedCellHeight = normalizeDimensionInput(
    value.selectedCellHeightPx ??
      value.selectedCellHeight ??
      defaults.selectedCellHeight
  );

  return {
    ...defaults,
    ...value,
    tableWidth,
    tableHeight,
    tableWidthPx: Number(tableWidth),
    tableHeightPx: Number(tableHeight),
    selectedCellWidth,
    selectedCellHeight,
    selectedCellWidthPx: Number(selectedCellWidth),
    selectedCellHeightPx: Number(selectedCellHeight),
    pageOrientation: value.pageOrientation || defaults.pageOrientation,
  };
}

/** Restores pixel units to table dimension strings for the Apply result. */
export function normalizeTableForResult(
  value: Partial<TableDetails>,
  defaults: TableDetails
): TableDetails {
  const table = normalizeTableForForm(value, defaults);

  return {
    ...table,
    tableWidth: normalizePx(table.tableWidth),
    tableHeight: normalizePx(table.tableHeight),
    selectedCellWidth: normalizePx(table.selectedCellWidth ?? '0'),
    selectedCellHeight: normalizePx(table.selectedCellHeight ?? '0'),
  };
}

/** Normalizes metadata counts to non-negative integers. */
export function normalizeMetadata(
  value: Partial<TableMetadata>,
  defaults: TableMetadata
): TableMetadata {
  return {
    totalRows: normalizeCountInput(value.totalRows ?? defaults.totalRows),
    totalColumns: normalizeCountInput(
      value.totalColumns ?? defaults.totalColumns
    ),
  };
}

/** Builds the starting border style map for every edge. */
export function createDefaultEdgeStyles(
  borderEdges: BorderEdgeDefinition[],
  border: BorderStyle,
  edgeStyles?: Partial<Record<BorderEdge, Partial<BorderStyle>>>
): Record<BorderEdge, BorderStyle> {
  return borderEdges.reduce(
    (result, definition) => ({
      ...result,
      [definition.edge]: {
        ...border,
        ...edgeStyles?.[definition.edge],
      },
    }),
    {} as Record<BorderEdge, BorderStyle>
  );
}

/** Infers single-cell or range behavior from metadata. */
export function getSelectionMode(metadata: TableMetadata): SelectionMode {
  return metadata.totalRows > 1 || metadata.totalColumns > 1
    ? 'range'
    : 'single';
}

/** Checks whether an edge is only available for range selections. */
export function isInnerEdge(edge: BorderEdge): boolean {
  return edge === 'insideHorizontal' || edge === 'insideVertical';
}

/** Converts table-cell vertical alignment to flex alignment. */
export function verticalAlignToFlex(
  value: TypographyConfig['verticalAlign']
): string {
  return {
    '': '',
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
  }[value];
}

/** Checks whether a finite value exceeds its limit. */
export function hasOverflow(value: number, limit: number): boolean {
  return Number.isFinite(value) && value > limit;
}

/** Gets a numeric table dimension from the numeric companion or string value. */
export function getTableDimension(
  value: number | null | undefined,
  fallback: string
): number {
  return value ?? parseNumber(fallback);
}

export type TableEditorPageOrientation = PageOrientation;
