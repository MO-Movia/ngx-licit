/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {
  ElementRef,
  OnDestroy,
  Component,
  HostListener,
  ChangeDetectionStrategy,
  computed,
  input,
  output,
  effect,
  inject,
} from '@angular/core';

// React stuff
import ReactDOM from 'react-dom/client';

// Licit stuff
import type {
  EditorRuntime,
  LicitProps,
  LicitHandle,
} from '@modusoperandi/licit-tiptap';
import { Licit } from '@modusoperandi/licit-tiptap';
import { RuntimeService } from './runtime.service';
import type { LicitDocument } from './models/licit-document';
import { setRuntime } from '@modusoperandi/licit-tiptap/commands';
import { repairDoc } from './utils/licit-repair';
import { isDirty } from './utils';
import { JSONContent } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import React from 'react';

/**
 * Default behavior is to fill area
 */
export const FILL = '100%';
/**
 * CSS class applied to the editable area of the editor.
 */
export const EDITOR = '.czi-prosemirror-editor';
/**
 * CSS class applied to the wrapper around the editable area
 */
export const FRAME = '.czi-editor-frame-body';

/**
 * Angular wrapper around Licit react component.
 * @since 0.3.0
 */
@Component({
  selector: 'licit-editor',
  template: '',
  styleUrls: ['./editor.component.scss'],
  // Changes from here down are handled by React
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicitEditorComponent implements OnDestroy {
  /**
   * host for Licit (React) component
   */
  private root!: ReactDOM.Root;

  /**
   * Contains the current editor instance.
   */
  public licit?: LicitHandle;

  /**
   * Event fired when Licit Editor declares itself ready.
   */
  readonly editorReady = output<LicitHandle>();

  /**
   * Event fired when Licit Editor declares itself ready.
   * @since 0.3.8
   */
  readonly editorChange = output<{
    data: LicitDocument;
    isEmpty: boolean;
  }>();

  // #region Licit Properties
  /**
   * Show or hide prosemirror dev tools (flaky operation)
   */
  debug = input<boolean>(false);

  /**
   * Setter for use in read-only mode to set content.
   * For use when FormsModule|ReactiveFormsModule are not needed.
   */
  doc = input.required<LicitDocument>();

  /**
   * wether the editor should try to fix minor mistakes in the json. Default true.
   *
   * If set to false, you are responsible for handling {@link repairDoc} as nessesary.
   */
  repair = input(true);

  /**
   * Id of the collaborative document
   * (requires collaboration server)
   */
  docID = input<string>('');

  /**
   * Document Type
   */
  docType = input<string>();

  /**
   * Sets embedded property of the react component.
   *
   * @param embedded The new value to set.
   */
  embedded = input<boolean>(true);

  /**
   * Sets height property of the react component.
   *
   * @param height The new value to set.
   */
  height = input<string>();

  /**
   * Sets readOnly property of the react component.
   *
   * @param readOnly The new value to set.
   */
  readOnly = input<boolean>(true);

  /**
   * Sets width property of the react component.
   *
   * @param width The new value to set.
   */
  width = input<string>();

  theme = input<string>();

  /**
   * Sets plugins to use for current instance
   */
  plugins = input<Plugin[]>([]);

  /**
   * Sets the referenced json.
   *
   * @param reference The new value to set.
   */
  reference = input<string>();

  /**
   * If the editor contents have been saved.
   * If set, this value will be used for the unload guard. If not set guard will check if the editor contents are dirty.
   * Set to false to disable unload guard.
   * Does not affect navigation within the app.
   * To prevent navigation within the app use a route guard with {@link isDirty} or your `saved` value.
   *
   * Note that editor plugins may have modified the document without user input.
   *
   * @param saved If the current document is saved.
   */
  saved = input<boolean | undefined | null>(undefined);

  /**
   * React component properties.
   */
  private readonly props = computed<LicitProps>(() => ({
    // Document used to initialize editor
    data: this.repair() ? repairDoc(this.doc()) : this.doc(),
    // When true, enables some debugging features in editor.
    debug: this.debug(),
    // Disables the control.
    disabled: false,
    // When collaboration is enabled, identifies server session.
    // This wrapper is not for collaborative editing.
    docID: this.docID(),
    // Default embedded to true
    embedded: this.embedded(),
    // The height of the editor.
    // height: FILL,
    // Called by editor when a change happens.
    onChange: (data: JSONContent, isEmpty: boolean) => {
      Object.assign(this.props, { data });
      this.editorChange.emit({ data: data as LicitDocument, isEmpty });
    },
    // When true editor will not show toolbar.
    readOnly: this.readOnly(),
    // Called by licit when react component is ready.
    onReady: (licit: LicitHandle) => {
      this.licit = licit;
      this.editorReady.emit(this.licit);
    },
    // Width of the editor
    // width: FILL,
    // Runtime for uploading images
    // Typing issues between diffrent runtime definitions prevent proper fix. Fix once all Licit Type issues are resolved.
    runtime: this.runtime as unknown as EditorRuntime,
    // Plugins for editor
    // Enable ObjectIdPlugin and CustomstylePlugin by default
    plugins: this.plugins(),
    height: this.height(),
    width: this.width(),
    theme: this.theme(),
  }));
  //#endregion

  private readonly runtime = inject(RuntimeService);
  private readonly el = inject(ElementRef);

  /**
   * Instances get constructed by angular
   *
   * @param runtime Implementation of licit runtime.
   * @param el Host element provided by angular.
   */
  constructor() {
    setRuntime(this.runtime);
    effect(() => {
      this.runtime.styleProps = undefined; // resetting to get fresh styles.
      this.runtime.documentType = this.docType();
    });
    effect(() => {
      const reference = this.reference();
      if (reference) {
        this.licit?.insertJSON(JSON.parse(reference) as JSONContent);
      }
    });
    effect(() => {
      this.root?.unmount();
      // props are frozen by react, need to recreate. Reuse the root so React state persists.
      this.root = ReactDOM.createRoot(this.el.nativeElement);
      this.root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(Licit, this.props())
        )
      );
    });
  }
  /**
   * Called by angular to clean up component.
   */
  ngOnDestroy() {
    // Clean up the react stuff
    this.root.unmount();
  }

  /**
   * Checks if the editor contains unsaved edits. Usefull for Route Guard function.
   * @returns True if document is loaded and contians edits.
   */
  isDirty(): boolean {
    return isDirty(this.licit?.editor?.state.doc);
  }

  /**
   * Listens for click events on component.
   *
   * @param target HTML element that was clicked.
   */
  @HostListener('click', ['$event.target'])
  protected onComponentClick(target?: EventTarget | null): void {
    // Click is outside editor area but inside the frame.
    if (
      target instanceof Element &&
      !target?.closest(EDITOR) &&
      target?.closest(FRAME)
    ) {
      // Return focus to the editor with cursor at end of document.
      // A kludge here to get editorView because of a regression bug.
      this.licit?.goToEnd();
    }
  }

  /**
   * Handler to prevent unloading the page if the document is dirty.
   * @param event fired
   * @returns true if document is dirty
   */
  @HostListener('window:beforeunload', ['$event'])
  protected beforeUnloadHander(event: BeforeUnloadEvent) {
    if (this.saved() ?? (this.readOnly() || !this.isDirty())) {
      return false;
    }
    event.preventDefault();
    return true;
  }
}
