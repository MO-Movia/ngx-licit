/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type {
  LicitNode,
  LicitDocument,
  LicitAttrs,
} from '../models/licit-document';
import type { EditorState } from '@tiptap/pm/state';
import type { Schema } from '@tiptap/pm/model';
const PM_DOC = 'doc';

/**
 * Create a blank document.
 *
 * This only creates a minimal document. Prefer {@link blankDocumentfromEditor} or {@link blankDocumentfromSchema} for a more complete result.
 *
 * @returns document
 */
export function blankDocument(...content: LicitNode[]): LicitDocument {
  return {
    type: PM_DOC,
    attrs: {},
    content,
  };
}
/**
 * Create a blank document node.
 *
 * @returns document node
 */
export function blankNode(type: string, ...content: LicitNode[]): LicitNode {
  return {
    type,
    attrs: {},
    content,
  };
}
/**
 * Create a blank document node.
 *
 * @returns document node
 */
export function attrsNode(
  type: string,
  attrs: LicitAttrs | undefined,
  ...content: LicitNode[]
): LicitNode {
  return {
    type,
    attrs,
    content,
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
