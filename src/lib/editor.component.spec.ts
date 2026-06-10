/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { LicitEditorComponent } from './editor.component';
import { RuntimeService } from './runtime/runtime.service';
import { MockService } from 'ng-mocks';
import { LicitHandle } from '@modusoperandi/licit-tiptap/licit';

describe('EditorComponent', () => {
  let component: LicitEditorComponent;
  let fixture: ComponentFixture<LicitEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicitEditorComponent],
      providers: [],
    }).compileComponents();
    fixture = TestBed.createComponent(LicitEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('runtime', MockService(RuntimeService));
    fixture.componentRef.setInput('doc', {
      type: 'doc',
    });
    fixture.componentRef.setInput('docType', 'doc');
    fixture.componentRef.setInput('repair', true);
    fixture.detectChanges();
  });

  it('should onComponentClick', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.licit = {
      goToEnd: spy,
    } as unknown as LicitHandle;
    const element = document.createElement('div');
    const mock = vi.fn();
    mock.mockReturnValueOnce(false).mockReturnValueOnce(true);
    element.closest = mock;
    component['onComponentClick'](element);
    expect(spy).toHaveBeenCalled();
  });

  it('should not onComponentClick', () => {
    const spy = vi.fn();
    component.licit = {
      goToEnd: spy,
    } as unknown as LicitHandle;
    const mock = vi.fn();

    // Case 1: closest(EDITOR) returns true (inside editor)
    const element1 = document.createElement('div');
    element1.closest = mock;
    mock.mockReturnValueOnce(true).mockReturnValueOnce(true);
    component['onComponentClick'](element1);

    // Case 2: closest(FRAME) returns false (outside frame)
    const element2 = document.createElement('div');
    element2.closest = mock;
    mock.mockReturnValueOnce(true).mockReturnValueOnce(false);
    component['onComponentClick'](element2);

    // Case 3: both closest return false
    const element3 = document.createElement('div');
    element3.closest = mock;
    mock.mockReturnValueOnce(false).mockReturnValueOnce(false);
    component['onComponentClick'](element3);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle props', () => {
    //touch these for extra coverage
    fixture.componentRef.setInput('repair', false);
    fixture.componentRef.setInput('reference', {});
    fixture.detectChanges();
    component['props']().onChange?.({}, true, undefined!);
    component['props']().onReady?.(null!);
    expect(component['props']()).toBeDefined();
  });

  it('should handle isDirty', () => {
    expect(component.isDirty()).toBeDefined();
  });

  it('should handle unload', () => {
    const isDirty = vi.spyOn(fixture.componentRef.instance, 'isDirty');
    isDirty.mockReturnValue(false);
    fixture.componentRef.setInput('saved', true);
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    expect(component['beforeUnloadHander'](new Event('fee'))).toBeFalsy();

    fixture.componentRef.setInput('saved', false);
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    expect(component['beforeUnloadHander'](new Event('fii'))).toBeTruthy();

    fixture.componentRef.setInput('saved', undefined);
    fixture.componentRef.setInput('readOnly', false);
    fixture.detectChanges();
    expect(component['beforeUnloadHander'](new Event('foe'))).toBeFalsy();

    fixture.componentRef.setInput('saved', undefined);
    fixture.componentRef.setInput('readOnly', false);
    isDirty.mockReturnValue(true);
    fixture.detectChanges();
    expect(component['beforeUnloadHander'](new Event('fum'))).toBeTruthy();
  });
});
