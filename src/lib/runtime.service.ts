/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { EditorRuntime } from './models/editor-runtime';
import type { Glossary } from './models/glossary';
import { ACRONYMS_CONTENT, GLOSSARY_CONTENT } from './models/glossary';
import { firstValueFrom } from 'rxjs';
import type { Style } from '@modusoperandi/licit-custom-styles/StyleRuntime';
import type { ImageLike } from '@modusoperandi/licit';
import type { RecentColor } from './models/recent-color';
import type { LicitNode } from './models/licit-document';

/**
 * URI of style service.  Assumes same origin or proxy.
 */
const COLORS_API = 'colors/';
const DEFAULT_STYLE: Style = {
  styleName: 'Normal',
  mode: 0,
  description: 'Normal',
  styles: {
    align: 'left',
    boldNumbering: true,
    boldSentence: true,
    fontName: 'Tahoma',
    fontSize: '12',
    nextLineStyleName: 'Normal',
    paragraphSpacingAfter: '3',
    toc: false,
  },
};

/**
 * Provides support methods to Licit editor
 *
 * @since 0.3.0
 * @deprecated example runtime service. Need to remove the need for the runtime service
 */
@Injectable({ providedIn: 'root' })
export class RuntimeService implements EditorRuntime {
  /**
   * Local cache of style properties to save on service calls.
   */
  styleType?: string = undefined;
  styleProps?: Promise<Style[]> = undefined;

  colorsProps?: Promise<RecentColor[]> = undefined;

  // Stubs used by citation plugin
  private citations: { referenceId: string }[] = [];

  /**
   * Type of the document. used to create style object
   */
  documentType?: string;
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
  constructor(private readonly http: HttpClient) {
    // this-bind all runtime methods because the editor doesn't maintain 'this'
    // when calling events.
    this.canUploadImage = this.canUploadImage.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.canUploadVideo = this.canUploadVideo.bind(this);
    this.uploadVideo = this.uploadVideo.bind(this);
    this.getVideoSrc = this.getVideoSrc.bind(this);
    this.getProxyVideoSrc = this.getProxyVideoSrc.bind(this);
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
  uploadImage(file: File): Promise<ImageLike> {
    // Convert image to data URL...
    return new Promise<ImageLike>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('error', () =>
        reject(new Error('Failed to load image'))
      );
      reader.addEventListener('load', () =>
        // Convert to ImageLike. Width and Height are unknown, and would
        // require rendering into a hidden canvas to determine
        resolve({
          alt: file.name,
          src: reader.result as string,
        } as unknown as ImageLike)
      );
      reader.readAsDataURL(file);
    });
  }

  /**
   * Method to get image.
   *
   * @param url: image rul.
   */
  getImage(url: string): Promise<string> {
    return firstValueFrom(
      this.http.get<Blob>(url, { responseType: 'blob' as 'json' })
    )
      .then((response) => this.uploadImage(response as File))
      .then((r) => r.src)
      .catch(() => url);
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
    if (src?.includes(this.config.contentEndpoint)) {
      return this.getImage(src);
    }

    return src;
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
    // Use uploaded image URL.
    const formData = new FormData();
    formData.append('label', blob.name);
    formData.append('file', blob);

    const endPoint = this.config.contentEndpoint;

    return firstValueFrom(this.http.post(endPoint, formData))
      .then((response) => {
        const idString = (response as { entity: { id: string } }).entity.id;
        const id = idString.substring(idString.lastIndexOf('/') + 1);

        return this.prepareVideoSrc(id);
      })
      .catch(() => {
        throw new Error('Failed to load video');
      });
  }
  /**
   * Licit Editor calls this method to determine if video can be uploaded.
   *
   */
  canProxyVideoSrc(): boolean {
    return false;
  }

  /**
   * Licit Editor calls this method to get video proxy.
   *
   */
  getProxyVideoSrc(src: string): string {
    // This simulate a fake proxy.
    const suffix = 'proxied=1';
    const queryDelim = src.includes('?') ? '&' : '?';
    return `${src}${queryDelim}${suffix}`;
  }

  /**
   * Licit Editor calls this method to get image from server.
   *
   * @param id: video id.
   */
  getVideoSrc(id: string): Promise<string> {
    return this.prepareVideoSrc(id).then((data) => data.src);
  }

  /**
   * Merhod call to get the blob.
   *
   * @param videoId.
   */
  async prepareVideoSrc(id: string): Promise<ImageLike> {
    const remoteVidUrl = this.config.contentEndpoint + 'id/' + id;
    return firstValueFrom(
      this.http.get<Blob>(remoteVidUrl, {
        observe: 'response',
        responseType: 'blob' as 'json',
      })
    )
      .then((response) => this.prepareVideoObject(response, id))
      .catch(() => {
        throw new Error('Failed to load video');
      });
  }

  /**
   * Function to prepare the video metadata.
   *
   * @param response - response from server.
   * @param id - video id
   */
  prepareVideoObject(
    response: HttpResponse<Blob>,
    id: string
  ): Promise<ImageLike> {
    return new Promise((resolve, reject) => {
      const videoEle = document.createElement('video');
      videoEle.src = URL.createObjectURL(response.body!);

      videoEle.addEventListener('error', () =>
        reject(new Error('Failed to load video'))
      );
      videoEle.addEventListener('loadedmetadata', function () {
        resolve({
          id: id,
          width: this.videoWidth,
          height: this.videoHeight,
          src: videoEle.src,
        });
      });
    });
  }

  // #endregion video runtime

  // #region Styles Runtime

  // Style methods required by licit 0.0.20 or later.

  /**
   * Method to prepare the URL based on the document type
   *
   */
  private getStyleUrl(id?: string): string {
    const type = 'Default';
    id ??= this.documentType ?? '';
    return `${
      this.config.smartDocumentEndpoint
    }v2/text/styles/${type}/${encodeURIComponent(id)}`;
  }

  private getColorsUrl(): string {
    return `${COLORS_API}` + 'RecentColors';
  }

  /**
   * Method for fetch style data from cache API.
   */
  public async fetchStyles(documentType: string): Promise<Style[]> {
    let styles = await firstValueFrom(
      this.http.get<Style[]>(this.getStyleUrl(documentType), {
        observe: 'response',
      })
    )
      .then((r) => r.body)
      .catch((error: HttpErrorResponse) =>
        error.status === 404 ? null : Promise.reject(new Error(error.message))
      );
    if (styles) {
      for (const style of styles) {
        style.docType = documentType;
      }
    } else {
      styles = [DEFAULT_STYLE];
      this.saveStyleData(styles).catch((e) =>
        console.error('Failed to save default styles', e)
      );
    }
    return this.sortByStyleName(styles);
  }

  private sortByStyleName(styles: Style[]): Style[] {
    return styles.sort((a, b) =>
      a.styleName.localeCompare(b.styleName, undefined, { numeric: true })
    );
  }
  /**
   * Method for save style data to cache API
   *
   *@param styles style array
   */
  private async saveStyleData(styles: Style[]): Promise<Style[]> {
    await firstValueFrom(this.http.put<void>(this.getStyleUrl(), styles));
    return styles;
  }

  private async saveColors(colors: RecentColor[]): Promise<RecentColor[]> {
    const data = await firstValueFrom(
      this.preferences.addUserData<RecentColor[]>(this.getColorsUrl(), colors)
    );
    return data.data;
  }

  /**
   * Returns styles to editor.
   *
   * FOR LICIT USE ONLY. Use {@link fetchStyles} instead.
   */
  getStylesAsync(): Promise<Style[]> {
    const type = this.documentType;
    if (!this.styleProps?.then || this.styleType !== type) {
      this.styleType = type;
      this.styleProps = this.fetchStyles(type!);
    }

    return this.styleProps;
  }

  getRecentColors(): Promise<RecentColor[]> {
    return firstValueFrom(
      this.preferences.getUserData<RecentColor[]>(this.getColorsUrl())
    ).catch(() => []);
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
    this.styleProps = this.saveStyleData(updatedData);
    return this.styleProps;
  }

  /**
   * Remove an existing style from the service
   * @param styleName Name of style to delete
   */
  async removeStyle(styleName: string): Promise<Style[]> {
    // Refresh from server after write operation.
    this.styleProps = this.saveStyleData(
      (await this.getStylesAsync()).filter(
        (style) => style.styleName !== styleName
      )
    );
    return this.styleProps;
  }

  async deleteRecentColorById(id: number): Promise<RecentColor[]> {
    this.colorsProps = this.saveColors(
      (await this.getRecentColors()).filter((color) => color.id !== id)
    );
    return this.colorsProps;
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
    await this.saveStyleData(filteredStyles);
    return style;
  }

  /**
   * Save set of styles to the service.
   *
   * @param styles Array of Style to Insert.
   * @return Updated array of styles.
   */
  async saveStyleSet(styles: Style[]): Promise<Style[]> {
    await this.saveStyleData(styles);
    return styles;
  }

  async saveRecentColor(color: RecentColor[]): Promise<RecentColor[]> {
    this.colorsProps = this.saveColors(color);
    return this.colorsProps;
  }

  // #endregion Styles Runtime

  // #region Citation Runtime
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
