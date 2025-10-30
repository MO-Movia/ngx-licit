/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { LicitDocument } from '../models/licit-document';
import { blankDocument, blankNode, textNode } from './licit-gen';
import { normalizeDoc, repairDoc } from './licit-repair';

describe('Doc Repair', () => {
  it('should clone the input document and modify it', () => {
    const inputDoc: LicitDocument = {
      ...blankDocument(),
      content: [
        {
          ...blankNode('paragraph'),
          content: [textNode()],
        },
      ],
    };

    const expectedDoc: LicitDocument = {
      ...blankDocument(),
      content: [
        {
          ...blankNode('paragraph'),
          content: [textNode()],
        },
      ],
    };

    const result = repairDoc(inputDoc);
    expect(result).toEqual(expectedDoc);
    expect(result).not.toBe(inputDoc);
  });

  it('should handle nested content correctly', () => {
    const inputDoc: LicitDocument = {
      ...blankDocument(),
      content: [
        {
          ...blankNode('paragraph'),
          content: [
            {
              ...blankNode('nested'),
              content: [textNode(null!), textNode('hello')],
            },
            {
              ...blankNode('table_cell'),
              attrs: {
                colwidth: [null!],
              },
              content: [],
            },
            {
              ...blankNode('nocontent'),
              content: undefined,
            },
          ],
        },
      ],
    };

    const expectedDoc: LicitDocument = {
      ...blankDocument(),
      content: [
        {
          ...blankNode('paragraph'),
          content: [
            {
              ...blankNode('nested'),
              content: [textNode(' '), textNode('hello')],
            },
            {
              ...blankNode('table_cell'),
              attrs: {
                colwidth: null,
              },
              content: [{ ...blankNode('paragraph'), content: [textNode()] }],
            },
            {
              ...blankNode('nocontent'),
              content: undefined,
            },
          ],
        },
      ],
    };

    const result = repairDoc(inputDoc);
    expect(result).toEqual(expectedDoc);
  });

  it('should return the original document if there is no content', () => {
    const inputDoc: LicitDocument = blankDocument();

    const result = repairDoc(inputDoc);
    expect(result).toEqual(inputDoc);
  });

  it('should normzlize', async () => {
    const inputDoc: LicitDocument = {
      ...blankDocument(),
      content: [
        {
          ...blankNode('paragraph'),
        },
      ],
    };
    // Stringify and parse to reduce to json.
    const doc = JSON.parse(
      JSON.stringify(await normalizeDoc(inputDoc, [], 0))
    ) as LicitDocument;

    // Licit added properties will change over time, but something should have been added.
    expect(doc).not.toEqual(inputDoc);
  });
});
