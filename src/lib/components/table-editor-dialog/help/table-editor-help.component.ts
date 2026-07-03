/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, input } from '@angular/core';

import {
  TABLE_EDITOR_HELP,
  TableEditorHelpEntry,
} from './table-editor-help.data';

/**
 * Reusable contextual help content for the table editor.
 */
@Component({
  selector: 'licit-table-editor-help',
  templateUrl: './table-editor-help.component.html',
  styleUrl: './table-editor-help.component.scss',
})
export class TableEditorHelpComponent {
  /** Help entry supplied by the parent table editor. */
  public readonly help = input<TableEditorHelpEntry>(TABLE_EDITOR_HELP[0]);
}
