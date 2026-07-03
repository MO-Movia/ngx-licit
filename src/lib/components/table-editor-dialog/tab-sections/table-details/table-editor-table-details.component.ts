/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, Signal, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import type {
  SelectedCellDimensionControl,
  SelectionMode,
  TableDetails,
  TablePageLimits,
} from '../../table-editor-dialog.model';
import type { TableEditorForm } from '../../table-editor-form';
import { getTableDimension, hasOverflow } from '../../table-editor-domain';

/**
 * Table editor table details and page-fit visualization.
 */
@Component({
  selector: 'licit-table-editor-table-details',
  templateUrl: './table-editor-table-details.component.html',
  styleUrl: './table-editor-table-details.component.scss',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
})
export class TableEditorTableDetailsComponent {
  public readonly form = input.required<TableEditorForm>();
  public readonly selectionMode = input.required<Signal<SelectionMode>>();
  public readonly tableValue = input.required<Signal<TableDetails>>();
  public readonly pageLimits = input.required<TablePageLimits>();

  public readonly isSingleSelection = computed(
    () => this.selectionMode()() === 'single'
  );

  public readonly activePageLimit = computed(() => {
    return this.pageLimits()[this.tableValue()().pageOrientation];
  });

  public readonly tableWidthOverflow = computed(() => {
    const table = this.tableValue()();
    const width = getTableDimension(table.tableWidthPx, table.tableWidth);
    return hasOverflow(width, this.activePageLimit().width);
  });

  public readonly tableHeightOverflow = computed(() => {
    const table = this.tableValue()();
    const height = getTableDimension(table.tableHeightPx, table.tableHeight);
    return hasOverflow(height, this.activePageLimit().height);
  });

  public readonly visualizationStyle = computed(() => {
    const page = this.activePageLimit();
    const scale = 190 / Math.max(page.width, page.height);

    return {
      width: `${page.width * scale}px`,
      height: `${page.height * scale}px`,
    };
  });

  public readonly visualizationTableStyle = computed(() => {
    const table = this.tableValue()();
    const page = this.activePageLimit();
    const scale = 190 / Math.max(page.width, page.height);
    const width = getTableDimension(table.tableWidthPx, table.tableWidth);
    const height = getTableDimension(table.tableHeightPx, table.tableHeight);

    return {
      width: `${Math.max(width || 0, 8) * scale}px`,
      height: `${Math.max(height || 0, 8) * scale}px`,
      'border-right': hasOverflow(width, page.width)
        ? '3px solid #ff4a4a'
        : '1px solid rgba(74, 144, 226, 0.4)',
      'border-bottom': hasOverflow(height, page.height)
        ? '3px solid #ff4a4a'
        : '1px solid rgba(74, 144, 226, 0.4)',
    };
  });

  public selectedCellDimensionValue(
    control: SelectedCellDimensionControl
  ): string {
    return this.isSingleSelection()
      ? this.form().controls.table.controls[control].value!
      : '';
  }
}
