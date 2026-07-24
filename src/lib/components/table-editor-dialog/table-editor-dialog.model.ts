/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

/** Page orientation used by the Table Details visualization. */
export type PageOrientation = 'portrait' | 'landscape';
/** Selection shape used to hide range-only controls for a single cell. */
export type SelectionMode = 'single' | 'range';
/** How border changes should be applied by the caller. */
export type TableEditorApplyMode = 'cell' | 'selection';

/** Border edges that can be selected in the Borders tab. */
export type BorderEdge =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'insideHorizontal'
  | 'insideVertical';

/** Metadata for rendering and labeling a clickable border edge. */
export interface BorderEdgeDefinition {
  edge: BorderEdge;
  label: string;
  className: string;
  vertical: boolean;
  inner: boolean;
}

/** Line styles supported by the border controls. */
export type BorderLineStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'none';

/** Loose numeric values accepted by normalization helpers. */
export type NumericInputValue = string | number | null | undefined;
/** Numeric form values after nullish inputs have been defaulted. */
export type NumericFormValue = string | number;

/** Font option displayed by the typography font select. */
export interface FontOption {
  label: string;
  value: string;
}

/** Printable page size in pixels. */
export interface PageSize {
  width: number;
  height: number;
}

/** Printable page limits by orientation. */
export interface TablePageLimits {
  portrait: PageSize;
  landscape: PageSize;
}

/** Border style applied to selected edges. */
export interface BorderStyle {
  style: BorderLineStyle;
  width: string;
  color: string;
}

/** Border tab state returned from Apply. */
export interface BorderConfig {
  targetEdges: BorderEdge[];
  border: BorderStyle;
  edgeStyles?: Partial<Record<BorderEdge, BorderStyle>>;
  applyMode: TableEditorApplyMode;
}

/** Typography and color state for selected table cells. */
export interface TypographyConfig {
  fontFamily: string;
  fontSize: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textColor: string;
  backgroundColor: string;
  letterSpacing: string;
  lineHeight: string;
  textAlign: '' | 'left' | 'center' | 'right' | 'justify';
  verticalAlign: '' | 'top' | 'middle' | 'bottom';
}

/** Cell padding state for selected table cells. */
export interface LayoutConfig {
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingLocked: boolean;
}

/** Readonly table measurements and page orientation shown in Table Details. */
export interface TableDetails {
  tableWidth: string;
  tableHeight: string;
  tableWidthPx?: number;
  tableHeightPx?: number;
  selectedCellWidth?: string;
  selectedCellHeight?: string;
  selectedCellWidthPx?: number;
  selectedCellHeightPx?: number;
  pageOrientation: PageOrientation;
}

/** Row and column counts used for selection and display rules. */
export interface TableMetadata {
  totalRows: number;
  totalColumns: number;
}

/** App-wide defaults that can be overridden with the table editor defaults token. */
export interface TableEditorDefaults {
  border?: Partial<BorderStyle>;
  typography?: Partial<TypographyConfig>;
  layout?: Partial<LayoutConfig>;
  table?: Partial<TableDetails>;
  metadata?: Partial<TableMetadata>;
  pageLimits?: TablePageLimitsInput;
  edgeDefinitions?: BorderEdgeDefinition[];
  fontSizeOptions?: number[];
  borderWidthOptions?: number[];
}

/** Form controls used for single selected-cell dimensions. */
export type SelectedCellDimensionControl =
  | 'selectedCellWidth'
  | 'selectedCellHeight';

/** Partial page limit overrides accepted by dialog data. */
export type TablePageLimitsInput = Partial<
  Record<PageOrientation, Partial<PageSize>>
>;

/** Partial border input accepted when opening the dialog. */
export type TableEditorBorderInput = Partial<
  Omit<BorderConfig, 'border' | 'edgeStyles'>
> & {
  border?: Partial<BorderStyle>;
  edgeStyles?: Partial<Record<BorderEdge, Partial<BorderStyle>>>;
};

/** Optional input data used to seed the table editor dialog. */
export interface TableEditorDialogData {
  table?: Partial<TableDetails>;
  borders?: TableEditorBorderInput;
  typography?: Partial<TypographyConfig>;
  layout?: Partial<LayoutConfig>;
  metadata?: Partial<TableMetadata>;
  selectionMode?: SelectionMode;
  fontOptions?: FontOption[];
  pageLimits?: TablePageLimitsInput;
}

/** Dirty controls included with Apply so callers only write intentional changes. */
export interface TableEditorChangedFields {
  table?: Partial<Record<keyof TableDetails, boolean>>;
  borders?: {
    targetEdges?: boolean;
    border?: Partial<Record<keyof BorderStyle, boolean>>;
    applyMode?: boolean;
    edgeStyles?: boolean;
  };
  typography?: Partial<Record<keyof TypographyConfig, boolean>>;
  layout?: Partial<Record<keyof LayoutConfig, boolean>>;
}

/** Fully normalized state returned when the user applies changes. */
export interface TableEditorResult {
  table: TableDetails;
  borders: BorderConfig;
  typography: TypographyConfig;
  layout: LayoutConfig;
  metadata: TableMetadata;
  selectionMode: SelectionMode;
  changed?: TableEditorChangedFields;
}

/** Form and signal state captured for Reset Settings. */
export interface TableEditorSnapshot<TFormValue> {
  formValue: TFormValue;
  activeEdges: BorderEdge[];
  edgeStyles: Record<BorderEdge, BorderStyle>;
  paddingLocked: boolean;
  customBorderWidth: string;
  selectedBorderWidth: number | null;
}
