/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import type {
  BorderEdgeDefinition,
  BorderStyle,
  LayoutConfig,
  TableDetails,
  TableEditorDefaults,
  TableMetadata,
  TablePageLimits,
  TypographyConfig,
} from './table-editor-dialog.model';

/** Default border style applied when dialog data does not provide one. */
export const DEFAULT_BORDER: BorderStyle = {
  style: 'solid',
  width: '1px',
  color: '#555555',
};

/** Default typography and color values used to seed the editor form. */
export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  fontFamily: 'inherit',
  fontSize: '14px',
  bold: false,
  italic: false,
  underline: false,
  textColor: '#000000',
  backgroundColor: 'transparent',
  letterSpacing: '0px',
  lineHeight: '1.15',
  textAlign: 'left',
  verticalAlign: 'middle',
};

/** Default cell padding values used when no layout data is supplied. */
export const DEFAULT_LAYOUT: LayoutConfig = {
  paddingTop: '4px',
  paddingRight: '4px',
  paddingBottom: '4px',
  paddingLeft: '4px',
  paddingLocked: true,
};

/** Default readonly table detail values shown before caller measurements arrive. */
export const DEFAULT_TABLE: TableDetails = {
  tableWidth: '--',
  tableHeight: '--',
  selectedCellWidth: '--',
  selectedCellHeight: '--',
  pageOrientation: 'portrait',
};

/** Default row and column metadata for single-cell editor behavior. */
export const DEFAULT_METADATA: TableMetadata = {
  totalRows: 0,
  totalColumns: 0,
};

/** Default printable page bounds used by the Table Details visualization. */
export const DEFAULT_PAGE_LIMITS: TablePageLimits = {
  portrait: { width: 672, height: 864 },
  landscape: { width: 912, height: 624 },
};

/** Default font-size options shown in the Typography tab. */
export const DEFAULT_FONT_SIZE_OPTIONS = [
  6, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 30, 36, 42, 48, 60, 72, 90,
];

/** Default border-width options shown in the Borders tab. */
export const DEFAULT_BORDER_WIDTH_OPTIONS = [1, 2, 3];

/** Border edge metadata used by the clickable border map. */
export const EDGE_DEFINITIONS: BorderEdgeDefinition[] = [
  {
    edge: 'top',
    label: 'Top Exterior',
    className: 'line-top',
    vertical: false,
    inner: false,
  },
  {
    edge: 'bottom',
    label: 'Bottom Exterior',
    className: 'line-bottom',
    vertical: false,
    inner: false,
  },
  {
    edge: 'left',
    label: 'Left Exterior',
    className: 'line-left',
    vertical: true,
    inner: false,
  },
  {
    edge: 'right',
    label: 'Right Exterior',
    className: 'line-right',
    vertical: true,
    inner: false,
  },
  {
    edge: 'insideHorizontal',
    label: 'Internal Horizontal',
    className: 'line-inner-h',
    vertical: false,
    inner: true,
  },
  {
    edge: 'insideVertical',
    label: 'Internal Vertical',
    className: 'line-inner-v',
    vertical: true,
    inner: true,
  },
];

/** Built-in defaults used by the table editor defaults injection token. */
export const DEFAULT_TABLE_EDITOR_DEFAULTS: TableEditorDefaults = {
  border: DEFAULT_BORDER,
  typography: DEFAULT_TYPOGRAPHY,
  layout: DEFAULT_LAYOUT,
  table: DEFAULT_TABLE,
  metadata: DEFAULT_METADATA,
  pageLimits: DEFAULT_PAGE_LIMITS,
  edgeDefinitions: EDGE_DEFINITIONS,
  fontSizeOptions: DEFAULT_FONT_SIZE_OPTIONS,
  borderWidthOptions: DEFAULT_BORDER_WIDTH_OPTIONS,
};
