/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import {
  Component,
  ChangeDetectionStrategy,
  model,
  output,
  input,
} from '@angular/core';
import { HeaderColors, standardColors } from './defaultColors';

/**
 * A simple color picker component.
 */
@Component({
  imports: [],
  selector: 'licit-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoColorPickerComponent {
  /** Color picked by the user. */
  public selectedColorChanged = output<string>();

  /** Top line highlighted colors displayed above standard color pallet. */
  public HeaderColors = input<{ key: string; value: string }[][]>(HeaderColors);

  /** Color pallet displayed below head colors. */
  public standardColors =
    input<{ key: string; value: string }[][]>(standardColors);

  /** Most recently picked colors by the user. */
  protected readonly recentColors = model<string[]>([]);

  protected emitSelectedColor(color: string): void {
    const updatedColors = [
      color,
      ...this.recentColors().filter((c) => c !== color),
    ];
    if (updatedColors.length > 9) {
      updatedColors.pop();
    }
    this.recentColors.set(updatedColors);
    this.selectedColorChanged.emit(color);
  }
}
