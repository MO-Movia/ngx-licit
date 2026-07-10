/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, Signal, computed, input, model } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import type {
  FontOption,
  LayoutConfig,
  TypographyConfig,
} from '../../table-editor-dialog.model';
import type { TableEditorForm } from '../../table-editor-form';
import { verticalAlignToFlex } from '../../table-editor-domain';
import {
  nativeColorValue,
  normalizeOptionalMeasureInput,
  normalizeOptionalPositiveMeasureInput,
  normalizePaddingInput,
} from '../../table-editor-normalizers';
import { DEFAULT_TYPOGRAPHY } from '../../table-editor-dialog-defaults';

/**
 * Table editor typography and padding controls.
 */
@Component({
  selector: 'licit-table-editor-typography',
  templateUrl: './table-editor-typography.component.html',
  styleUrl: './table-editor-typography.component.scss',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
})
export class TableEditorTypographyComponent {
  public readonly form = input.required<TableEditorForm>();
  public readonly paddingLocked = model.required<boolean>();
  public readonly layoutValue = input.required<Signal<LayoutConfig>>();
  public readonly typographyValue = input.required<Signal<TypographyConfig>>();
  public readonly fontOptions = input.required<FontOption[]>();
  public readonly fontSizeOptions = input.required<number[]>();

  public readonly paddingLockedValue = computed(() => this.paddingLocked());

  public readonly previewOuterStyle = computed(() => {
    const layout = this.layoutValue()();

    return {
      padding: `${layout.paddingTop} ${layout.paddingRight} ${layout.paddingBottom} ${layout.paddingLeft}`,
    };
  });

  public readonly previewInnerStyle = computed(() => {
    const typography = this.typographyValue()();

    return {
      'background-color':
        typography.backgroundColor === 'transparent'
          ? 'transparent'
          : this.cssColorValue(typography.backgroundColor, 'transparent'),
      'align-items': verticalAlignToFlex(typography.verticalAlign),
    };
  });

  public readonly previewTextStyle = computed(() => {
    const typography = this.typographyValue()();

    return {
      color: this.previewTextColorValue(
        typography.textColor,
        typography.backgroundColor
      ),
      'font-family': typography.fontFamily,
      'font-size': typography.fontSize,
      'font-style': typography.italic ? 'italic' : 'normal',
      'font-weight': typography.bold ? '700' : '400',
      'letter-spacing': typography.letterSpacing,
      'line-height': typography.lineHeight,
      'text-align': typography.textAlign,
      'text-decoration': typography.underline ? 'underline' : 'none',
    };
  });

  protected nativeColorValue(value: string | null | undefined): string {
    return nativeColorValue(value);
  }

  private cssColorValue(
    value: string | null | undefined,
    fallback: string
  ): string {
    const color = String(value ?? '').trim();
    return color || fallback;
  }

  private previewTextColorValue(
    textColor: string | null | undefined,
    backgroundColor: string | null | undefined
  ): string {
    const normalizedTextColor = nativeColorValue(textColor);
    const fill = String(backgroundColor ?? '').trim().toLowerCase();

    if (
      normalizedTextColor === '#000000' &&
      (!fill || fill === 'transparent' || fill === 'rgba(0, 0, 0, 0)')
    ) {
      return 'var(--mat-sys-primary, #f5a623)';
    }

    return this.cssColorValue(textColor, '#000000');
  }

  public setColor(
    control: 'textColor' | 'backgroundColor',
    value: string
  ): void {
    this.form().controls.typography.controls[control].setValue(
      nativeColorValue(value)
    );
    this.form().controls.typography.controls[control].markAsDirty();
  }

  public clearBackground(): void {
    this.form().controls.typography.controls.backgroundColor.setValue(
      'transparent'
    );
    this.form().controls.typography.controls.backgroundColor.markAsDirty();
  }

  public syncPadding(changedControl: keyof LayoutConfig): void {
    if (changedControl === 'paddingLocked' || !this.paddingLocked()) return;

    const value = normalizePaddingInput(
      this.form().controls.layout.controls[changedControl].value
    );
    this.form().controls.layout.patchValue(
      {
        paddingTop: value,
        paddingRight: value,
        paddingBottom: value,
        paddingLeft: value,
      },
      { emitEvent: true }
    );
    this.form().controls.layout.controls.paddingTop.markAsDirty();
    this.form().controls.layout.controls.paddingRight.markAsDirty();
    this.form().controls.layout.controls.paddingBottom.markAsDirty();
    this.form().controls.layout.controls.paddingLeft.markAsDirty();
  }

  public togglePaddingLock(): void {
    const locked = !this.paddingLocked();
    this.paddingLocked.set(locked);
    this.form().controls.layout.controls.paddingLocked.setValue(locked);
    this.form().controls.layout.controls.paddingLocked.markAsDirty();

    if (locked) {
      this.syncPadding('paddingTop');
    }
  }

  public normalizePadding(control: keyof LayoutConfig): void {
    if (control === 'paddingLocked') return;

    const value = normalizePaddingInput(
      this.form().controls.layout.controls[control].value
    );
    this.form().controls.layout.controls[control].setValue(value);
    this.syncPadding(control);
  }

  public normalizeTypographyMeasure(
    control: 'letterSpacing' | 'lineHeight'
  ): void {
    const field = this.form().controls.typography.controls[control];
    field.setValue(
      control === 'lineHeight'
        ? normalizeOptionalPositiveMeasureInput(
            field.value,
            DEFAULT_TYPOGRAPHY.lineHeight
          )
        : normalizeOptionalMeasureInput(field.value)
    );
  }

  public toggleTypographyStyle(control: 'bold' | 'italic' | 'underline'): void {
    const field = this.form().controls.typography.controls[control];
    field.setValue(!field.value);
    field.markAsDirty();
  }
}
