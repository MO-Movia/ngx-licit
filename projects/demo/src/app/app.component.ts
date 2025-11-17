/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Component, model } from '@angular/core';
import { blankDocument, LicitEditorComponent } from '@modusoperandi/ngx-licit';

@Component({
  selector: 'licit-root',
  imports: [LicitEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'demo';
  doc = model(blankDocument());
}
