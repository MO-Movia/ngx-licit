/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import {
  Component,
  DestroyRef,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  inject,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type {
  BorderEdge,
  BorderEdgeDefinition,
  BorderStyle,
  SelectionMode,
} from '../../table-editor-dialog.model';
import type { TableEditorForm } from '../../table-editor-form';
import { isInnerEdge, normalizeBorderStyle } from '../../table-editor-domain';
import { nativeColorValue } from '../../table-editor-normalizers';

/**
 * Table editor border controls and preview.
 */
@Component({
  selector: 'licit-table-editor-borders',
  templateUrl: './table-editor-borders.component.html',
  styleUrl: './table-editor-borders.component.scss',
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
export class TableEditorBordersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public readonly form = input.required<TableEditorForm>();
  public readonly activeEdges = input.required<WritableSignal<BorderEdge[]>>();
  public readonly edgeStyles =
    input.required<WritableSignal<Record<BorderEdge, BorderStyle>>>();
  public readonly selectionMode = input.required<Signal<SelectionMode>>();
  public readonly borderEdges = input.required<BorderEdgeDefinition[]>();
  public readonly borderWidthOptions = input.required<number[]>();
  public readonly defaultBorder = input.required<BorderStyle>();
  public readonly customBorderWidthValue =
    input.required<WritableSignal<string>>();
  public readonly selectedBorderWidthValue =
    input.required<WritableSignal<number | null>>();

  public readonly isSingleSelection = computed(
    () => this.selectionMode()() === 'single'
  );

  public readonly targetReadout = computed(() => {
    const active = this.activeEdges()();
    if (!active.length) return 'None';

    return active
      .map(
        (edge) => this.borderEdges().find((item) => item.edge === edge)?.label
      )
      .filter(Boolean)
      .join(', ');
  });

  public ngOnInit(): void {
    this.form()
      .controls.borders.controls.border.valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.applyCurrentBorderToActiveEdges());
  }

  public toggleEdge(edge: BorderEdge): void {
    if (this.isSingleSelection() && isInnerEdge(edge)) return;

    const edges = this.activeEdges()();
    const isActive = edges.includes(edge);
    this.activeEdges().set(
      isActive ? edges.filter((item) => item !== edge) : [...edges, edge]
    );

    if (!isActive) {
      this.edgeStyles().update((styles) => ({
        ...styles,
        [edge]: this.getCurrentBorderValue(),
      }));
    }
  }

  public isEdgeActive(edge: BorderEdge): boolean {
    return this.activeEdges()().includes(edge);
  }

  public getEdgeBorder(edge: BorderEdge): string {
    const border = this.edgeStyles()()[edge];

    if (border.style === 'none') {
      return `0 ${border.style} transparent`;
    }

    return `${border.width} ${border.style} ${nativeColorValue(border.color)}`;
  }

  public customBorderWidth(): string {
    return this.customBorderWidthValue()();
  }

  public selectedBorderWidth(): number | null {
    return this.selectedBorderWidthValue()();
  }

  public setBorderWidth(width: number): void {
    this.customBorderWidthValue().set('');
    this.selectedBorderWidthValue().set(width);
    this.form().controls.borders.controls.border.controls.width.setValue(
      `${width}px`
    );
  }

  public setCustomBorderWidth(value: string): void {
    this.customBorderWidthValue().set(value);
    this.selectedBorderWidthValue().set(null);
    const width = Math.round(Number(value));

    if (Number.isFinite(width) && width > 0) {
      this.form().controls.borders.controls.border.controls.width.setValue(
        `${width}px`
      );
    }
  }

  public setBorderColor(value: string): void {
    this.form().controls.borders.controls.border.controls.color.setValue(
      nativeColorValue(value)
    );
  }

  protected nativeColorValue(value: string | null | undefined): string {
    return nativeColorValue(value);
  }

  private getCurrentBorderValue(): BorderStyle {
    return normalizeBorderStyle(
      this.defaultBorder(),
      this.form().controls.borders.controls.border.getRawValue()
    );
  }

  private applyCurrentBorderToActiveEdges(): void {
    const border = this.getCurrentBorderValue();
    this.edgeStyles().update((styles) => {
      const next = { ...styles };
      this.activeEdges()().forEach((edge) => {
        next[edge] = border;
      });
      return next;
    });
  }
}
