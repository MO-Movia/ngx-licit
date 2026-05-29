/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import type { ComponentRef, Type } from '@angular/core';
import { inject, Injectable, RendererFactory2 } from '@angular/core';
import { DynamicComponentService } from '../dynamic-component-service';

/**
 * Service for opening dynamically rendered components as a modal dialog.
 */
@Injectable({
  providedIn: 'root',
})
export class DynamicDialogService {
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);
  private readonly componentFactory = inject(DynamicComponentService);

  private dialogRef?: ComponentRef<unknown>;
  private backdropElement?: HTMLElement;

  open<T>(
    component: Type<T>,
    options?: { data?: Record<string, unknown>; zIndex?: number }
  ): ComponentRef<T> {
    options ??= {};
    const { data = {}, zIndex = 50000 } = options;
    this.close();
    this.backdropElement = this.createBackdrop(zIndex);

    const ref = this.componentFactory.createComponent(
      component,
      this.renderer.createElement('div') as HTMLElement,
      data
    );
    this.dialogRef = ref;

    const domElem = ref.location.nativeElement as HTMLElement;
    this.renderer.setStyle(domElem, 'position', 'fixed');
    this.renderer.setStyle(domElem, 'zIndex', String(zIndex + 1));
    this.renderer.setStyle(domElem, 'top', '50%');
    this.renderer.setStyle(domElem, 'left', '50%');
    this.renderer.setStyle(domElem, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(domElem, 'border', '1px solid');
    document.body.appendChild(domElem);

    return ref;
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.destroy();
      delete this.dialogRef;
    }

    if (this.backdropElement) {
      this.backdropElement.remove();
      delete this.backdropElement;
    }
  }

  private createBackdrop(zIndex: number): HTMLElement {
    const backdrop = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(backdrop, 'open-dialog-backdrop');
    this.renderer.setStyle(backdrop, 'position', 'fixed');
    this.renderer.setStyle(backdrop, 'top', '0');
    this.renderer.setStyle(backdrop, 'left', '0');
    this.renderer.setStyle(backdrop, 'width', '100%');
    this.renderer.setStyle(backdrop, 'height', '100%');
    this.renderer.setStyle(backdrop, 'backgroundColor', 'rgba(0, 0, 0, 0.5)');
    this.renderer.setStyle(backdrop, 'zIndex', String(zIndex));
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', () => this.close());
    return backdrop;
  }
}
