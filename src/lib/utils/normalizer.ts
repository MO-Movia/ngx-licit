/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { debounceTime, firstValueFrom, map, Subject, timeout } from 'rxjs';
import ReactDOM from 'react-dom/client';
import { Licit, LicitProps } from '@modusoperandi/licit-tiptap/licit';
import type { Plugin } from '@tiptap/pm/state';
import React from 'react';
import { LicitDocument } from '../models/licit-document';
import { repairDoc } from '@modusoperandi/licit-tiptap/utils';

/**
 * Runs the document through an editor to get the normalized document json.
 * @param doc to normalize
 * @param plugins to use with editor
 * @param debounce delay to use to consider the editor stable
 * @returns Promise that returns the normalized document. Promise is rejected if the editor rejects the document after.
 */
export async function normalizeDoc(
  doc: LicitDocument,
  plugins: Plugin[] = [],
  debounce = 1000
): Promise<LicitDocument> {
  const div = document.createElement('div');
  div.hidden = true;
  document.body.appendChild(div);
  const subject = new Subject<LicitDocument>();
  const catchErr = (err: unknown) => subject.error(err);
  const props: LicitProps = {
    data: repairDoc(doc),
    plugins,
    readOnly: false,
    disabled: false,
    embedded: false,
    height: '100vh',
    width: '100vw',
    onChange: (doc) => subject.next(doc as LicitDocument),
    onReady: (licit) =>
      subject.next(licit.editorView?.state.doc as unknown as LicitDocument),
  };
  const root = ReactDOM.createRoot(div, {
    onRecoverableError: catchErr,
  });
  try {
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(Licit, props)
      )
    );
    // May trigger cascade of updates, wait for document to be "stable". Timeout as failsafe for when react doesn't respond.
    return await firstValueFrom(
      subject.pipe(
        timeout(debounce * 2),
        debounceTime(debounce),
        // normalize ProseMirror Node to plain JSON object.
        map((d) => JSON.parse(JSON.stringify(d)) as LicitDocument) //NOSONAR structuredClone does not work on objects with functions.
      )
    );
  } finally {
    root.unmount();
    div.remove();
  }
}
