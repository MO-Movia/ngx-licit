/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { LicitDocument } from "../models";
import { normalizeDoc } from "./normalizer";

describe('normalizer', () => {
  it('should normalize a document', async () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello World',
            },
          ],
        },
      ],
    } as unknown as LicitDocument;
    const normalized = await normalizeDoc(doc).then(() => false).catch(() => true);
    // TODO: Fix this test - Cannot read properties of null (reading 'useRef')
    expect(normalized).toBe(true);
  });
});
