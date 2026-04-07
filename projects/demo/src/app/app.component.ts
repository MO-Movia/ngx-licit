/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  model,
  signal,
} from '@angular/core';
import { EnhancedTableFigure } from '@modusoperandi/licit-tiptap/plugins/block-control';
import { LicitHighlightTextPlugin } from '@modusoperandi/licit-tiptap/plugins/highlight';
import {
  LicitDocument,
  LicitEditorComponent,
  LocalRuntime,
  RuntimeService,
} from '@modusoperandi/ngx-licit';
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
  imports: [LicitEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
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
  ) {}
  protected runtime = new RuntimeService(this.localRuntime);
  // bug in capco plugin will lock up browser without runtime.
  dummyFloatRuntime = {
    isReadonly: false, // Need to get from KNITE
    createSlice: async (slice: any) => {
      return {
        name: 'asd',
        description:'asdffggg',
        id: slice?.id ?? 'dummy-slice-id',
        referenceType:'type',
        source:'source',
        from:'from',
        to:'to',
        ids: slice?.ids ?? ['id1', 'id2'],

      };
    },

    retrieveSlices: async () => {
      return [];
    },

    insertInfoIconFloat: () => {
      // no-op
    },

    insertCitationFloat: () => {
      // no-op
    },

    insertReference: async () => {
      return  {
        name: 'asd',
        description:'asdffggg',
        id:   'dummy-slice-id',
        referenceType:'type',
        source:'source',
        from:'from',
        to:'to',
        ids:   ['id1', 'id2'],

      };
    },
  };
  floatingMenuHandlers = {
    enableCitationAndComment: () => true,
    enableTagAndInfoicon: () => true,
    enableCopy: () => true,
    enablePaste: () => true,
    enablePasteAsReference: () => true,

    addComment: () => console.log('Add Comment'),
    addTag: () => console.log('Add Tag'),
    createCitation: () => console.log('Create Citation'),
    createInfoIcon: () => console.log('Create Infoicon'),
    copyRich: () => console.log('Copy'),
    copyPlain: () => console.log('Copy Plain'),
    paste: () => console.log('Paste'),
    pastePlain: () => console.log('Paste Plain'),
    pasteAsReference: () => console.log('Paste As Reference'),
    createSlice: () => console.log('Create Referent'),
    showReferences: () => console.log('Insert Reference'),
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
}
