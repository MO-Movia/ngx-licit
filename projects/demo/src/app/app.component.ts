/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnhancedTableFigure } from '@modusoperandi/licit-tiptap/plugins/block-control';
import { LicitHighlightTextPlugin } from '@modusoperandi/licit-tiptap/plugins/highlight';
import {
  LicitDocument,
  LicitEditorComponent,
  LocalRuntime,
  RuntimeService,
} from '../../../../src/public-api';
import {
  blankDocument,
  blankNode,
  textNode,
} from '@modusoperandi/licit-tiptap/utils';
import { MultimediaPlugin } from '@modusoperandi/licit-tiptap/plugins/multimedia';
import { InfoIconPlugin } from '@modusoperandi/licit-tiptap/plugins/info-icon';
import { GlossaryPlugin } from '@modusoperandi/licit-tiptap/plugins/glossary';
import { TableExtensionPlugin } from '@modusoperandi/licit-tiptap/plugins/table-mods';
import { VignettePlugins } from '@modusoperandi/licit-tiptap/plugins/vignette';
import { RichCopyEmbedImagePlugin } from '@modusoperandi/licit-tiptap/plugins/copy-images';
import { PasteJSONPlugin } from '@modusoperandi/licit-tiptap/plugins/paste-json';
import { CustomstylePlugin } from '@modusoperandi/licit-tiptap/plugins/custom-styles';
import { CitationPlugin } from '@modusoperandi/licit-tiptap/plugins/citation';
import { ObjectIdPlugin } from '@modusoperandi/licit-tiptap/plugins/object-id';
import { ExportPDFPlugin } from '@modusoperandi/licit-tiptap/plugins/export-pdf';
import { ChangeCasePlugin } from '@modusoperandi/licit-tiptap/plugins/change-case';
import { FloatingMenuPlugin } from '@modusoperandi/licit-tiptap/plugins/floating-menu';
import {
  CapcoPlugin,
  CAPCOMODE,
  SYSTEMCAPCO,
} from '@modusoperandi/licit-tiptap/plugins/capco';
import { DocumentImporterService } from './document-importer.service';
import type { Plugin } from 'prosemirror-state';

@Component({
  selector: 'licit-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LicitEditorComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly ro = model<boolean>(false);
  title = 'demo';
  doc = model<LicitDocument>({
    ...blankDocument(
      ...new Array(100)
        .fill(null)
        .map((_, i) =>
          blankNode(
            'paragraph',
            textNode(
              `Para ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer id ipsum nunc. Pellentesque ultrices interdum ornare. Nunc vestibulum nec lacus vitae tincidunt. Vestibulum quis viverra neque. Ut egestas orci sed velit pulvinar suscipit. Ut sed porttitor tellus, eu cursus odio. Mauris neque enim, eleifend ac mauris ut, maximus consectetur nisl. Nulla ligula eros, egestas vel orci in, mattis euismod leo. Sed varius volutpat sapien, eu imperdiet nibh mattis a. Quisque nec laoreet eros.`
            )
          )
        )
    ),
  });
  protected loading = signal(false);
  protected docJsonData = computed(() => {
    return encodeURIComponent(JSON.stringify(this.doc(), null, 4));
  });
  constructor(
    private readonly localRuntime: LocalRuntime,
    private readonly importer: DocumentImporterService
  ) {
    effect(() => {
      this.localRuntime.setDocument(this.doc());
    });
  }
  protected runtime = new RuntimeService(this.localRuntime);
  dummyFloatRuntime = {
    isReadonly: false,
    createSlice: (slice: { id?: string; ids?: string[] }) =>
      Promise.resolve({
        name: 'asd',
        description: 'asdffggg',
        id: slice?.id ?? 'dummy-slice-id',
        referenceType: 'type',
        source: 'source',
        from: 'from',
        to: 'to',
        ids: slice?.ids ?? ['id1', 'id2'],
      }),

    retrieveSlices: () => Promise.resolve([]),

    insertInfoIconFloat: () => {
      // no-op
    },

    insertCitationFloat: () => {
      // no-op
    },

    insertReference: () =>
      Promise.resolve({
        name: 'asd',
        description: 'asdffggg',
        id: 'dummy-slice-id',
        referenceType: 'type',
        source: 'source',
        from: 'from',
        to: 'to',
        ids: ['id1', 'id2'],
      }),
  };
  floatingMenuHandlers = {
    enableCitationAndComment: () => true,
    enableTagAndInfoicon: () => true,
    enableCopy: () => true,
    enablePaste: () => true,
    enablePasteAsReference: () => true,

    addComment: () => console.warn('Add Comment'),
    addTag: () => console.warn('Add Tag'),
    createCitation: () => console.warn('Create Citation'),
    createInfoIcon: () => console.warn('Create Infoicon'),
    copyRich: () => console.warn('Copy'),
    copyPlain: () => console.warn('Copy Plain'),
    paste: () => console.warn('Paste'),
    pastePlain: () => console.warn('Paste Plain'),
    pasteAsReference: () => console.warn('Paste As Reference'),
    createSlice: () => console.warn('Create Referent'),
    showReferences: () => console.warn('Insert Reference'),
  };

  getPlugins = computed(() => {
    const edit = true,
      showCapco = true,
      hideNumbering = false;
    return [
      new LicitHighlightTextPlugin(),
      new EnhancedTableFigure(),
      new MultimediaPlugin(),
      new InfoIconPlugin(),
      new GlossaryPlugin(),
      new TableExtensionPlugin(),
      ...VignettePlugins,
      ...(showCapco
        ? [
            new CapcoPlugin(CAPCOMODE.FORCED, SYSTEMCAPCO.TBD, {
              capcoService: {
                openManagementDialog: () => Promise.resolve(null),
                saveCapco: () => Promise.resolve(true),
                getCapco: () => Promise.resolve([]),
              },
            }),
          ]
        : []),
      ...(edit
        ? [
            new CustomstylePlugin(this.runtime, hideNumbering),
            new RichCopyEmbedImagePlugin(),
            new PasteJSONPlugin(),
          ]
        : []),
      new ExportPDFPlugin(true),
      new CitationPlugin(),
      new ObjectIdPlugin(),
      new ChangeCasePlugin(),
      new FloatingMenuPlugin(
        this.dummyFloatRuntime,
        {} // UrlConfig (optional)
      ),
    ] as Plugin[];
  });

  async importJson(file?: File) {
    if (!file) {
      return;
    }

    this.loading.set(true);
    try {
      this.doc.set(
        (await this.importer.parseJsonFile(file)) as unknown as LicitDocument
      );
    } finally {
      this.loading.set(false);
    }
  }

  async importDocx(file?: File, type?: string) {
    if (!file) {
      return;
    }

    this.loading.set(true);
    try {
      this.doc.set(
        (await this.importer.parseDocxFile(
          file,
          type
        )) as unknown as LicitDocument
      );
    } finally {
      this.loading.set(false);
    }
  }

  async importFrameMaker(file?: File) {
    if (!file) {
      return;
    }

    this.loading.set(true);
    try {
      this.doc.set(
        (await this.importer.parseFMZip(file)) as unknown as LicitDocument
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected onEditorChange(data: LicitDocument): void {
    this.localRuntime.setDocument(data);
  }
}
