/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type {
  LinkToolCategory,
  LinkToolDocument,
  LinkToolItem,
  LinkToolSaveEvent,
} from './link-tool.component';
import { MoLinkToolComponent } from './link-tool.component';

const EMPTY_LINK_ITEMS: Record<LinkToolCategory, LinkToolItem[]> = {
  toc: [],
  figures: [],
  tables: [],
  paragraphs: [],
};

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

  describe('initialUrl effect', () => {
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
        ...EMPTY_LINK_ITEMS,
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

    it('should not select an item when same-document link is not found', () => {
      fixture.componentRef.setInput('linkItems', EMPTY_LINK_ITEMS);
      fixture.componentRef.setInput('initialUrl', '#nonexistent');
      fixture.detectChanges();

      expect(component['activeTab']()).toBe('within-document');
      expect(component['selectedItem']()).toBeUndefined();
    });
  });

  describe('filtering', () => {
    it('should filter numbered link text as plain text', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [
          { id: '#first', label: '1. Purpose' },
          { id: '#second', label: '2.1 System Overview' },
        ],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['itemFilter'].set('2.1');
      fixture.detectChanges();

      expect(component['visibleItems']().map((item) => item.id)).toEqual([
        '#second',
      ]);
    });

    it('should return all items when filter is empty', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [
          { id: '#first', label: '1. Purpose' },
          { id: '#second', label: '2.1 System Overview' },
        ],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      expect(component['visibleItems']().map((item) => item.id)).toEqual([
        '#first',
        '#second',
      ]);
    });

    it('should include parent items when only children match the filter', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [
          {
            id: '#parent',
            label: 'Parent',
            children: [{ id: '#child', label: 'Child matches query' }],
          },
        ],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['itemFilter'].set('query');
      fixture.detectChanges();

      const visible = component['visibleItems']();
      expect(visible.length).toBe(1);
      expect(visible[0].id).toBe('#parent');
      expect(visible[0].children?.length).toBe(1);
      expect(visible[0].children?.[0].id).toBe('#child');
    });

    it('should match items by summary text', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        figures: [{ id: '#fig1', label: 'Figure 1', summary: 'Chart of sales' }],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['selectCategory']('figures');
      component['itemFilter'].set('sales');
      fixture.detectChanges();

      expect(component['visibleItems']().map((item) => item.id)).toEqual([
        '#fig1',
      ]);
    });
  });

  describe('tab selection', () => {
    it('should switch to within-document tab and reset selection', () => {
      fixture.componentRef.setInput('linkItems', EMPTY_LINK_ITEMS);
      fixture.detectChanges();

      component['selectTab']('within-document');
      fixture.detectChanges();

      expect(component['activeTab']()).toBe('within-document');
      expect(component['itemFilter']()).toBe('');
      expect(component['selectedItem']()).toBeUndefined();
    });

    it('should not switch to the disabled within-external-document tab', () => {
      fixture.componentRef.setInput('linkItems', EMPTY_LINK_ITEMS);
      fixture.detectChanges();

      const previousTab = component['activeTab']();
      component['selectTab']('within-external-document');
      fixture.detectChanges();

      expect(component['activeTab']()).toBe(previousTab);
    });
  });

  describe('category selection', () => {
    it('should switch category and reset filter and selection', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [{ id: '#toc1', label: 'Section 1' }],
        figures: [{ id: '#fig1', label: 'Figure 1' }],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['selectCategory']('figures');
      fixture.detectChanges();

      expect(component['activeCategory']()).toBe('figures');
      expect(component['itemFilter']()).toBe('');
      expect(component['selectedItem']()).toBeUndefined();
      expect(component['expandedItemIds']().has('#fig1')).toBe(true);
    });
  });

  describe('document selection', () => {
    it('should select a document by id and clear item selection', () => {
      const documents: LinkToolDocument[] = [
        { id: 'doc1', title: 'Document 1' },
        { id: 'doc2', title: 'Document 2' },
      ];

      fixture.componentRef.setInput('documents', documents);
      fixture.detectChanges();

      component['selectDocument']('doc2');
      fixture.detectChanges();

      expect(component['selectedDocument']()?.id).toBe('doc2');
      expect(component['selectedItem']()).toBeUndefined();
    });

    it('should clear document selection when id is not found', () => {
      const documents: LinkToolDocument[] = [
        { id: 'doc1', title: 'Document 1' },
      ];

      fixture.componentRef.setInput('documents', documents);
      fixture.detectChanges();

      component['selectDocument']('nonexistent');
      fixture.detectChanges();

      expect(component['selectedDocument']()).toBeUndefined();
    });
  });

  describe('item toggling and expansion', () => {
    it('should select a leaf item when toggled', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [{ id: '#leaf', label: 'Leaf item' }],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      const item = linkItems.toc[0];
      const event = new Event('click');
      component['toggleItem'](item, event);
      fixture.detectChanges();

      expect(component['selectedItem']()?.id).toBe('#leaf');
    });

    it('should collapse an expanded parent item when toggled', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [
          {
            id: '#parent',
            label: 'Parent',
            children: [{ id: '#child', label: 'Child' }],
          },
        ],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      // All items are expanded by default via the constructor effect
      expect(component['expandedItemIds']().has('#parent')).toBe(true);

      const item = linkItems.toc[0];
      const event = new Event('click');
      component['toggleItem'](item, event);
      fixture.detectChanges();

      expect(component['expandedItemIds']().has('#parent')).toBe(false);
    });

    it('should expand a collapsed parent item when toggled', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [
          {
            id: '#parent',
            label: 'Parent',
            children: [{ id: '#child', label: 'Child' }],
          },
        ],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      const item = linkItems.toc[0];
      const event = new Event('click');
      // First toggle collapses (expanded by default)
      component['toggleItem'](item, event);
      // Second toggle expands
      component['toggleItem'](item, event);
      fixture.detectChanges();

      expect(component['expandedItemIds']().has('#parent')).toBe(true);
    });

    it('should consider items expanded when a filter is active', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [{ id: '#item', label: 'Some item' }],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['itemFilter'].set('some');
      fixture.detectChanges();

      expect(component['isExpanded'](linkItems.toc[0])).toBe(true);
    });
  });

  describe('text splitting', () => {
    it('should split toc item text at sentence boundary', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [{ id: '#toc1', label: 'First sentence. Second sentence.' }],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      const item = linkItems.toc[0];
      expect(component['getPrimaryText'](item)).toBe('First sentence.');
      expect(component['getSummaryText'](item)).toBe('Second sentence.');
    });

    it('should return full label as primary text when no sentence boundary', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [{ id: '#toc1', label: 'No sentence boundary here' }],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      const item = linkItems.toc[0];
      expect(component['getPrimaryText'](item)).toBe('No sentence boundary here');
      expect(component['getSummaryText'](item)).toBe('');
    });

    it('should not split text for figures category', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        figures: [{ id: '#fig1', label: 'Figure 1. Some description.' }],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['selectCategory']('figures');
      fixture.detectChanges();

      const item = linkItems.figures[0];
      expect(component['getPrimaryText'](item)).toBe('Figure 1. Some description.');
      expect(component['getSummaryText'](item)).toBe('');
    });

    it('should return summary when item has a summary property', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [
          {
            id: '#toc1',
            label: 'Some label',
            summary: 'Custom summary text',
          },
        ],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      const item = linkItems.toc[0];
      expect(component['getPrimaryText'](item)).toBe('Some label');
      expect(component['getSummaryText'](item)).toBe('Custom summary text');
    });
  });

  describe('canSave', () => {
    it('should be disabled for external-reference without URL', () => {
      fixture.componentRef.setInput('highlightedText', 'link text');
      fixture.detectChanges();

      expect(component['canSave']()).toBe(false);
    });

    it('should be enabled for external-reference with URL and display text', () => {
      fixture.componentRef.setInput('highlightedText', 'link text');
      fixture.detectChanges();

      component['externalUrl'].set('https://example.com');
      fixture.detectChanges();

      expect(component['canSave']()).toBe(true);
    });

    it('should be disabled for within-document without selected item', () => {
      fixture.componentRef.setInput('highlightedText', 'link text');
      fixture.componentRef.setInput('linkItems', EMPTY_LINK_ITEMS);
      fixture.detectChanges();

      component['selectTab']('within-document');
      fixture.detectChanges();

      expect(component['canSave']()).toBe(false);
    });

    it('should be enabled for within-document with selected item and display text', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [{ id: '#item1', label: 'Item 1' }],
      };

      fixture.componentRef.setInput('highlightedText', 'link text');
      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['selectTab']('within-document');
      component['selectItem'](linkItems.toc[0]);
      fixture.detectChanges();

      expect(component['canSave']()).toBe(true);
    });

    it('should be disabled without display text', () => {
      fixture.componentRef.setInput('highlightedText', '   ');
      fixture.componentRef.setInput('initialUrl', 'https://example.com');
      fixture.detectChanges();

      expect(component['canSave']()).toBe(false);
    });
  });

  describe('save', () => {
    it('should emit save event for external-reference with url', () => {
      fixture.componentRef.setInput('highlightedText', 'link text');
      fixture.componentRef.setInput('initialUrl', 'https://example.com');
      fixture.detectChanges();

      const events: LinkToolSaveEvent[] = [];
      component.saveLink.subscribe((event) => events.push(event));

      component['save']();

      expect(events.length).toBe(1);
      expect(events[0].tab).toBe('external-reference');
      expect(events[0].url).toBe('https://example.com');
      expect(events[0].highlightedText).toBe('link text');
      expect(events[0].category).toBeUndefined();
    });

    it('should emit save event for within-document with target and category', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        toc: [{ id: '#item1', label: 'Item 1' }],
      };

      fixture.componentRef.setInput('highlightedText', 'link text');
      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.detectChanges();

      component['selectTab']('within-document');
      component['selectItem'](linkItems.toc[0]);
      fixture.detectChanges();

      const events: LinkToolSaveEvent[] = [];
      component.saveLink.subscribe((event) => events.push(event));

      component['save']();

      expect(events.length).toBe(1);
      expect(events[0].tab).toBe('within-document');
      expect(events[0].url).toBeUndefined();
      expect(events[0].target?.id).toBe('#item1');
      expect(events[0].category).toBe('toc');
    });

    it('should not emit when canSave is false', () => {
      fixture.componentRef.setInput('highlightedText', '');
      fixture.detectChanges();

      const events: LinkToolSaveEvent[] = [];
      component.saveLink.subscribe((event) => events.push(event));

      component['save']();

      expect(events.length).toBe(0);
    });
  });

  describe('close', () => {
    it('should emit closeTool event', () => {
      let closed = false;
      component.closeTool.subscribe(() => (closed = true));

      component['close']();

      expect(closed).toBe(true);
    });
  });

  describe('findLinkItem with nested children', () => {
    it('should find a link item nested inside children', () => {
      const linkItems: Record<LinkToolCategory, LinkToolItem[]> = {
        ...EMPTY_LINK_ITEMS,
        figures: [
          {
            id: '#parent-fig',
            label: 'Parent Figure',
            children: [{ id: '#nested-fig', label: 'Nested Figure' }],
          },
        ],
      };

      fixture.componentRef.setInput('linkItems', linkItems);
      fixture.componentRef.setInput('initialUrl', '#nested-fig');
      fixture.detectChanges();

      expect(component['activeCategory']()).toBe('figures');
      expect(component['selectedItem']()?.id).toBe('#nested-fig');
    });
  });
});
