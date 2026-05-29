/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  type ComponentRef,
  type Type,
} from '@angular/core';

/**
 * Service for rendering an Angular component dynamically into a host element.
 */
@Injectable({
  providedIn: 'root',
})
export class DynamicComponentService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  createComponent<T>(
    component: Type<T>,
    hostElement: Element,
    data: Record<string, unknown> = {}
  ): ComponentRef<T> {
    const ref = createComponent(component, {
      environmentInjector: this.environmentInjector,
      hostElement,
    });
    Object.entries(data).forEach(([key, value]) => ref.setInput(key, value));

    this.appRef.attachView(ref.hostView);
    ref.onDestroy(() => this.appRef.detachView(ref.hostView));
    return ref;
  }
}
