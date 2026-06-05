/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { LinkToolCategory, LinkToolItem } from './link-tool.component';
import { MoLinkToolComponent } from './link-tool.component';

describe('MoLinkToolComponent', () => {
  let component: MoLinkToolComponent;
  let fixture: ComponentFixture<MoLinkToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoLinkToolComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoLinkToolComponent);
    component = fixture.componentInstance;
  });

  it('should keep external URLs with fragments in the URL field', () => {
    fixture.componentRef.setInput(
      'initialUrl',
      'https://example.com/page#section'
    );
    fixture.detectChanges();

    expect(component['activeTab']()).toBe('external-reference');
    expect(component['externalUrl']()).toBe('https://example.com/page#section');
  });

  it('should open same-document links without populating the external URL field', () => {
    const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
      toc: [],
      figures: [],
      tables: [],
      paragraphs: [
        {
          id: '#c392ef96-e877-4fc3-b2a3-75d0ab9151cf',
          label: 'Document section',
        },
      ],
    };

    fixture.componentRef.setInput('linkItems', linkItems);
    fixture.componentRef.setInput(
      'initialUrl',
      '#c392ef96-e877-4fc3-b2a3-75d0ab9151cf'
    );
    fixture.detectChanges();

    expect(component['activeTab']()).toBe('within-document');
    expect(component['externalUrl']()).toBe('');
    expect(component['activeCategory']()).toBe('paragraphs');
    expect(component['selectedItem']()?.id).toBe(
      '#c392ef96-e877-4fc3-b2a3-75d0ab9151cf'
    );
  });

  it('should filter numbered link text as plain text', () => {
    const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
      toc: [
        { id: '#first', label: '1. Purpose' },
        { id: '#second', label: '2.1 System Overview' },
      ],
      figures: [],
      tables: [],
      paragraphs: [],
    };

    fixture.componentRef.setInput('linkItems', linkItems);
    fixture.detectChanges();

    component['itemFilter'].set('2.1');
    fixture.detectChanges();

    expect(component['visibleItems']().map((item) => item.id)).toEqual([
      '#second',
    ]);
  });
});
