/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

import { TableEditorComponent } from './table-editor.component';
import { TableEditorBordersComponent } from './tab-sections/borders/table-editor-borders.component';
import { TableEditorTypographyComponent } from './tab-sections/typography/table-editor-typography.component';
import { TableEditorTableDetailsComponent } from './tab-sections/table-details/table-editor-table-details.component';
import { TableEditorDialogComponent } from './table-editor-dialog.component';
import { TableEditorHelpDialogComponent } from './help/table-editor-help-dialog.component';
import { TableEditorResult } from './table-editor-dialog.model';
import { TABLE_EDITOR_DEFAULTS } from './table-editor-dialog.token';
import { nativeColorValue } from './table-editor-normalizers';

type TableEditorDialogHarness = {
  dialog: MatDialog;
  openHelp(): void;
};

describe('TableEditorDialogComponent', () => {
  let component: TableEditorDialogComponent;
  let fixture: ComponentFixture<TableEditorDialogComponent>;
  let dialogRefMock: Pick<MatDialogRef<TableEditorDialogComponent>, 'close'>;

  beforeEach(async () => {
    dialogRefMock = { close: () => undefined };

    await TestBed.configureTestingModule({
      imports: [TableEditorDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the help button next to the close button', () => {
    const helpButton = fixture.nativeElement.querySelector(
      'button[aria-label="Help with this tab"]'
    );
    const closeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Close table editor"]'
    );

    expect(helpButton).toBeTruthy();
    expect(closeButton).toBeTruthy();
    expect(helpButton.nextElementSibling).toBe(closeButton);
  });

  it('should host the reusable editor inside dialog content', () => {
    expect(
      fixture.nativeElement.querySelector('mat-dialog-content')
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('licit-table-editor')
    ).toBeTruthy();
  });

  it('should open borders help by default', () => {
    const openHelpDialog = spyOnHelpDialog();

    openHelp();

    expect(openHelpDialog).toHaveBeenCalledWith(
      TableEditorHelpDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Help: Borders & Shading',
        }),
      })
    );
    expect(openHelpDialog).toHaveBeenCalledTimes(1);
  });

  it('should open table details help when the details tab is active', () => {
    const openHelpDialog = spyOnHelpDialog();
    const editor = getEditorHarness();

    editor.setActiveTab(2);
    fixture.detectChanges();

    openHelp();

    expect(openHelpDialog).toHaveBeenCalledWith(
      TableEditorHelpDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Help: Table Details',
        }),
      })
    );
    expect(openHelpDialog).toHaveBeenCalledTimes(1);
  });

  it('should close with normalized results from the reusable editor', () => {
    const dialogClose = vi.spyOn(dialogRefMock, 'close');
    const editor = getEditorHarness();
    const borders = getBordersHarness(fixture);

    borders.toggleEdge('left');
    editor.form.controls.borders.controls.applyMode.setValue('cell');
    component.onSubmit();

    expect(dialogClose).toHaveBeenCalledWith(
      expect.objectContaining({
        borders: expect.objectContaining({
          applyMode: 'cell',
          targetEdges: ['left'],
        }),
        selectionMode: 'single',
      })
    );

    component.onCancel();

    expect(dialogClose).toHaveBeenCalledWith();
  });

  it('should reset settings via the dialog wrapper', () => {
    const borders = getBordersHarness(fixture);

    borders.toggleEdge('top');
    expect(borders.isEdgeActive('top')).toBe(true);

    component.resetSettings();

    expect(borders.isEdgeActive('top')).toBe(false);
  });

  function getEditorHarness(): TableEditorComponent {
    const editor = fixture.debugElement.query(
      By.directive(TableEditorComponent)
    ).componentInstance as TableEditorComponent;

    return editor;
  }

  function openHelp(): void {
    (component as unknown as TableEditorDialogHarness).openHelp();
    fixture.detectChanges();
  }

  function spyOnHelpDialog() {
    return vi
      .spyOn(
        (component as unknown as TableEditorDialogHarness).dialog,
        'open'
      )
      .mockReturnValue({} as never);
  }
});

describe('TableEditorComponent', () => {
  let component: TableEditorComponent;
  let fixture: ComponentFixture<TableEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableEditorComponent,
        TableEditorBordersComponent,
        TableEditorTypographyComponent,
        TableEditorTableDetailsComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update border selection and styles', () => {
    const editor = getHarness();
    const borders = createBordersHarness();

    borders.toggleEdge('top');
    borders.setBorderWidth(2);

    expect(borders.isEdgeActive('top')).toBe(true);
    expect(borders.targetReadout()).toBe('Top Exterior');
    expect(borders.selectedBorderWidth()).toBe(2);
    expect(borders.customBorderWidth()).toBe('');
    expect(borders.getEdgeBorder('top')).toContain('2px solid #555555');

    editor.form.controls.borders.controls.border.controls.style.setValue(
      'none'
    );

    expect(borders.getEdgeBorder('top')).toBe('0 none transparent');

    borders.toggleEdge('top');

    expect(borders.isEdgeActive('top')).toBe(false);
    expect(borders.targetReadout()).toBe('None');
  });

  it('should only allow inner border edges for range selections', () => {
    const editor = getHarness();
    const borders = createBordersHarness();

    borders.toggleEdge('insideHorizontal');

    expect(borders.isEdgeActive('insideHorizontal')).toBe(false);

    editor.selectionMode.set('range');
    borders.toggleEdge('insideHorizontal');

    expect(borders.isEdgeActive('insideHorizontal')).toBe(true);
    expect(borders.targetReadout()).toBe('Internal Horizontal');
  });

  it('should normalize custom border widths and colors', () => {
    const editor = getHarness();
    const borders = createBordersHarness();

    borders.setCustomBorderWidth('5');

    expect(borders.customBorderWidth()).toBe('5');
    expect(borders.selectedBorderWidth()).toBeNull();
    expect(
      editor.form.controls.borders.controls.border.controls.width.value
    ).toBe('5px');

    borders.setCustomBorderWidth('nope');

    expect(
      editor.form.controls.borders.controls.border.controls.width.value
    ).toBe('5px');
    expect(nativeColorValue('#abc')).toBe('#aabbcc');
    expect(nativeColorValue('rgb(255, 255, 255)')).toBe('#ffffff');
    expect(nativeColorValue('not-a-color', '#123456')).toBe('#123456');

    borders.setBorderColor('#ABCDEF');
    const typography = createTypographyHarness();
    typography.setColor('textColor', '#FEDCBA');
    typography.setColor('backgroundColor', '#111111');

    expect(
      editor.form.controls.borders.controls.border.controls.color.value
    ).toBe('#abcdef');
    expect(editor.form.controls.typography.controls.textColor.value).toBe(
      '#fedcba'
    );
    expect(editor.form.controls.typography.controls.backgroundColor.value).toBe(
      '#111111'
    );

    typography.clearBackground();

    expect(editor.form.controls.typography.controls.backgroundColor.value).toBe(
      'transparent'
    );
  });

  it('should synchronize and normalize padding controls', () => {
    const editor = getHarness();

    const typography = createTypographyHarness();

    editor.form.controls.layout.controls.paddingTop.setValue('7px');
    typography.syncPadding('paddingTop');

    expect(editor.form.controls.layout.controls.paddingRight.value).toBe('7');
    expect(typography.previewOuterStyle().padding).toBe('7px 7px 7px 7px');

    typography.togglePaddingLock();
    editor.form.controls.layout.controls.paddingLeft.setValue('13px');
    typography.syncPadding('paddingLeft');

    expect(editor.paddingLocked()).toBe(false);
    expect(editor.form.controls.layout.controls.paddingRight.value).toBe('7');

    typography.normalizePadding('paddingLeft');

    expect(editor.form.controls.layout.controls.paddingLeft.value).toBe('13');

    typography.togglePaddingLock();

    expect(editor.paddingLocked()).toBe(true);
    expect(editor.form.controls.layout.controls.paddingRight.value).toBe('7');
  });

  it('should update typography controls and preview styles', () => {
    const editor = getHarness();

    const typography = createTypographyHarness();

    editor.form.controls.typography.controls.fontSize.setValue('18');
    editor.form.controls.typography.controls.letterSpacing.setValue('1.5px');
    editor.form.controls.typography.controls.lineHeight.setValue('1.35');
    editor.form.controls.typography.controls.backgroundColor.setValue(
      '#222222'
    );
    editor.form.controls.typography.controls.textColor.setValue(
      'rgb(0, 0, 0)'
    );
    editor.form.controls.typography.controls.backgroundColor.setValue(
      'rgb(255, 255, 255)'
    );
    editor.form.controls.typography.controls.verticalAlign.setValue('bottom');
    typography.toggleTypographyStyle('bold');
    typography.toggleTypographyStyle('italic');
    typography.toggleTypographyStyle('underline');
    typography.normalizeTypographyMeasure('letterSpacing');
    typography.normalizeTypographyMeasure('lineHeight');

    expect(editor.form.controls.typography.controls.fontSize.value).toBe('18');
    expect(editor.form.controls.typography.controls.letterSpacing.value).toBe(
      '1.5'
    );
    expect(typography.previewInnerStyle()['align-items']).toBe('flex-end');
    expect(typography.previewInnerStyle()['background-color']).toBe(
      'rgb(255, 255, 255)'
    );
    expect(typography.previewTextStyle().color).toBe('rgb(0, 0, 0)');
    editor.form.controls.typography.controls.backgroundColor.setValue(
      'transparent'
    );
    expect(typography.previewTextStyle().color).toBe(
      'var(--mat-sys-primary, #f5a623)'
    );
    expect(typography.previewTextStyle()['font-weight']).toBe('700');
    expect(typography.previewTextStyle()['font-style']).toBe('italic');
    expect(typography.previewTextStyle()['text-decoration']).toBe('underline');
  });

  it('should expose an imported decimal font size as a selectable value', () => {
    const editor = getHarness();
    const typography = createTypographyHarness();

    editor.form.controls.typography.controls.fontSize.setValue('10.7');

    expect(typography.effectiveFontSizeOptions()).toContain(10.7);
  });

  it('should expose an imported font family even when it is not predefined', () => {
    const editor = getHarness();
    const typography = createTypographyHarness();

    editor.form.controls.typography.controls.fontFamily.setValue('Book Antiqua');

    expect(typography.effectiveFontOptions()).toContainEqual({
      label: 'Book Antiqua',
      value: 'Book Antiqua',
    });
  });

  it('should calculate table details and overflow styles', () => {
    const editor = getHarness();

    const details = createTableDetailsHarness();

    editor.form.controls.table.patchValue({
      pageOrientation: 'landscape',
      selectedCellHeight: '25px',
      selectedCellHeightPx: 25,
      selectedCellWidth: '50px',
      selectedCellWidthPx: 50,
      tableHeight: '9999px',
      tableHeightPx: 9999,
      tableWidth: '9999px',
      tableWidthPx: 9999,
    });
    fixture.detectChanges();

    expect(details.activePageLimit()).toEqual({ width: 912, height: 624 });
    expect(details.selectedCellDimensionValue('selectedCellWidth')).toBe(
      '50px'
    );
    expect(details.tableWidthOverflow()).toBe(true);
    expect(details.tableHeightOverflow()).toBe(true);
    expect(details.visualizationStyle().width).toBe('190px');
    expect(details.visualizationTableStyle()['border-right']).toContain(
      '#ff4a4a'
    );

    editor.selectionMode.set('range');

    expect(details.selectedCellDimensionValue('selectedCellWidth')).toBe('');
  });

  it('should reset settings and emit normalized results', () => {
    const editor = getHarness();
    const borders = createBordersHarness();
    const applyResults: TableEditorResult[] = [];
    let cancelCount = 0;

    component.apply.subscribe((result) => applyResults.push(result));
    component.cancelRequested.subscribe(() => cancelCount++);

    borders.toggleEdge('top');
    borders.setBorderWidth(3);

    component.resetSettings();

    expect(borders.isEdgeActive('top')).toBe(false);
    expect(borders.selectedBorderWidth()).toBe(1);

    borders.toggleEdge('left');
    editor.form.controls.borders.controls.applyMode.setValue('cell');
    component.onSubmit();

    expect(applyResults.length).toBe(1);
    expect(applyResults[0]).toEqual(
      expect.objectContaining({
        borders: expect.objectContaining({
          applyMode: 'cell',
          targetEdges: ['left'],
        }),
        selectionMode: 'single',
      })
    );

    component.onCancel();

    expect(cancelCount).toBe(1);
  });

  function getHarness(): TableEditorComponent {
    return component;
  }

  function createBordersHarness(): TableEditorBordersComponent {
    const childFixture = TestBed.createComponent(TableEditorBordersComponent);
    childFixture.componentRef.setInput('form', component.form);
    childFixture.componentRef.setInput('activeEdges', component.activeEdges);
    childFixture.componentRef.setInput('edgeStyles', component.edgeStyles);
    childFixture.componentRef.setInput(
      'selectionMode',
      component.selectionMode
    );
    childFixture.componentRef.setInput('borderEdges', component.borderEdges());
    childFixture.componentRef.setInput(
      'borderWidthOptions',
      component.borderWidthOptions()
    );
    childFixture.componentRef.setInput(
      'customBorderWidthValue',
      component.customBorderWidthValue
    );
    childFixture.componentRef.setInput(
      'selectedBorderWidthValue',
      component.selectedBorderWidthValue
    );
    childFixture.componentRef.setInput(
      'defaultBorder',
      component.editorDefaults.border
    );
    childFixture.detectChanges();

    return childFixture.componentInstance;
  }

  function createTypographyHarness(): TableEditorTypographyComponent {
    const childFixture = TestBed.createComponent(
      TableEditorTypographyComponent
    );
    childFixture.componentRef.setInput('form', component.form);
    childFixture.componentRef.setInput(
      'paddingLocked',
      component.paddingLocked()
    );
    childFixture.componentInstance.paddingLocked.subscribe((locked) =>
      component.paddingLocked.set(locked)
    );
    childFixture.componentRef.setInput('layoutValue', component.layoutValue);
    childFixture.componentRef.setInput(
      'typographyValue',
      component.typographyValue
    );
    childFixture.componentRef.setInput('fontOptions', component.fontOptions());
    childFixture.componentRef.setInput(
      'fontSizeOptions',
      component.fontSizeOptions()
    );
    childFixture.detectChanges();

    return childFixture.componentInstance;
  }

  function createTableDetailsHarness(): TableEditorTableDetailsComponent {
    const childFixture = TestBed.createComponent(
      TableEditorTableDetailsComponent
    );
    childFixture.componentRef.setInput('form', component.form);
    childFixture.componentRef.setInput(
      'selectionMode',
      component.selectionMode
    );
    childFixture.componentRef.setInput('tableValue', component.tableValue);
    childFixture.componentRef.setInput('pageLimits', component.pageLimits());
    childFixture.detectChanges();

    return childFixture.componentInstance;
  }
});

function getBordersHarness(
  fixture: ComponentFixture<unknown>
): TableEditorBordersComponent {
  return fixture.debugElement.query(By.directive(TableEditorBordersComponent))
    .componentInstance as TableEditorBordersComponent;
}

describe('TableEditorDialogComponent with injected defaults', () => {
  it('should merge built-in defaults, token defaults, and dialog data', async () => {
    await TestBed.configureTestingModule({
      imports: [TableEditorDialogComponent],
      providers: [
        {
          provide: TABLE_EDITOR_DEFAULTS,
          useValue: {
            border: { width: '4px' },
            borderWidthOptions: [],
            edgeDefinitions: [],
            fontSizeOptions: [],
            layout: { paddingLocked: false, paddingTop: '9px' },
            metadata: { totalRows: 2 },
            pageLimits: { portrait: { width: 700 } },
            table: { tableWidth: '320px' },
            typography: { fontSize: '18px' },
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            borders: {
              border: { color: '#123456' },
              targetEdges: ['insideVertical'],
            },
            pageLimits: { portrait: { height: 500 } },
            selectionMode: 'range',
          },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    const injectedFixture = TestBed.createComponent(TableEditorDialogComponent);
    injectedFixture.detectChanges();

    const injectedComponent = injectedFixture.debugElement.query(
      By.directive(TableEditorComponent)
    ).componentInstance as TableEditorComponent;
    const injectedBorders = getBordersHarness(injectedFixture);

    expect(injectedComponent.borderEdges().length).toBe(6);
    expect(injectedComponent.borderWidthOptions()).toEqual([1, 2, 3]);
    expect(injectedComponent.fontSizeOptions()).toEqual([
      6, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 30, 36, 42, 48, 60, 72, 90,
    ]);
    expect(injectedComponent.paddingLocked()).toBe(false);
    expect(injectedComponent.pageLimits().portrait).toEqual({
      height: 500,
      width: 700,
    });
    expect(injectedBorders.isEdgeActive('insideVertical')).toBe(true);
    expect(
      injectedComponent.form.controls.borders.controls.border.controls.width
        .value
    ).toBe('4px');
    expect(
      injectedComponent.form.controls.borders.controls.border.controls.color
        .value
    ).toBe('#123456');
    expect(
      injectedComponent.form.controls.typography.controls.fontSize.value
    ).toBe('13.5');
  });
});
