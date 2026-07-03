/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { ApplicationRef, Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DynamicComponentService } from './dynamic-component.service';

@Component({ selector: 'licit-test-dummy', template: '<span>{{ value() }}</span>' })
class DummyComponent {
  value = input<string>('');
}

describe('DynamicComponentService', () => {
  let service: DynamicComponentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [DynamicComponentService],
    }).compileComponents();
    service = TestBed.inject(DynamicComponentService);
  });

  it('should create a component in the host element', () => {
    const host = document.createElement('div');
    const ref = service.createComponent(DummyComponent, host);

    expect(ref).toBeDefined();
    expect(ref.instance).toBeInstanceOf(DummyComponent);
    ref.destroy();
  });

  it('should set inputs from the data object', () => {
    const host = document.createElement('div');
    const ref = service.createComponent(DummyComponent, host, {
      value: 'hello',
    });

    expect(ref.instance.value()).toBe('hello');
    ref.destroy();
  });

  it('should work without data (defaults to empty object)', () => {
    const host = document.createElement('div');
    const ref = service.createComponent(DummyComponent, host);

    expect(ref.instance.value()).toBe('');
    ref.destroy();
  });

  it('should detach view on destroy', () => {
    const host = document.createElement('div');
    const ref = service.createComponent(DummyComponent, host);

    const detachSpy = vi.spyOn(
      TestBed.inject(ApplicationRef),
      'detachView'
    );
    ref.destroy();
    expect(detachSpy).toHaveBeenCalled();
  });
});
