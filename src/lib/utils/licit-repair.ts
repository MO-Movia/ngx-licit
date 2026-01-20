/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { debounceTime, firstValueFrom, map, Subject, timeout } from 'rxjs';
import type { LicitNode, LicitDocument } from '../models/licit-document';
import { blankNode, textNode } from './licit-gen';
import ReactDOM from 'react-dom/client';
import { Licit, LicitProps } from '@modusoperandi/licit-tiptap/licit';
import type { Plugin } from '@tiptap/pm/state';
import React, { ComponentClass } from 'react';

/**
 * Repairs simple errors in a licit document.
 * @param docJson
 * @returns
 */
export function repairDoc(docJson: LicitDocument): LicitDocument {
  const clonedJSON = structuredClone(docJson);
  for (const node of clonedJSON?.content ?? []) {
    processNodeContent(node);
  }
  return clonedJSON;
}

function processNodeContent(node: LicitNode): void {
  if (node.type === 'horizontal_rule') {
    node.type = 'horizontalRule';
  }
  if (!node?.content?.length) {
    return;
  }
  node.content = node.content.map((content) => {
    switch (content?.type) {
      case 'text':
        repairTextNode(content);
        break;
      case 'table_cell':
        content.type = 'tableCell'; // czi to tiptap type
        repairTableCellNode(content);
        break;
      case 'table_header':
        content.type = 'tableHeader'; // czi to tiptap type
        repairTableCellNode(content);
        break;
      case 'table_row':
        content.type = 'tableRow'; // czi to tiptap type
        break;
      case 'hard_break':
        content.type = 'hardBreak'; // czi to tiptap type
        break;
      case 'horizontal_rule':
        content.type = 'horizontalRule'; // czi to tiptap type
        break;
    }
    if (Array.isArray(content?.content)) {
      processNodeContent(content);
    }
    return content;
  });
}
function repairTextNode(content: LicitNode): void {
  content.text ??= ' ';
}

function repairTableCellNode(content: LicitNode): void {
  if (
    Array.isArray(content.attrs?.colwidth) &&
    content.attrs.colwidth[0] == null
  ) {
    content.attrs.colwidth = null;
  }
  if(content?.attrs?.background)
  content.attrs.backgroundColor = content.attrs?.background;
  if (!content.content?.length) {
    content.content = [
      {
        ...blankNode('paragraph'),
        content: [textNode()],
      },
    ];
  }
}

/**
 * Runs the document through an editor to get the normalized document json.
 * @param doc to normalize
 * @param plugins to use with editor
 * @param debounce delay to use to consider the editor stable
 * @returns Promise that returns the normalized document. Promise is rejected if the editor rejects the document after.
 */
export async function normalizeDoc(
  doc: LicitDocument,
  plugins: Plugin[],
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
    readOnly: true,
    disabled: false,
    embedded: false,
    height: '100vh',
    width: '100vw',
    onChange: (doc) => subject.next(doc as LicitDocument),
    onReady: (licit) =>
      subject.next(licit.editorView?.state.doc as unknown as LicitDocument),
  };
  const root = ReactDOM.createRoot(div, {
    // onCaughtError: catchErr,
    onRecoverableError: catchErr,
    // onUncaughtError: catchErr,
  });
  try {
    root.render(
      React.createElement(Licit as unknown as ComponentClass<LicitProps>, props)
    );
    // May trigger cascade of updates, wait for document to be "stable". Timeout as failsafe for when react doesn't respond.
    return await firstValueFrom(
      subject.pipe(
        timeout(debounce * 2),
        debounceTime(debounce),
        // normalize ProseMirror Node to plain JSON object.
        map((d) => structuredClone(d))
      )
    );
  } finally {
    root.unmount();
    div.remove();
  }
}
