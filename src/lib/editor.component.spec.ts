/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { EditorComponent } from './editor.component';
import { RuntimeService } from './runtime.service';
import { Mock } from 'ts-mocks';
import type { LicitDocument } from './models/licit-document';
import type { Style } from '@modusoperandi/licit-custom-styles/StyleRuntime';
import type { Licit } from '@modusoperandi/licit';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let runtime: Mock<RuntimeService>;

  beforeEach(async () => {
    // create fake runtime service
    runtime = new Mock<RuntimeService>({
      canProxyImageSrc: () => false,
      canUploadImage: () => false,
      getStylesAsync: async (): Promise<Style[]> => await Promise.resolve([]),
      // requirement to launch editor version 0.1.1
      fetchStyles: async (): Promise<Style[]> => await Promise.resolve([]),
      saveStyle: async (): Promise<Style> =>
        (await Promise.resolve({})) as Style, // bug in styles if undefined
    });

    await TestBed.configureTestingModule({
      imports: [EditorComponent],
      providers: [
        { provide: RuntimeService, useFactory: () => runtime.Object },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('doc', {
      type: 'doc',
    } as LicitDocument);
    fixture.componentRef.setInput('docType', 'doc');
    fixture.componentRef.setInput('repair', true);
    fixture.detectChanges();
  });

  it('should onComponentClick', () => {
    fixture.detectChanges();
    const spy = jasmine.createSpy();
    component.licit = {
      goToEnd: spy,
    } as unknown as Licit;
    const mock = jasmine.createSpy();
    mock.and.returnValues(false, true);
    component['onComponentClick']({ closest: mock } as unknown as HTMLElement);
    expect(spy).toHaveBeenCalled();
  });

  it('should not onComponentClick', () => {
    const spy = jasmine.createSpy();
    component.licit = {
      goToEnd: spy,
    } as unknown as Licit;
    const mock = jasmine.createSpy();
    mock.and.returnValues(true, true);
    component['onComponentClick']({ closest: mock } as unknown as HTMLElement);
    mock.and.returnValues(true, false);
    component['onComponentClick']({ closest: mock } as unknown as HTMLElement);
    mock.and.returnValues(false, false);
    component['onComponentClick']({ closest: mock } as unknown as HTMLElement);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle props', () => {
    //touch these for extra coverage
    fixture.componentRef.setInput('repair', false);
    fixture.componentRef.setInput('reference', {});
    fixture.detectChanges();
    component['props']().onChange?.({} as LicitDocument, true);
    component['props']().onReady?.(null!);
    expect(component['props']()).toBeDefined();
  });

  it('should handle isDirty', () => {
    expect(component.isDirty()).toBeDefined();
  });

  it('should handle unload', () => {
    const isDirty = spyOn(fixture.componentRef.instance, 'isDirty');
    isDirty.and.returnValue(false);
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
    isDirty.and.returnValue(true);
    fixture.detectChanges();
    expect(component['beforeUnloadHander'](new Event('fum'))).toBeTruthy();
  });
});
