/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, inject, viewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  FontOption,
  TableEditorDialogData,
  TableEditorResult,
  TablePageLimits,
} from './table-editor-dialog.model';
import { TableEditorComponent } from './table-editor.component';
import { TABLE_EDITOR_HELP } from './help/table-editor-help.data';
import { TableEditorHelpDialogComponent } from './help/table-editor-help-dialog.component';
import {
  TABLE_EDITOR_DEFAULTS,
  TABLE_EDITOR_FONT_OPTIONS,
} from './table-editor-dialog.token';
import { DEFAULT_PAGE_LIMITS } from './table-editor-dialog-defaults';

/**
 * Dialog wrapper for the reusable table editor.
 */
@Component({
  selector: 'licit-table-editor-dialog',
  templateUrl: './table-editor-dialog.component.html',
  styleUrl: './table-editor-dialog.component.scss',
  imports: [
    MatButtonModule,
    MatDialogClose,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    TableEditorComponent,
  ],
})
export class TableEditorDialogComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject<MatDialogRef<TableEditorDialogComponent>>(
    MatDialogRef,
    { optional: true }
  );
  private readonly tokenDefaults = inject(TABLE_EDITOR_DEFAULTS);
  private readonly tokenFontOptions = inject(TABLE_EDITOR_FONT_OPTIONS);

  private readonly editor = viewChild(TableEditorComponent);

  protected readonly data =
    inject<TableEditorDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  protected readonly fontOptions: FontOption[] = this.data.fontOptions?.length
    ? this.data.fontOptions
    : this.tokenFontOptions;

  protected readonly pageLimits: TablePageLimits = {
    portrait: {
      ...DEFAULT_PAGE_LIMITS.portrait,
      ...this.tokenDefaults.pageLimits?.portrait,
      ...this.data.pageLimits?.portrait,
    },
    landscape: {
      ...DEFAULT_PAGE_LIMITS.landscape,
      ...this.tokenDefaults.pageLimits?.landscape,
      ...this.data.pageLimits?.landscape,
    },
  };

  protected openHelp(): void {
    this.dialog.open(TableEditorHelpDialogComponent, {
      data: this.editor()?.activeHelpEntry() ?? TABLE_EDITOR_HELP[0],
      width: '520px',
      maxWidth: 'calc(100vw - 48px)',
    });
  }

  public resetSettings(): void {
    this.editor()?.resetSettings();
  }

  public onSubmit(): void {
    this.editor()?.onSubmit();
  }

  protected onApply(result: TableEditorResult): void {
    this.dialogRef?.close(result);
  }

  public onCancel(): void {
    this.dialogRef?.close();
  }
}
