/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { InjectionToken } from '@angular/core';

import {
  FontOption,
  TableEditorDefaults,
} from './table-editor-dialog.model';
import { DEFAULT_TABLE_EDITOR_DEFAULTS } from './table-editor-dialog-defaults';

/** Default font options used when callers do not provide custom dialog data. */
export const DEFAULT_TABLE_EDITOR_FONT_OPTIONS: FontOption[] = [
  { label: 'Default Font', value: 'inherit' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

/**
 * Provides app-wide default font options for the table editor.
 *
 * Callers can override this token at a module, route, or component provider level.
 * Values supplied through dialog data still take precedence for that dialog instance.
 */
export const TABLE_EDITOR_FONT_OPTIONS = new InjectionToken<FontOption[]>(
  'TABLE_EDITOR_FONT_OPTIONS',
  {
    providedIn: 'root',
    factory: () => DEFAULT_TABLE_EDITOR_FONT_OPTIONS,
  },
);

/**
 * Provides app-wide default values for the table editor.
 *
 * Callers can provide any subset of defaults at a module, route, or component
 * provider level. Values supplied through dialog data still take precedence for
 * that dialog instance.
 */
export const TABLE_EDITOR_DEFAULTS = new InjectionToken<TableEditorDefaults>(
  'TABLE_EDITOR_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DEFAULT_TABLE_EDITOR_DEFAULTS,
  },
);
