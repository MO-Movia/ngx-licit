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

import type {
  Style,
  StyleRuntime,
} from '@modusoperandi/licit-custom-styles/StyleRuntime';
import type { Glossary } from './glossary';
import type { RenderCommentProps } from './render-comment-props';
import type { ImageLike } from '@modusoperandi/licit-tiptap';
import type { RecentColor } from './recent-color';

export interface EditorRuntime extends StyleRuntime {
  // Image Proxy
  canProxyImageSrc?: (src: string) => boolean;
  getProxyImageSrc?: (src: string) => Promise<string>;

  // Image Upload
  canUploadImage?: () => boolean;
  uploadImage?: (obj: File) => Promise<ImageLike>;

  // Video Proxy
  canProxyVideoSrc?: (src: string) => boolean;
  getProxyVideoSrc?: (src: string) => string;

  // Video Upload
  canUploadVideo?: () => boolean;
  uploadVideo?: (obj: File) => Promise<ImageLike>;

  // Get Video
  getVideoSrc?: (id: string) => Promise<string>;

  // Comments
  canComment?: () => boolean;
  createCommentThreadID?: () => string;
  renderComment?: (props: RenderCommentProps) => React.ReactElement | null;

  // External HTML
  canLoadHTML?: () => boolean;
  loadHTML?: () => Promise<string>;

  /**
   * Gets array of styles from the service
   */
  getStylesAsync(): Promise<Style[]>;

  getRecentColors(): Promise<RecentColor[]>;

  /**
   * Renames an existing style from the service.
   *
   * @param oldStyleName Name of style to rename.
   * @param newStyleName New name for style.
   */
  renameStyle(oldStyleName: string, newStyleName: string): Promise<Style[]>;

  /**
   * Remove an existing style
   *
   * @param styleName Name of style to remove.
   */
  removeStyle(styleName: string): Promise<Style[]>;

  /**
   * Return Acronym data
   *
   * @param abbreviation abbreviation.
   */
  getAcronyms?: (abbreviation: string) => Promise<Glossary[]>;

  /**
   * Return Acronym data
   *
   * @param abbreviation abbreviation.
   */
  getGlossary?: (abbreviation: string) => Promise<Glossary[]>;
}
