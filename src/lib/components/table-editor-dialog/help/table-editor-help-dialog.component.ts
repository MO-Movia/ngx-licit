/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, inject, input } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TableEditorHelpComponent } from './table-editor-help.component';
import {
  TABLE_EDITOR_HELP,
  TableEditorHelpEntry,
} from './table-editor-help.data';

/**
 * Dialog used to display contextual help for the active table editor tab.
 */
@Component({
  selector: 'licit-table-editor-help-dialog',
  templateUrl: './table-editor-help-dialog.component.html',
  styleUrl: './table-editor-help-dialog.component.scss',
  imports: [
    MatButtonModule,
    MatDialogClose,
    MatDialogModule,
    MatIconModule,
    TableEditorHelpComponent,
  ],
})
export class TableEditorHelpDialogComponent {
  private readonly dialogHelp = inject<TableEditorHelpEntry>(MAT_DIALOG_DATA, {
    optional: true,
  });

  /** Help entry supplied by the parent table editor dialog. */
  protected readonly help = input<TableEditorHelpEntry>(
    this.dialogHelp ?? TABLE_EDITOR_HELP[0]
  );
}
