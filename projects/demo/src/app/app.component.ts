/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, model } from '@angular/core';
import { EnhancedTableFigure } from '@modusoperandi/licit-contrib-plugin-block-control';
import { LicitHighlightTextPlugin } from '@modusoperandi/licit-plugin-highlight';
import { blankDocument, LicitEditorComponent, RuntimeService } from '@modusoperandi/ngx-licit';
import { MultimediaPlugin } from '@modusoperandi/licit-multimedia';
import { InfoIconPlugin } from '@modusoperandi/licit-info-icon';
import { GlossaryPlugin, IndexItem } from '@modusoperandi/licit-glossary';
import { TableExtensionPlugin } from '@modusoperandi/licit-table-mods';
import { VignettePlugins } from '@modusoperandi/licit-vignette';
import { RichCopyEmbedImagePlugin } from '@mo/licit-rich-copy-embed-images';
import { CAPCOMODE, CapcoPlugin, SYSTEMCAPCO } from '@mo/licit-capco';
import { PasteJSONPlugin } from '@modusoperandi/licit-paste-json';
import { CustomstylePlugin } from '@modusoperandi/licit-custom-styles';
import { CitationPlugin } from '@modusoperandi/licit-citation';
import { ObjectIdPlugin } from '@mo/licit-object-id';
import { ReferencingPlugin } from '@mo/licit-referencing';
import { ExportPDFPlugin } from '@modusoperandi/licit-export-pdf';

// import { ChangeCasePlugin } from '@modusoperandi/licit-plugin-contrib-change-case';

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
      content: []
    }
  ]
});
  constructor(private runtime: RuntimeService) {

  }
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
        ? [
            new CapcoPlugin(CAPCOMODE.FORCED, SYSTEMCAPCO.TBD),
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
        new ReferencingPlugin(),
        new CitationPlugin(),
        new ObjectIdPlugin()
        //new ChangeCasePlugin()
    ];
  }
}
