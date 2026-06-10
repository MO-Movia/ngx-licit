/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SimpleRuntime } from '../models/editor-runtime';
import { RecentColor } from '../models/recent-color';
import type { Style } from '@modusoperandi/licit-tiptap/plugins/custom-styles';
import type { ImageLike } from '@modusoperandi/licit-tiptap/plugins/multimedia';

const STYLES_KEY = 'STYLES_CACHE';
const COLORS_KEY = 'COLORS_CACHE';

@Injectable({ providedIn: 'root' })
export class LocalRuntime implements SimpleRuntime {
  canEditStyles(): boolean {
    return true;
  }

  getProxyImageSrc(src: string): Promise<string> {
    return Promise.resolve(src);
  }

  /**
   * Licit Editor calls this method to upload image to server.
   *
   * @param file: File to upload.
   */
  uploadImage(blob: Blob): Promise<ImageLike> {
    const name = blob instanceof File ? blob.name : 'image';
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
          alt: name,
          src: reader.result as string,
        } as unknown as ImageLike)
      );
      reader.readAsDataURL(blob);
    });
  }

  private videoCache: Record<string, ImageLike> = {};
  getVideoSrc(id: string): Promise<string> {
    const video = this.videoCache[id];
    return video
      ? Promise.resolve(video.src)
      : Promise.reject(new Error('404 Video not found'));
  }

  async uploadVideo(blob: Blob): Promise<ImageLike> {
    return this.processVideo(blob, undefined);
  }

  private async processVideo(blob: Blob, videoEle: HTMLVideoElement | undefined): Promise<ImageLike> {
    videoEle ??= document.createElement('video');
    const image = await new Promise<ImageLike>((resolve, reject) => {
      const src = URL.createObjectURL(blob);
      videoEle.addEventListener('error', () =>
        reject(new Error('Failed to load video'))
      );
      videoEle.addEventListener('loadedmetadata', () => {
        resolve({
          id: crypto.randomUUID(),
          width: videoEle.width,
          height: videoEle.height,
          src,
        });
      videoEle.src = src;
      });
    });
    this.videoCache[image.id] = image;
    return image;
  }

  private styleCache: Style[] = this.getFromLocal(STYLES_KEY);
  saveStyles(styles: Style[]): Promise<Style[]> {
    localStorage.setItem(STYLES_KEY, JSON.stringify(styles));
    this.styleCache = styles;
    return Promise.resolve(styles);
  }

  private colorCache: RecentColor[] = this.getFromLocal(COLORS_KEY);
  saveColors(colors: RecentColor[]): Promise<RecentColor[]> {
    localStorage.setItem(STYLES_KEY, JSON.stringify(colors));
    this.colorCache = colors;
    return Promise.resolve(colors);
  }
  getStyles(): Promise<Style[]> {
    return Promise.resolve(this.styleCache);
  }
  getColors(): Promise<RecentColor[]> {
    return Promise.resolve(this.colorCache);
  }

  private getFromLocal<T>(key: string): T[] {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T[];
    }

    return [];
  }
}
