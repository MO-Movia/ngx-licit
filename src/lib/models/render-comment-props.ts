/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

// Licit doesn't export types in any way that can be used here for
// intellisense.  I've copied and modified these definitions from
// @modusoperandi/licit/dist/types/Types.js.flow version 0.0.20
//
// At this time the EditorRuntime does not include style methods.
// so those are exported as a second interface though they must
// be part of the same runtime implementation passed to editor component

export interface RenderCommentProps {
  commentThreadId: string;
  isActive: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  requestCommentThreadDeletion: Function;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  requestCommentThreadReflow: Function;
}
