/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorRuntime, SimpleRuntime } from '../models/editor-runtime';
import {
  ACRONYMS_CONTENT,
  GLOSSARY_CONTENT,
  Glossary,
} from '../models/glossary';
import type { Style } from '@modusoperandi/licit-tiptap/plugins/custom-styles';
import type { ImageLike } from '@modusoperandi/licit-tiptap/plugins/multimedia';
import { RecentColor } from '../models/recent-color';
import { LicitNode } from '../models/licit-document';

/**
 * Provides support methods to Licit editor
 */
export class RuntimeService implements EditorRuntime {
  canEditStyle?: boolean;

  private linkcallback?: (link: string, popupString: string) => void;
  private innerLinkSectioncallback?: (sectionId: string) => void;
  private getinnerLinkSections?: (styles: string[]) => Promise<LicitNode[]>;
  private getCompleteDoc?: () => LicitNode;
  /**
   * Instances are constructed by angular.
   *
   * @param http HTTP services
   * @param config runtime app config
   * @param preferences cache service
   */
  constructor(private readonly api: SimpleRuntime) {
    // this-bind all runtime methods because the editor doesn't maintain 'this'
    // when calling events.
    this.canUploadImage = this.canUploadImage.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.canUploadVideo = this.canUploadVideo.bind(this);
    this.uploadVideo = this.uploadVideo.bind(this);
    this.getVideoSrc = this.getVideoSrc.bind(this);
    this.getProxyImageSrc = this.getProxyImageSrc.bind(this);
    this.canProxyImageSrc = this.canProxyImageSrc.bind(this);
    this.getAcronyms = this.getAcronyms.bind(this);
    this.getGlossary = this.getGlossary.bind(this);
    this.getRecentColors = this.getRecentColors.bind(this);
    this.saveRecentColor = this.saveRecentColor.bind(this);
    this.deleteRecentColorById = this.deleteRecentColorById.bind(this);
    this.openLinkDialog = this.openLinkDialog.bind(this);
    this.goToInnerLinkSection = this.goToInnerLinkSection.bind(this);
    this.fetchInnerLinkSelectionIds =
      this.fetchInnerLinkSelectionIds.bind(this);
    this.fetchCompleteDoc = this.fetchCompleteDoc.bind(this);
  }

  setlinkCallback(
    linkcallback: (link: string, popupString: string) => void
  ): void {
    this.linkcallback = linkcallback;
  }

  openLinkDialog(link: string, popupString: string): void {
    if (this.linkcallback) {
      this.linkcallback(link, popupString);
    }
  }

  setInnerLinkSection(innerLinkcallback: (sectionId: string) => void): void {
    this.innerLinkSectioncallback = innerLinkcallback;
  }

  goToInnerLinkSection(sectionId: string): void {
    this.innerLinkSectioncallback?.(sectionId);
  }

  getInnerLinkSelectionIds(
    getAllSelectionId: (styles: string[]) => Promise<LicitNode[]>
  ) {
    this.getinnerLinkSections = getAllSelectionId;
  }

  fetchInnerLinkSelectionIds(styles: string[]): Promise<LicitNode[]> {
    if (this.getinnerLinkSections) {
      return this.getinnerLinkSections(styles);
    }
    return Promise.resolve([]);
  }

  getDocFunc(getFullDoc: () => LicitNode) {
    this.getCompleteDoc = getFullDoc;
  }

  fetchCompleteDoc(): LicitNode {
    if (this.getCompleteDoc) {
      return this.getCompleteDoc();
    }
    return {} as unknown as LicitNode;
  }

  /**
   * Method to prepare Acronyms.
   *
   */
  getAcronyms(): Promise<Glossary[]> {
    return Promise.resolve(ACRONYMS_CONTENT);
  }

  /**
   * Method to prepare Glossary.
   *
   */
  getGlossary(): Promise<Glossary[]> {
    return Promise.resolve(GLOSSARY_CONTENT);
  }

  // #region Image Runtime

  /**
   * Licit Editor calls this method to determine if image can be uploaded.
   *
   */
  canUploadImage(): boolean {
    return true;
  }

  /**
   * Licit Editor calls this method to upload image to server.
   *
   * @param file: File to upload.
   */
  uploadImage(blob: Blob): Promise<ImageLike> {
    return this.api.uploadImage(blob);
  }

  /**
   * Licit Editor calls this method to...
   */
  canProxyImageSrc(): boolean {
    return true;
  }

  /**
   * Licit Editor calls this method to get image  proxy.
   *
   */
  async getProxyImageSrc(src: string): Promise<string> {
    return this.api.getProxyImageSrc(src);
  }

  // #endregion Image runtime

  // #region video runtime

  /**
   * Licit Editor calls this method to determine if video can be uploaded.
   *
   */
  canUploadVideo(): boolean {
    return true;
  }

  /**
   * Licit Editor calls this method to upload video to server.
   *
   * @param blob: blob to upload.
   */
  async uploadVideo(blob: File): Promise<ImageLike> {
    return this.api.uploadVideo(blob);
  }
  /**
   * Licit Editor calls this method to determine if video can be uploaded.
   *
   */
  canProxyVideoSrc(): boolean {
    return false;
  }

  /**
   * Licit Editor calls this method to get image from server.
   *
   * @param id: video id.
   */
  getVideoSrc(id: string): Promise<string> {
    return this.api.getVideoSrc(id);
  }

  // #endregion video runtime

  // #region Styles Runtime

  // Style methods required by licit 0.0.20 or later.

  /**
   * Returns styles to editor.
   *
   * FOR LICIT USE ONLY. Use {@link fetchStyles} instead.
   */
  getStylesAsync(): Promise<Style[]> {
    return this.api.getStyles();
  }

  getRecentColors(): Promise<RecentColor[]> {
    return this.api.getColors();
  }
  /**
   * Renames an existing style on the service.
   *
   * @param oldStyleName name of style to rename
   * @param newStyleName new name to apply to style
   */
  async renameStyle(
    oldStyleName: string,
    newStyleName: string
  ): Promise<Style[]> {
    const updatedData = (await this.getStylesAsync()).map((style) =>
      style.styleName === oldStyleName
        ? { ...style, styleName: newStyleName }
        : style
    );
    // Refresh from server after write operation.
    return this.api.saveStyles(updatedData);
  }

  /**
   * Remove an existing style from the service
   * @param styleName Name of style to delete
   */
  async removeStyle(styleName: string): Promise<Style[]> {
    // Refresh from server after write operation.
    return this.api.saveStyles(
      (await this.getStylesAsync()).filter(
        (style) => style.styleName !== styleName
      )
    );
  }

  async deleteRecentColorById(id: number): Promise<RecentColor[]> {
    return this.api.saveColors(
      (await this.getRecentColors()).filter((color) => color.id !== id)
    );
  }

  /**
   * Save or update a style on the service.
   *
   * @param style Style to update.
   */
  async saveStyle(style: Style): Promise<Style> {
    // removing if already exists.
    const filteredStyles = (await this.getStylesAsync()).filter(
      (item) => item.styleName !== style.styleName
    );
    filteredStyles.push(style);

    // Refresh from server after write operation.
    await this.api.saveStyles(filteredStyles);
    return style;
  }

  /**
   * Save set of styles to the service.
   *
   * @param styles Array of Style to Insert.
   * @return Updated array of styles.
   */
  async saveStyleSet(styles: Style[]): Promise<Style[]> {
    await this.api.saveStyles(styles);
    return styles;
  }

  async saveRecentColor(color: RecentColor[]): Promise<RecentColor[]> {
    return this.api.saveColors(color);
  }

  // #endregion Styles Runtime

  // #region Citation Runtime
  // Stubs used by citation plugin
  private citations: { referenceId: string }[] = [];
  async saveCitation(citation: { referenceId: string }) {
    this.citations = [
      ...(await this.removeCitation(citation.referenceId)),
      citation,
    ];
    return this.fetchCitations();
  }

  fetchCitations() {
    return this.citations;
  }

  getCitationsAsync(): Promise<{ referenceId: string }[]> {
    return Promise.resolve(this.fetchCitations());
  }

  removeCitation(referenceId: string): Promise<{ referenceId: string }[]> {
    this.citations = this.citations.filter(
      (c) => c.referenceId !== referenceId
    );
    return Promise.resolve(this.fetchCitations());
  }
  // #endregion  Citation Runtime
}
