/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import ReactDOM from 'react-dom/client';
import { LicitDocument } from '../models';
import { normalizeDoc } from './normalizer';

// Controls which callbacks the mock Licit component invokes so each test can
// exercise a different code path in normalizeDoc.
const { mockMode } = vi.hoisted(() => ({
  mockMode: {
    current: 'both',
  },
}));

// Mock the Licit React component so we can control which callbacks fire.
// The real editor only calls onReady during initialization; onChange is never
// triggered without user interaction, leaving that branch uncovered.
vi.mock('@modusoperandi/licit-tiptap/licit', async () => {
  const React = await import('react');
  return {
    Licit: function MockLicit(props: {
      onReady?: (handle: unknown) => void;
      onChange?: (doc: unknown) => void;
      data?: unknown;
    }) {
      React.useEffect(() => {
        if (mockMode.current === 'error') return;
        if (mockMode.current === 'both' || mockMode.current === 'onReady') {
          props.onReady?.({ editorView: { state: { doc: props.data } } });
        }
        if (mockMode.current === 'both' || mockMode.current === 'onChange') {
          props.onChange?.(props.data);
        }
      }, []);
      return null;
    },
  };
});

describe('normalizer', () => {
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello World' }],
      },
    ],
  } as unknown as LicitDocument;

  let createRootSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createRootSpy = vi.spyOn(ReactDOM, 'createRoot');
  });

  afterEach(() => {
    mockMode.current = 'both';
    createRootSpy.mockRestore();
  });

  it('should normalize a document via onReady and onChange callbacks', async () => {
    mockMode.current = 'both';
    const result = await normalizeDoc(doc, [], 10);
    expect(result).toBeDefined();
    expect(result.type).toBe('doc');
  });

  it('should normalize a document via onChange callback only', async () => {
    mockMode.current = 'onChange';
    const result = await normalizeDoc(doc, [], 10);
    expect(result).toBeDefined();
    expect(result.type).toBe('doc');
  });

  it('should reject when a recoverable error occurs', async () => {
    mockMode.current = 'error';
    const promise = normalizeDoc(doc, [], 10);
    // Wait for createRoot to be called so we can access onRecoverableError
    await vi.waitFor(() => expect(createRootSpy).toHaveBeenCalled());
    const options = createRootSpy.mock.calls[0][1] as {
      onRecoverableError: (err: unknown) => void;
    };
    options.onRecoverableError(new Error('render error'));
    await expect(promise).rejects.toThrow('render error');
  });
});
