/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { Licit, EditorRuntime } from '@modusoperandi/licit';

/**
 * Licit document root node.
 *
 * This Type is for the json format. Use ProseMirror "Node" type for the rendered node type.
 */
export interface LicitDocument extends LicitNode {
  /**
   * ProseMirror Node type. Always 'doc' for the root node.
   */
  type: 'doc';
}

/**
 * Generic node of a {@link LicitDocument}.
 *
 * This Type is for the json format. Use ProseMirror "Node" type for the rendered node type.
 */
export interface LicitNode {
  /**
   * ProseMirror Node type.
   */
  type: string;
  /**
   * text if type is 'text'.
   */
  text?: string;
  /**
   * Child nodes if this is not a leaf.
   */
  content?: LicitNode[];
  /**
   * ProseMirror Node Attributes.
   */
  attrs?: LicitAttrs;

  /**
   * Additional node specific properties.
   */
  [x: string | number]: unknown;
}

export interface DocumentProperties {
  /**
   * Name of the document.
   */
  name?: string;
  /**
   * Type of the document. ex. "Help" or "Report". Probobly a URI.
   */
  type?: string;
  /**
   * Authority for this document.
   */
  hasAuthority?: string;
  /**
   * Creator of this document/node.
   */
  hasAuthor?: string;
  /**
   * Date Created.
   */
  creationDate?: string;
  /**
   * Date of last update to this document/node.
   */
  lastEditedOn?: string;

  /**
   * Additional node specific properties.
   */
  [x: string | number]: unknown;
}

/**
 * Generic attributes of a {@link LicitNode}.
 *
 * This Type is for the json format. Use ProseMirror "Attrs" type for the rendered node attributes type.
 */
export interface LicitAttrs {
  /**
   * Entity ID. Unique globally. Changed on copy.
   */
  objectId?: string;
  /**
   * Reference ID. Unique per document. Preserved on copy.
   */
  selectionId?: string;
  /**
   * Style associated for this node, if any.
   */
  styleName?: string;
  /**
   * Reference ID. Unique per document. Preserved on copy.
   */
  objectMetaData?: DocumentProperties;
  /**
   * Additional node specific properties.
   */
  [x: string | number]: unknown;
}
/**
 * Contains properties passed down to licit component.
 */

export interface LicitProperties {
  data?: LicitDocument;
  debug?: boolean;
  disabled?: boolean;
  /**
   * number: licit v0.1.5 and earlier
   *
   * string: licit v0.1.6 and later
   */
  docID?: number | string;
  embedded?: boolean;
  height?: number | string;
  onChange?: (doc: LicitDocument, isEmpty: boolean) => void;
  onReady?: (licit: Licit) => void;
  plugins?: unknown[];
  readOnly?: boolean;
  runtime?: EditorRuntime;
  width?: number | string;
}
