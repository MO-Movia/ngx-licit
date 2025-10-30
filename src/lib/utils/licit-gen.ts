/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { LicitNode, LicitDocument } from '../models/licit-document';
import type { EditorState } from 'prosemirror-state';
import type { Schema } from 'prosemirror-model';
const PM_DOC = 'doc';

/**
 * Create a blank document.
 *
 * This only creates a minimal document. Prefer {@link blankDocumentfromEditor} or {@link blankDocumentfromSchema} for a more complete result.
 *
 * @returns document
 */
export function blankDocument(): LicitDocument {
  return {
    type: PM_DOC,
    attrs: {},
  };
}
/**
 * Create a blank document node.
 *
 * @returns document node
 */
export function blankNode(type: string): LicitNode {
  return {
    type,
    attrs: {},
  };
}
/**
 * Create a document text node. Empty string is not allowed.
 *
 * @returns document node
 */
export function textNode(text = ' '): LicitNode {
  return {
    type: 'text',
    text,
    attrs: {},
  };
}

/**
 * Create a blank document node.
 *
 * @returns document node
 */
export function blankDocumentfromEditor(
  editor: EditorState
): Node & LicitDocument {
  return blankDocumentfromSchema(editor?.schema);
}

/**
 * Create a blank document node.
 *
 * @returns document node
 */
export function blankDocumentfromSchema(schema: Schema): Node & LicitDocument {
  return schema?.topNodeType.createAndFill() as unknown as Node & LicitDocument;
}
