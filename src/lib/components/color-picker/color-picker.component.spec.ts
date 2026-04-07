/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoColorPickerComponent } from './color-picker.component';

describe('MoColorPickerComponent', () => {
  let component: MoColorPickerComponent;
  let fixture: ComponentFixture<MoColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoColorPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoColorPickerComponent);
    component = fixture.componentInstance;
    localStorage.clear();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new color to the beginning of the array if not already present', () => {
    component['recentColors'].set(['#FF0000', '#00FF00', '#0000FF']);
    component['emitSelectedColor']('#FFFF00');
    expect(component['recentColors']()).toEqual([
      '#FFFF00',
      '#FF0000',
      '#00FF00',
      '#0000FF',
    ]);
  });

  it('should ensure updatedColors does not exceed 9 colors', () => {
    component['recentColors'].set([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ]);

    component['emitSelectedColor']('11');

    expect(component['recentColors']().length).toBe(10);

    expect(component['recentColors']()).toEqual([
      '11',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ]);
  });

  it('should emit the selected color', () => {
    spyOn(component.selectedColorChanged, 'emit');
    component['emitSelectedColor']('#FFFF00');
    expect(component.selectedColorChanged.emit).toHaveBeenCalledWith('#FFFF00');
  });
});
