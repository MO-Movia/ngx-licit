/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export type LinkToolTab =
  | 'external-reference'
  | 'within-document'
  | 'within-external-document';
export type LinkToolCategory = 'toc' | 'figures' | 'tables' | 'paragraphs';

export interface LinkToolItem {
  id: string;
  label: string;
  summary?: string;
  children?: LinkToolItem[];
}

export interface LinkToolDocument {
  id: string;
  title: string;
}

export interface LinkToolSaveEvent {
  tab: LinkToolTab;
  highlightedText: string;
  linkDisplayText: string;
  url?: string;
  document?: LinkToolDocument;
  target?: LinkToolItem;
  category?: LinkToolCategory;
}

const EMPTY_LINK_ITEMS: Record<LinkToolCategory, LinkToolItem[]> = {
  toc: [],
  figures: [],
  tables: [],
  paragraphs: [],
};
const SENTENCE_BOUNDARY = /[A-Za-z)]\.\s+/;

/**
 * Link tool dialog UI for external, internal, and external-document links.
 */
@Component({
  imports: [CommonModule, FormsModule],
  selector: 'licit-link-tool',
  templateUrl: './link-tool.component.html',
  styleUrls: ['./link-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoLinkToolComponent {
  public highlightedText = input<string>('');
  public initialUrl = input<string>('');
  public linkItems =
    input<Record<LinkToolCategory, LinkToolItem[]>>(EMPTY_LINK_ITEMS);
  public documents = input<LinkToolDocument[]>([]);

  public saveLink = output<LinkToolSaveEvent>();
  public closeTool = output<void>();

  protected readonly tabs: {
    id: LinkToolTab;
    label: string;
    disabled?: boolean;
  }[] = [
    { id: 'external-reference', label: 'Link to External Reference' },
    { id: 'within-document', label: 'Links Within this Document' },
    {
      id: 'within-external-document',
      label: 'Links Within External Document',
      disabled: true,
    },
  ];

  protected readonly categories: { id: LinkToolCategory; label: string }[] = [
    { id: 'toc', label: 'ToC' },
    { id: 'figures', label: 'Figures' },
    { id: 'tables', label: 'Tables' },
    { id: 'paragraphs', label: 'Paragraphs' },
  ];

  protected readonly activeTab = model<LinkToolTab>('external-reference');
  protected readonly activeCategory = model<LinkToolCategory>('toc');
  protected readonly externalUrl = model<string>('');
  protected readonly editableHighlightedText = model<string>('');
  protected readonly documentFilter = model<string>('');
  protected readonly itemFilter = model<string>('');
  protected readonly selectedItem = model<LinkToolItem | undefined>(undefined);
  protected readonly selectedDocument =
    model<LinkToolDocument | undefined>(undefined);
  protected readonly expandedItemIds = model<ReadonlySet<string>>(new Set());

  constructor() {
    effect(() => {
      const initialUrl = this.initialUrl();
      if (this.isSameDocumentLink(initialUrl)) {
        this.activeTab.set('within-document');
        this.externalUrl.set('');
        return;
      }

      this.externalUrl.set(initialUrl);
    });
    effect(() => {
      this.editableHighlightedText.set(this.highlightedText());
    });
    effect(() => {
      this.expandedItemIds.set(
        new Set(this.linkItems()[this.activeCategory()].map((item) => item.id))
      );
    });
    effect(() => {
      const initialUrl = this.initialUrl();
      if (!this.isSameDocumentLink(initialUrl)) {
        return;
      }

      const selectedLink = this.findLinkItem(initialUrl);
      if (!selectedLink) {
        return;
      }

      this.activeCategory.set(selectedLink.category);
      this.selectedItem.set(selectedLink.item);
    });
  }

  protected readonly visibleItems = computed(() =>
    this.filterItems(this.linkItems()[this.activeCategory()], this.itemFilter())
  );

  protected readonly canSave = computed(() => {
    const hasDisplayText = this.editableHighlightedText().trim().length > 0;
    if (this.activeTab() === 'external-reference') {
      return this.externalUrl().trim().length > 0 && hasDisplayText;
    }
    if (this.activeTab() === 'within-external-document') {
      return Boolean(
        this.selectedDocument() && this.selectedItem() && hasDisplayText
      );
    }
    return Boolean(this.selectedItem() && hasDisplayText);
  });

  protected selectTab(tab: LinkToolTab): void {
    if (tab === 'within-external-document') {
      return;
    }

    this.activeTab.set(tab);
    this.itemFilter.set('');
    this.selectedItem.set(undefined);
  }

  protected selectCategory(category: LinkToolCategory): void {
    this.activeCategory.set(category);
    this.itemFilter.set('');
    this.selectedItem.set(undefined);
    this.expandedItemIds.set(
      new Set(this.linkItems()[category].map((item) => item.id))
    );
  }

  protected selectDocument(documentId: string): void {
    this.selectedDocument.set(
      this.documents().find((document) => document.id === documentId)
    );
    this.selectedItem.set(undefined);
  }

  protected selectItem(item: LinkToolItem): void {
    this.selectedItem.set(item);
  }

  protected isExpanded(item: LinkToolItem): boolean {
    return (
      this.itemFilter().trim().length > 0 || this.expandedItemIds().has(item.id)
    );
  }

  protected toggleItem(item: LinkToolItem, event: Event): void {
    event.stopPropagation();
    if (!item.children?.length) {
      this.selectItem(item);
      return;
    }

    const expandedIds = new Set(this.expandedItemIds());
    if (expandedIds.has(item.id)) {
      expandedIds.delete(item.id);
    } else {
      expandedIds.add(item.id);
    }
    this.expandedItemIds.set(expandedIds);
  }

  protected getPrimaryText(item: LinkToolItem): string {
    if (item.summary || !this.shouldSplitItemText()) {
      return item.label;
    }

    const splitIndex = this.getSentenceSplitIndex(item.label);
    return splitIndex === -1 ? item.label : item.label.slice(0, splitIndex);
  }

  protected getSummaryText(item: LinkToolItem): string {
    if (item.summary) {
      return item.summary;
    }

    if (!this.shouldSplitItemText()) {
      return '';
    }

    const splitIndex = this.getSentenceSplitIndex(item.label);
    return splitIndex === -1
      ? ''
      : item.label.slice(splitIndex).replace(/^\s+/, '');
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }

    const link = this.getSelectedLink();
    this.saveLink.emit({
      tab: this.activeTab(),
      highlightedText: this.editableHighlightedText().trim(),
      linkDisplayText: this.editableHighlightedText().trim(),
      url: this.activeTab() === 'external-reference' ? link : undefined,
      document:
        this.activeTab() === 'within-external-document'
          ? this.selectedDocument()
          : undefined,
      target: this.selectedItem(),
      category:
        this.activeTab() === 'external-reference'
          ? undefined
          : this.activeCategory(),
    });
  }

  protected close(): void {
    this.closeTool.emit();
  }

  protected shouldSplitItemText(): boolean {
    return ['toc', 'paragraphs'].includes(this.activeCategory());
  }

  private getSentenceSplitIndex(text: string): number {
    const sentenceBoundary = SENTENCE_BOUNDARY.exec(text);
    return sentenceBoundary
      ? sentenceBoundary.index + sentenceBoundary[0].replace(/\s+$/, '').length
      : -1;
  }

  private filterItems(items: LinkToolItem[], query: string): LinkToolItem[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.reduce<LinkToolItem[]>((filteredItems, item) => {
      const children = item.children
        ? this.filterItems(item.children, normalizedQuery)
        : [];
      const itemText = `${item.label} ${item.summary ?? ''}`.toLowerCase();
      if (this.matchesFilter(itemText, normalizedQuery)) {
        filteredItems.push({ ...item });
      } else if (children.length) {
        filteredItems.push({ ...item, children });
      }
      return filteredItems;
    }, []);
  }

  private matchesFilter(text: string, query: string): boolean {
    return text.includes(query);
  }

  private getSelectedLink(): string {
    if (this.activeTab() === 'external-reference') {
      return this.externalUrl().trim();
    }
    return this.selectedItem()?.id ?? '';
  }

  private isSameDocumentLink(link: string): boolean {
    return link.trim().startsWith('#');
  }

  private findLinkItem(
    link: string
  ): { category: LinkToolCategory; item: LinkToolItem } | undefined {
    for (const category of this.categories) {
      const item = this.findItemById(this.linkItems()[category.id], link);
      if (item) {
        return { category: category.id, item };
      }
    }

    return undefined;
  }

  private findItemById(
    items: LinkToolItem[],
    itemId: string
  ): LinkToolItem | undefined {
    for (const item of items) {
      if (item.id === itemId) {
        return item;
      }

      const child = item.children
        ? this.findItemById(item.children, itemId)
        : undefined;
      if (child) {
        return child;
      }
    }

    return undefined;
  }

}
