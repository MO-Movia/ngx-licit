/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TableEditorHelpDialogComponent } from './table-editor-help-dialog.component';
import { TableEditorHelpEntry } from './table-editor-help.data';

const HELP_ENTRY: TableEditorHelpEntry = {
  title: 'Help: Test Tab',
  steps: ['Choose a thing', 'Apply the thing'],
  sections: [
    {
      title: 'Useful details',
      body: 'The dialog explains contextual table editor controls.',
    },
  ],
};

describe('TableEditorHelpDialogComponent', () => {
  let fixture: ComponentFixture<TableEditorHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableEditorHelpDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: HELP_ENTRY }],
    }).compileComponents();

    fixture = TestBed.createComponent(TableEditorHelpDialogComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render supplied help content', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h3')?.textContent).toContain(
      HELP_ENTRY.title
    );
    expect(element.querySelectorAll('.help-steps li').length).toBe(2);
    expect(element.querySelector('.help-section h4')?.textContent).toContain(
      HELP_ENTRY.sections[0].title
    );
    expect(element.querySelector('.help-section p')?.textContent).toContain(
      HELP_ENTRY.sections[0].body
    );
  });
});
