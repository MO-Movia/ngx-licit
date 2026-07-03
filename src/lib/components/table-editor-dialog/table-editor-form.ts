/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { FormBuilder } from '@angular/forms';

import type {
  BorderConfig,
  BorderLineStyle,
  PageOrientation,
  TypographyConfig,
} from './table-editor-dialog.model';
import type { ResolvedTableEditorDefaults } from './table-editor-domain';

/** Creates the reactive form used by all table editor tabs. */
export function createTableEditorForm(
  fb: FormBuilder,
  editorDefaults: ResolvedTableEditorDefaults
) {
  return fb.group({
    table: fb.group({
      tableWidth: fb.nonNullable.control(editorDefaults.table.tableWidth),
      tableHeight: fb.nonNullable.control(editorDefaults.table.tableHeight),
      tableWidthPx: fb.control<number | null>(null),
      tableHeightPx: fb.control<number | null>(null),
      selectedCellWidth: fb.nonNullable.control(
        editorDefaults.table.selectedCellWidth
      ),
      selectedCellHeight: fb.nonNullable.control(
        editorDefaults.table.selectedCellHeight
      ),
      selectedCellWidthPx: fb.control<number | null>(null),
      selectedCellHeightPx: fb.control<number | null>(null),
      pageOrientation: fb.nonNullable.control<PageOrientation>(
        editorDefaults.table.pageOrientation
      ),
    }),
    borders: fb.nonNullable.group({
      border: fb.nonNullable.group({
        style: fb.nonNullable.control<BorderLineStyle>(
          editorDefaults.border.style
        ),
        width: editorDefaults.border.width,
        color: editorDefaults.border.color,
      }),
      applyMode: fb.nonNullable.control<BorderConfig['applyMode']>('selection'),
    }),
    typography: fb.nonNullable.group({
      fontFamily: editorDefaults.typography.fontFamily,
      fontSize: editorDefaults.typography.fontSize,
      bold: editorDefaults.typography.bold,
      italic: editorDefaults.typography.italic,
      underline: editorDefaults.typography.underline,
      textColor: editorDefaults.typography.textColor,
      backgroundColor: editorDefaults.typography.backgroundColor,
      letterSpacing: editorDefaults.typography.letterSpacing,
      lineHeight: editorDefaults.typography.lineHeight,
      textAlign: fb.nonNullable.control<TypographyConfig['textAlign']>(
        editorDefaults.typography.textAlign
      ),
      verticalAlign: fb.nonNullable.control<TypographyConfig['verticalAlign']>(
        editorDefaults.typography.verticalAlign
      ),
    }),
    layout: fb.nonNullable.group({
      paddingTop: editorDefaults.layout.paddingTop,
      paddingRight: editorDefaults.layout.paddingRight,
      paddingBottom: editorDefaults.layout.paddingBottom,
      paddingLeft: editorDefaults.layout.paddingLeft,
      paddingLocked: editorDefaults.layout.paddingLocked,
    }),
    metadata: fb.nonNullable.group({
      totalRows: editorDefaults.metadata.totalRows,
      totalColumns: editorDefaults.metadata.totalColumns,
    }),
  });
}

export type TableEditorForm = ReturnType<typeof createTableEditorForm>;
