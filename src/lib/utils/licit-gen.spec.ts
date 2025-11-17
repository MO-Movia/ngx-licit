/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { NodeType, Schema } from '@tiptap/pm/model';
import {
  blankDocument,
  blankDocumentfromEditor,
  blankDocumentfromSchema,
  blankNode,
  textNode,
} from './licit-gen';
import type { EditorState } from '@tiptap/pm/state';

/** mock schema generator */
const MOCK_SCHEMA = () =>
  ({
    topNodeType: {
      createAndFill: () => blankDocument(),
    } as unknown as NodeType,
  }) as Schema;

describe('Licit Generator Utils', () => {
  it('should create blankDocument', () => {
    expect(blankDocument()).toBeDefined();
  });
  it('should create blankNode', () => {
    expect(blankNode('p')).toBeDefined();
  });
  it('should create textNode', () => {
    expect(textNode('p')).toBeDefined();
  });
  it('should create blankDocumentfromEditor', () => {
    expect(
      blankDocumentfromEditor({
        schema: MOCK_SCHEMA(),
      } as EditorState)
    ).toBeDefined();
  });
  it('should create blankDocumentfromSchema', () => {
    expect(blankDocumentfromSchema(MOCK_SCHEMA())).toBeDefined();
  });
});
