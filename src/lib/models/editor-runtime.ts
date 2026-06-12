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
  StyleRuntime,
  Style,
} from '@modusoperandi/licit-tiptap/plugins/custom-styles';
// import type { GlossaryService } from '@modusoperandi/licit-tiptap/plugins/glossary'
import type { EditorRuntime as RCService } from '@modusoperandi/licit-tiptap/plugins/copy-images';
import type { EditorRuntime as MMService } from '@modusoperandi/licit-tiptap/plugins/multimedia';
import { RecentColor } from './recent-color';
import type { LicitNode } from './licit-document';

export interface EditorRuntime
  extends StyleRuntime,
    // GlossaryService,
    RCService,
    MMService {}

export interface SimpleRuntime {
  uploadImage(blob: Blob): Promise<{ src: string }>;
  getProxyImageSrc(src: string): Promise<string>;
  getVideoSrc(id: string): Promise<string>;
  uploadVideo(blob: Blob): Promise<{ src: string }>;
  saveStyles(styles: Style[]): Promise<Style[]>;
  saveColors(colors: RecentColor[]): Promise<RecentColor[]>;
  canEditStyles(): boolean;
  getStyles(): Promise<Style[]>;
  getColors(): Promise<RecentColor[]>;
  openLinkDialog?: (link: string, popupString: string) => void;
  goToInnerLinkSection?: (sectionId: string) => void;
  getInnerLinkSections?: (styles: string[]) => Promise<LicitNode[]>;
  getCompleteDoc?: () => LicitNode;
}