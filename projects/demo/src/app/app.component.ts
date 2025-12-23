/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, model } from '@angular/core';
import { EnhancedTableFigure } from '@modusoperandi/licit-tiptap/plugins/block-control';
import { LicitHighlightTextPlugin } from '@modusoperandi/licit-tiptap/plugins/highlight';
import {
  blankDocument,
  LicitEditorComponent,
  RuntimeService,
} from '@modusoperandi/ngx-licit';
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
import { ReferencingPlugin } from '@modusoperandi/licit-referencing';
import { FloatingMenuPlugin } from '@modusoperandi/licit-floatingmenu';
import { ExportPDFPlugin } from '@modusoperandi/licit-tiptap/plugins/export-pdf';
import { ChangeCasePlugin } from '@modusoperandi/licit-tiptap/plugins/change-case';
import {
  CapcoPlugin,
  CAPCOMODE,
  SYSTEMCAPCO,
} from '@modusoperandi/licit-capco';
import { FloatRuntime } from '@modusoperandi/licit-floatingmenu/model';

@Component({
  selector: 'licit-root',
  imports: [LicitEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'demo';
  doc = model({
    ...blankDocument(),
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  });
  constructor(private readonly runtime: RuntimeService) {}
  // bug in capco plugin will lock up browser without runtime.
  getPlugins(edit = true, showCapco = false, hideNumbering = false) {
    return [
      new LicitHighlightTextPlugin(),
      new EnhancedTableFigure(),
      new MultimediaPlugin(),
      new InfoIconPlugin(),
      new GlossaryPlugin(),
      new TableExtensionPlugin(),
      ...VignettePlugins,
      ...(showCapco
        ? [new CapcoPlugin(CAPCOMODE.FORCED, SYSTEMCAPCO.TBD)]
        : []),
      ...(edit
        ? [
            new CustomstylePlugin(this.runtime, hideNumbering),
            new RichCopyEmbedImagePlugin(),
            new PasteJSONPlugin(),
          ]
        : []),
      new ExportPDFPlugin(true),
      new ReferencingPlugin(),
      new FloatingMenuPlugin({} as FloatRuntime),
      new CitationPlugin(),
      new ObjectIdPlugin(),
      new ChangeCasePlugin(),
    ];
  }
}
