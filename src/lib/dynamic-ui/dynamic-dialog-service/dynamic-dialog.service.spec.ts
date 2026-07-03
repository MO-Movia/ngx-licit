/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DynamicDialogService } from './dynamic-dialog.service';

@Component({ selector: 'licit-test-dialog-content', template: '<span>dialog</span>' })
class DialogContentComponent {}

describe('DynamicDialogService', () => {
  let service: DynamicDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [DynamicDialogService],
    }).compileComponents();
    service = TestBed.inject(DynamicDialogService);
  });

  afterEach(() => {
    service.close();
  });

  it('should open a dialog component and append it to the body', () => {
    const ref = service.open(DialogContentComponent);

    expect(ref).toBeDefined();
    expect(ref.instance).toBeInstanceOf(DialogContentComponent);
  });

  it('should create a backdrop element', () => {
    service.open(DialogContentComponent);

    const backdrop = document.body.querySelector('.open-dialog-backdrop');
    expect(backdrop).toBeTruthy();
  });

  it('should apply z-index styles to the dialog', () => {
    const ref = service.open(DialogContentComponent, { zIndex: 1000 });

    const domElem = ref.location.nativeElement as HTMLElement;
    expect(domElem.style.zIndex).toBe('1001');
  });

  it('should pass data to the component', () => {
    const ref = service.open(DialogContentComponent, {
      data: {},
    });

    expect(ref).toBeDefined();
  });

  it('should use default z-index of 50000 when not specified', () => {
    const ref = service.open(DialogContentComponent);

    const domElem = ref.location.nativeElement as HTMLElement;
    expect(domElem.style.zIndex).toBe('50001');
  });

  it('should close the dialog and remove elements from the body', () => {
    service.open(DialogContentComponent);
    service.close();

    expect(
      document.body.querySelector('.open-dialog-backdrop')
    ).toBeFalsy();
  });

  it('should close existing dialog when opening a new one', () => {
    const ref1 = service.open(DialogContentComponent);
    const destroySpy = vi.spyOn(ref1, 'destroy');
    service.open(DialogContentComponent);

    expect(destroySpy).toHaveBeenCalled();
  });

  it('should close the dialog when the backdrop is clicked', () => {
    service.open(DialogContentComponent);

    const backdrop = document.body.querySelector(
      '.open-dialog-backdrop'
    ) as HTMLElement;
    backdrop.click();

    expect(
      document.body.querySelector('.open-dialog-backdrop')
    ).toBeFalsy();
  });

  it('should handle close when no dialog is open', () => {
    expect(() => service.close()).not.toThrow();
  });
});
