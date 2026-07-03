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
import { DynamicDialogService } from './dynamic-ui';
import { MoLinkToolComponent } from './components/link-tool';
import type { LinkToolSaveEvent } from './components/link-tool';

describe('EditorComponent', () => {
  let component: LicitEditorComponent;
  let fixture: ComponentFixture<LicitEditorComponent>;
  let dialogService: DynamicDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicitEditorComponent],
      providers: [],
    }).compileComponents();
    fixture = TestBed.createComponent(LicitEditorComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DynamicDialogService);
    fixture.componentRef.setInput('runtime', MockService(RuntimeService));
    fixture.componentRef.setInput('doc', {
      type: 'doc',
    });
    fixture.componentRef.setInput('docType', 'doc');
    fixture.componentRef.setInput('repair', true);
    fixture.detectChanges();
  });

  afterEach(() => {
    dialogService.close();
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

  it('should call ngAfterViewInit and render Licit', () => {
    expect(() => component.ngAfterViewInit()).not.toThrow();
  });

  it('should clean up on ngOnDestroy', () => {
    const closeSpy = vi.spyOn(dialogService, 'close');
    component.ngOnDestroy();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should open link tool via runtime callback', () => {
    const openSpy = vi.spyOn(dialogService, 'open');
    const applyLink = vi.fn();
    const closeLinkTool = vi.fn();

    component['openLinkTool'](
      'http://example.com',
      'link text',
      applyLink,
      closeLinkTool
    );
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledWith(
      MoLinkToolComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          highlightedText: 'link text',
          initialUrl: 'http://example.com',
        }),
      })
    );
  });

  it('should use selected text when popupString is empty', () => {
    const openSpy = vi.spyOn(dialogService, 'open');
    component.licit = {
      editorView: {
        state: {
          doc: { textBetween: () => 'selected text' } as never,
          selection: { from: 0, to: 10 } as never,
        },
        focus: vi.fn() as never,
      },
    } as unknown as LicitHandle;

    component['openLinkTool']('', '', vi.fn(), vi.fn());
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledWith(
      MoLinkToolComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          highlightedText: 'selected text',
          initialUrl: '',
        }),
      })
    );
  });

  it('should get selected text from editor view', () => {
    component.licit = {
      editorView: {
        state: {
          doc: { textBetween: () => 'hello world' } as never,
          selection: { from: 0, to: 5 } as never,
        },
        focus: vi.fn() as never,
      },
    } as unknown as LicitHandle;

    expect(component['getSelectedText']()).toBe('hello world');
  });

  it('should return empty string when no editor view', () => {
    component.licit = undefined;
    expect(component['getSelectedText']()).toBe('');
  });

  it('should save link from tool and close', () => {
    const closeSpy = vi.spyOn(dialogService, 'close');
    const applyLink = vi.fn();

    // Set up the link tool state by opening it first
    component['openLinkTool']('http://example.com', 'text', applyLink, vi.fn());
    fixture.detectChanges();

    const event: LinkToolSaveEvent = {
      tab: 'external-reference',
      highlightedText: 'link text',
      linkDisplayText: 'link text',
      url: 'http://example.com',
    };
    component['onLinkToolSave'](event);

    expect(applyLink).toHaveBeenCalledWith('http://example.com', 'link text');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should use target id when url is not provided', () => {
    const closeSpy = vi.spyOn(dialogService, 'close');
    const applyLink = vi.fn();

    component['openLinkTool']('#item1', 'text', applyLink, vi.fn());
    fixture.detectChanges();

    const event: LinkToolSaveEvent = {
      tab: 'within-document',
      highlightedText: 'link text',
      linkDisplayText: 'link text',
      target: { id: '#item1', label: 'Item 1' },
      category: 'toc',
    };
    component['onLinkToolSave'](event);

    expect(applyLink).toHaveBeenCalledWith('#item1', 'link text');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should close link tool', () => {
    const closeSpy = vi.spyOn(dialogService, 'close');
    component['closeLinkTool']();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should finalize link tool and call close callback', () => {
    const closeLinkTool = vi.fn();
    const focusSpy = vi.fn();
    component.licit = {
      editorView: { focus: focusSpy } as never,
    } as unknown as LicitHandle;

    component['openLinkTool']('http://example.com', 'text', vi.fn(), closeLinkTool);
    fixture.detectChanges();

    // Destroy the dialog to trigger finalizeLinkTool
    dialogService.close();

    expect(closeLinkTool).toHaveBeenCalled();
  });

  it('should insert JSON when reference is set', () => {
    const insertSpy = vi.fn();
    component.licit = {
      insertJSON: insertSpy,
    } as unknown as LicitHandle;

    fixture.componentRef.setInput('reference', '{"type":"paragraph"}');
    fixture.detectChanges();

    expect(insertSpy).toHaveBeenCalledWith({ type: 'paragraph' });
  });
});

