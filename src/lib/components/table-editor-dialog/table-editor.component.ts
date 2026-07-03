/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type {
  BorderEdge,
  BorderStyle,
  FontOption,
  LayoutConfig,
  TableDetails,
  TableEditorDialogData,
  TableEditorResult,
  TableEditorSnapshot,
  TableMetadata,
  TablePageLimits,
  TypographyConfig,
} from './table-editor-dialog.model';
import {
  TABLE_EDITOR_HELP,
  TableEditorHelpEntry,
} from './help/table-editor-help.data';
import {
  TABLE_EDITOR_DEFAULTS,
  TABLE_EDITOR_FONT_OPTIONS,
} from './table-editor-dialog.token';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  createDefaultEdgeStyles,
  getSelectionMode,
  isInnerEdge,
  normalizeBorderStyle,
  normalizeLayoutForForm,
  normalizeLayoutForResult,
  normalizeMetadata,
  normalizeTableForForm,
  normalizeTableForResult,
  normalizeTypographyForForm,
  normalizeTypographyForResult,
  resolveTableEditorDefaults,
} from './table-editor-domain';
import { TableEditorForm, createTableEditorForm } from './table-editor-form';
import { parseNumber } from './table-editor-normalizers';
import { TableEditorBordersComponent } from './tab-sections/borders/table-editor-borders.component';
import { TableEditorTypographyComponent } from './tab-sections/typography/table-editor-typography.component';
import { TableEditorTableDetailsComponent } from './tab-sections/table-details/table-editor-table-details.component';

/**
 * Reusable editor for table borders, typography, padding, and table details.
 */
@Component({
  selector: 'licit-table-editor',
  templateUrl: './table-editor.component.html',
  styleUrl: './table-editor.component.scss',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatTooltipModule,
    TableEditorBordersComponent,
    TableEditorTypographyComponent,
    TableEditorTableDetailsComponent,
  ],
})
export class TableEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tokenDefaults = inject(TABLE_EDITOR_DEFAULTS);
  private readonly tokenFontOptions = inject(TABLE_EDITOR_FONT_OPTIONS);

  public readonly editorDefaults = resolveTableEditorDefaults(
    this.tokenDefaults
  );
  /** Optional input used to seed the editor form. */
  public readonly data = input<TableEditorDialogData>({});
  public readonly fontOptions = input<FontOption[]>(this.tokenFontOptions);
  /** Edges available to the Borders tab. */
  public readonly borderEdges = input(this.editorDefaults.edgeDefinitions);
  public readonly fontSizeOptions = input(this.editorDefaults.fontSizeOptions);
  public readonly borderWidthOptions = input(
    this.editorDefaults.borderWidthOptions
  );
  /** Printable page limits used by the Table Details visualization. */
  public readonly pageLimits = input<TablePageLimits>(
    this.editorDefaults.pageLimits
  );
  public readonly form = createTableEditorForm(this.fb, this.editorDefaults);
  /** Currently selected border edges. */
  public readonly activeEdges = signal<BorderEdge[]>([]);
  /** Per-edge border styles used by the border map preview and result. */
  public readonly edgeStyles = signal(
    createDefaultEdgeStyles(this.borderEdges(), this.editorDefaults.border)
  );
  public readonly customBorderWidthValue = signal('');
  public readonly selectedBorderWidthValue = signal<number | null>(1);
  public readonly paddingLocked = signal(
    this.editorDefaults.layout.paddingLocked
  );
  public readonly selectionMode = signal<'single' | 'range'>('single');
  public readonly activeTabIndex = signal(0);
  public readonly layoutValue = signal<LayoutConfig>(this.getLayoutValue());
  public readonly typographyValue = signal<TypographyConfig>(
    this.getTypographyValue()
  );
  public readonly tableValue = signal<TableDetails>(this.getTableValue());
  public readonly apply = output<TableEditorResult>();
  public readonly cancelRequested = output<void>();

  private initialSnapshot!: TableEditorSnapshot<
    ReturnType<TableEditorForm['getRawValue']>
  >;

  constructor() {
    this.form.controls.layout.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.refreshLayoutValue());

    this.form.controls.typography.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.refreshTypographyValue());

    this.form.controls.table.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.refreshTableValue());
  }

  public ngOnInit(): void {
    this.initializeState(this.data());
    this.initialSnapshot = this.captureSnapshot();
  }

  /** Emits the normalized {@link TableEditorResult}. */
  public onSubmit(): void {
    this.apply.emit(this.createResult());
  }

  /** Emits cancellation without returning a result. */
  public onCancel(): void {
    this.cancelRequested.emit();
  }

  /** Tracks the active tab so help opens with the matching content. */
  public setActiveTab(index: number): void {
    this.activeTabIndex.set(index);
  }

  /** Gets contextual help for the active tab. */
  public activeHelpEntry(): TableEditorHelpEntry {
    return TABLE_EDITOR_HELP[this.activeTabIndex()] ?? TABLE_EDITOR_HELP[0];
  }

  /** Restores the form and component signals to their initial dialog-data state. */
  public resetSettings(): void {
    this.restoreSnapshot(this.initialSnapshot);
  }

  private initializeState(data: TableEditorDialogData): void {
    const table = normalizeTableForForm(
      { ...this.editorDefaults.table, ...data.table },
      this.editorDefaults.table
    );
    const border = normalizeBorderStyle(
      this.editorDefaults.border,
      data.borders?.border ?? {}
    );
    const typography = normalizeTypographyForForm({
      ...this.editorDefaults.typography,
      ...data.typography,
    });
    const layout = normalizeLayoutForForm({
      ...this.editorDefaults.layout,
      ...data.layout,
    });
    const metadata = normalizeMetadata(
      { ...this.editorDefaults.metadata, ...data.metadata },
      this.editorDefaults.metadata
    );

    this.form.patchValue({
      table,
      borders: {
        border,
        applyMode: data.borders?.applyMode ?? 'selection',
      },
      typography,
      layout,
      metadata,
    });

    const selectionMode = data.selectionMode ?? getSelectionMode(metadata);
    const activeEdges = data.borders?.targetEdges ?? [];

    this.selectionMode.set(selectionMode);
    this.activeEdges.set(
      selectionMode === 'single'
        ? activeEdges.filter((edge) => !isInnerEdge(edge))
        : activeEdges
    );
    this.paddingLocked.set(layout.paddingLocked);
    this.edgeStyles.set(
      createDefaultEdgeStyles(
        this.borderEdges(),
        border,
        data.borders?.edgeStyles
      )
    );
    const initialBorderWidth = parseNumber(border.width);
    const initialPresetWidth = this.borderWidthOptions().includes(
      initialBorderWidth
    )
      ? initialBorderWidth
      : null;

    this.selectedBorderWidthValue.set(initialPresetWidth);
    this.customBorderWidthValue.set(
      initialPresetWidth ? '' : String(initialBorderWidth || '')
    );
    this.refreshFormValueSignals();
  }

  private createResult(): TableEditorResult {
    return {
      table: this.getTableValue(),
      borders: {
        targetEdges: this.activeEdges(),
        border: this.getCurrentBorderValue(),
        edgeStyles: this.edgeStyles(),
        applyMode: this.form.controls.borders.controls.applyMode.value,
      },
      typography: this.getTypographyValue(),
      layout: this.getLayoutValue(),
      metadata: this.getMetadataValue(),
      selectionMode: this.selectionMode(),
    };
  }

  private refreshFormValueSignals(): void {
    this.refreshLayoutValue();
    this.refreshTypographyValue();
    this.refreshTableValue();
  }

  private refreshLayoutValue(): void {
    this.layoutValue.set(this.getLayoutValue());
  }

  private refreshTypographyValue(): void {
    this.typographyValue.set(this.getTypographyValue());
  }

  private refreshTableValue(): void {
    this.tableValue.set(this.getTableValue());
  }

  private getTypographyValue(): TypographyConfig {
    return normalizeTypographyForResult({
      ...this.editorDefaults.typography,
      ...this.form.controls.typography.getRawValue(),
    });
  }

  private getLayoutValue(): LayoutConfig {
    return normalizeLayoutForResult(
      {
        ...this.editorDefaults.layout,
        ...this.form.controls.layout.getRawValue(),
      },
      this.paddingLocked()
    );
  }

  private getCurrentBorderValue(): BorderStyle {
    return normalizeBorderStyle(
      this.editorDefaults.border,
      this.form.controls.borders.controls.border.getRawValue()
    );
  }

  private getTableValue(): TableDetails {
    const details =
      this.form.controls.table.getRawValue() as Partial<TableDetails>;
    return normalizeTableForResult(details, this.editorDefaults.table);
  }

  private getMetadataValue(): TableMetadata {
    return normalizeMetadata(
      this.form.controls.metadata.getRawValue(),
      this.editorDefaults.metadata
    );
  }

  private captureSnapshot(): TableEditorSnapshot<
    ReturnType<TableEditorForm['getRawValue']>
  > {
    return {
      formValue: structuredClone(this.form.getRawValue()),
      activeEdges: structuredClone(this.activeEdges()),
      edgeStyles: structuredClone(this.edgeStyles()),
      paddingLocked: this.paddingLocked(),
      customBorderWidth: this.customBorderWidthValue(),
      selectedBorderWidth: this.selectedBorderWidthValue(),
    };
  }

  private restoreSnapshot(
    snapshot: TableEditorSnapshot<ReturnType<TableEditorForm['getRawValue']>>
  ): void {
    this.form.reset(structuredClone(snapshot.formValue));
    this.activeEdges.set(structuredClone(snapshot.activeEdges));
    this.edgeStyles.set(structuredClone(snapshot.edgeStyles));
    this.paddingLocked.set(snapshot.paddingLocked);
    this.customBorderWidthValue.set(snapshot.customBorderWidth);
    this.selectedBorderWidthValue.set(snapshot.selectedBorderWidth);
    this.refreshFormValueSignals();
  }
}
