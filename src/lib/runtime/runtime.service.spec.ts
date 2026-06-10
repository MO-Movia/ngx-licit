/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RuntimeService } from './runtime.service';
import { LoggerTestingModule } from 'ngx-logger/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { LocalRuntime } from './localRuntime';

describe('RuntimeService', () => {
  let runtime: RuntimeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        LocalRuntime,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    runtime = new RuntimeService(TestBed.inject(LocalRuntime));
  });

  it('should be created', () => {
    expect(runtime).toBeTruthy();
  });
});
