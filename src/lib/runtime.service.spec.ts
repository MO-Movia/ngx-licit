/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RuntimeService } from './runtime.service';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ACRONYMS_CONTENT, GLOSSARY_CONTENT } from './models/glossary';
import type { Style } from '@modusoperandi/licit-custom-styles/StyleRuntime';
import type { ImageLike } from '@modusoperandi/licit';
import { of, throwError } from 'rxjs';
import type { HttpResponse } from '@angular/common/http';
import {
  HttpErrorResponse,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

const passEventThrough = (name: string, fn: (e: unknown) => void) => {
  if (name === 'error') {
    fn(new ProgressEvent('error'));
  }
};

describe('RuntimeService', () => {
  let runtime: RuntimeService;
  let http: HttpTestingController;
  let styles: Style[];
  let videoUploadRes: ImageLike;
  let videoFailedMsg: string;

  const fakeVideoeFile = (): File => {
    const blob = new Blob([''], { type: 'text/html' });

    (
      blob as unknown as {
        entity: { id: string };
      }
    ).entity = { id: '123.mp4' };

    return blob as File;
  };

  beforeEach(async () => {
    styles = [{ styleName: 'barney' }, { styleName: 'fred' }];
    videoUploadRes = { id: '123.mp4', width: 100, height: 100, src: '123.mp4' };
    videoFailedMsg = 'Failed to load video';

    await TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        RuntimeService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    runtime = TestBed.inject(RuntimeService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(runtime).toBeTruthy();
  });

  describe('canUploadImage', () => {
    it('should return truthy', () => {
      expect(runtime.canUploadImage()).toBeTruthy();
    });
  });

  describe('canProxyImageSrc', () => {
    it('should return True', () => {
      expect(runtime.canProxyImageSrc()).toBeTruthy();
    });
  });

  describe('uploadImage', () => {
    const file = new File([], 'zero.txt', { type: 'text/plain' });

    describe('when call succeeds', () => {
      it('should return a data url reference', async () => {
        const out = await runtime.uploadImage(file);
        expect(out).toEqual(
          jasmine.objectContaining<ImageLike>({
            alt: 'zero.txt',
            src: jasmine.stringMatching(/data:/),
          } as unknown as ImageLike)
        );
      });
    });

    it('should raise an error when call fails', async () => {
      spyOn(FileReader.prototype, 'addEventListener').and.callFake(
        passEventThrough
      );

      const out = await runtime.uploadImage(file).then(
        () => false,
        () => true
      );

      expect(out).toBeTruthy();
    });
  });

  describe('canUploadVideo', () => {
    it('should return truthy', () => {
      expect(runtime.canUploadVideo()).toBeTruthy();
    });
  });

  describe('canProxyVideoSrc', () => {
    it('should return falsy', () => {
      expect(runtime.canProxyVideoSrc()).toBeFalsy();
    });
  });

  describe('getProxyVideoSrc', () => {
    it('If no param exists', () => {
      expect(runtime.getProxyVideoSrc('text')).toBe('text?proxied=1');
    });

    it('If param exists', () => {
      expect(runtime.getProxyVideoSrc('text?abc=1')).toBe(
        'text?abc=1&proxied=1'
      );
    });
  });

  describe('prepareVideoObject', () => {
    const file = new File([], '123.mp4', { type: 'text/plain' });
    const response = { body: file } as unknown as HttpResponse<Blob>;

    describe('when call succeeds', () => {
      it('should return a ImageLike object', async () => {
        spyOn(runtime, 'prepareVideoObject').and.returnValue(
          Promise.resolve(videoUploadRes)
        );

        const out = await runtime.prepareVideoObject(response, '123.mp4');
        expect(out).toEqual(videoUploadRes);
      });
    });

    it('should raise an error when call fails', async () => {
      spyOn(FileReader.prototype, 'addEventListener').and.callFake(
        passEventThrough
      );

      const out = await runtime.prepareVideoObject(response, '123.mp4').then(
        () => false,
        () => true
      );

      expect(out).toBeTruthy();
    });
  });

  describe('getImage', () => {
    afterEach(() => http.verify());

    const file = new File(['test'], 'testimage.png', { type: 'text/plain' });

    it('should return image src when REST call succeeds', async () => {
      const data = runtime.getImage('testimage.png');

      const req = http.expectOne({ method: 'GET', url: 'testimage.png' });
      expect(req.request.method).toBe('GET');
      req.flush(file);
      expect(await data).toEqual('data:text/plain;base64,dGVzdA==');
    });

    it('API Succes but image load failed - should return param id', async () => {
      spyOn(runtime, 'uploadImage').and.returnValue(
        Promise.reject(new Error('testimage.png'))
      );

      const data = runtime
        .getImage('testimage.png')
        .catch((err: Error) => err.message);

      const req = http.expectOne({ method: 'GET', url: 'testimage.png' });
      expect(req.request.method).toBe('GET');
      req.flush(file);
      expect(await data).toEqual('testimage.png');
    });

    it('should return same image Id when REST call fails', async () => {
      const data = runtime
        .getImage('testimage.png')
        .catch((err: Error) => err.message);

      http
        .expectOne({ method: 'GET', url: 'testimage.png' })
        .error(new ProgressEvent('testimage.png'));

      expect(await data).toEqual('testimage.png');
    });
  });

  describe('getProxyImageSrc', () => {
    const response = 'testimage.png';

    it('#SUCCESS - should return image src', async () => {
      const src = '/movia/content/testimage.png';

      const getImage = spyOn(runtime, 'getImage').and.resolveTo(src);

      const res = await runtime.getProxyImageSrc(src);
      expect(res).toEqual(src);
      expect(getImage).toHaveBeenCalled();
    });

    it('If get image fails - should return the same param', async () => {
      const param = '/movia/content/testimage.png';

      const getImage = spyOn(runtime, 'getImage').and.callThrough();

      const resPromise = runtime.getProxyImageSrc(param);

      const req = http.expectOne(param);

      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      const res = await resPromise;

      expect(res).toEqual(param);

      expect(getImage).toHaveBeenCalled();
    });

    it('If the url is not content end point -should return the same param value', async () => {
      const data = await runtime.getProxyImageSrc(response);
      expect(data).toEqual(response);
    });
  });

  describe('uploadVideo', () => {
    afterEach(() => http.verify());

    const uploadResponse = {
      entity: { id: '123.mp4' },
    };

    it('should return ImageLike object when REST call succeeds', async () => {
      spyOn(runtime, 'prepareVideoSrc').and.returnValue(
        Promise.resolve(videoUploadRes)
      );

      const data = runtime.uploadVideo(fakeVideoeFile());

      const req = http.expectOne({
        method: 'POST',
        url: config.contentEndpoint,
      });
      expect(req.request.method).toBe('POST');
      req.flush(uploadResponse);
      expect(await data).toEqual(videoUploadRes);
    });

    it('Upload is success but video not loaded', async () => {
      spyOn(runtime, 'prepareVideoSrc').and.returnValue(
        Promise.reject(new Error(videoFailedMsg))
      );

      const data = runtime.uploadVideo(fakeVideoeFile());

      const req = http.expectOne({
        method: 'POST',
        url: config.contentEndpoint,
      });
      expect(req.request.method).toBe('POST');
      req.flush(uploadResponse);

      await data.then(
        () => fail('Promise should fail'),
        (e: Error) => expect(e.message).toEqual(videoFailedMsg)
      );
    });

    it('should raise an error when REST call fails', async () => {
      const data = runtime.uploadVideo(fakeVideoeFile());
      const error = new ProgressEvent('error');
      http
        .expectOne({ method: 'POST', url: config.contentEndpoint })
        .error(error);

      await data.then(
        () => fail('Promise should fail'),
        (e) => expect(e.message).toEqual(videoFailedMsg)
      );
    });
  });

  describe('getVideoSrc', () => {
    afterEach(() => http.verify());

    it('should return ImageLike object when REST call succeeds', async () => {
      spyOn(runtime, 'prepareVideoObject').and.returnValue(
        Promise.resolve(videoUploadRes)
      );

      const data = runtime.getVideoSrc('123.mp4');

      const req = http.expectOne({
        method: 'GET',
        url: config.contentEndpoint + 'id/123.mp4',
      });
      expect(req.request.method).toBe('GET');
      req.flush(fakeVideoeFile());
      expect(await data).toEqual('123.mp4');
    });

    it('video src is recieved but video not loaded', async () => {
      spyOn(runtime, 'prepareVideoObject').and.returnValue(
        Promise.reject(new Error(videoFailedMsg))
      );

      const data = runtime.getVideoSrc('123.mp4');

      const req = http.expectOne({
        method: 'GET',
        url: config.contentEndpoint + 'id/123.mp4',
      });
      expect(req.request.method).toBe('GET');
      req.flush(fakeVideoeFile());

      await data.then(
        () => fail('Promise should fail'),
        (e) => expect(e.message).toEqual(videoFailedMsg)
      );
    });

    it('should raise an error when REST call fails', async () => {
      const data = runtime.getVideoSrc('123.mp4');

      const req = http.expectOne({
        method: 'GET',
        url: config.contentEndpoint + 'id/123.mp4',
      });
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('error'));

      await data.then(
        () => fail('Promise should fail'),
        (e) => expect(e.message).toEqual(videoFailedMsg)
      );
    });
  });

  describe('prepareVideoSrc', () => {
    afterEach(() => http.verify());

    const response = new Blob();

    describe('when REST call succeeds', () => {
      it('should return ImageLike object', async () => {
        spyOn(runtime, 'prepareVideoObject').and.returnValue(
          Promise.resolve(videoUploadRes)
        );

        const data = runtime.prepareVideoSrc('123.mp4');

        const req = http.expectOne({
          method: 'GET',
          url: config.contentEndpoint + 'id/123.mp4',
        });
        expect(req.request.method).toBe('GET');
        req.flush(response);
        expect(await data).toEqual(videoUploadRes);
      });
    });

    it('should raise an error when REST call fails', async () => {
      spyOn(runtime, 'prepareVideoObject').and.returnValue(
        Promise.reject(new Error(videoFailedMsg))
      );

      const data = runtime.prepareVideoSrc('123.mp4');

      const req = http.expectOne({
        method: 'GET',
        url: config.contentEndpoint + 'id/123.mp4',
      });

      req.flush(null, { status: 500, statusText: videoFailedMsg });

      await data.then(
        () => fail('Promise should fail'),
        (e) => expect(e.message).toEqual(videoFailedMsg)
      );
    });
  });

  describe('getStylesAsync', () => {
    afterEach(() => http.verify());

    it('should return array of styles when REST call succeeds', async () => {
      runtime.documentType = 'MockDocuments';
      const promise = runtime.getStylesAsync();
      const stylesResult = styles.map((style) => ({
        ...style,
        docType: runtime.documentType,
      }));

      http
        .expectOne({
          method: 'GET',
          url: `/movia/documents/v2/text/styles/Default/${runtime.documentType}`,
        })
        .flush(styles);

      const res = await promise;
      expect(res).toEqual(stylesResult);
      // Call a second time to validate that request is only made once.
      expect(await runtime.getStylesAsync()).toEqual(stylesResult);
      http.expectNone({
        method: 'GET',
        url: `/movia/documents/v2/text/styles/Default/${runtime.documentType}`,
      });
    });

    describe('when REST call empty', () => {
      it('should return default styles', () => {
        /**  const DEFAULT_STYLE: Style = {
         *   styleName: 'Normal',
         *   mode: 0,
         *   description: 'Normal',
         *   styles: {
         *     align: 'left',
         *     boldNumbering: true,
         *     boldSentence: true,
         *     fontName: 'Tahoma',
         *     fontSize: '12',
         *     nextLineStyleName: 'Normal',
         *     paragraphSpacingAfter: '3',
         *     toc: false,
         *   },
         * };
         */

        runtime.documentType = undefined;

        const promise = runtime.getStylesAsync();

        expect(promise).toBeDefined();

        http.expectOne({
          method: 'GET',
          url: `/movia/documents/v2/text/styles/Default/`,
        });
      });
    });

    it('should raise an error when REST call fails', async () => {
      runtime.documentType = 'MockDocuments';
      const promise = runtime.getStylesAsync();

      http
        .expectOne({
          method: 'GET',
          url: `/movia/documents/v2/text/styles/Default/${runtime.documentType}`,
        })
        .error(new ProgressEvent('error', {}));

      await promise.then(
        () => fail('Promise should fail'),
        (e) => expect(e).toBeTruthy()
      );
    });
  });

  describe('renameStyle', () => {
    it('should also get when REST call succeeds', async () => {
      runtime.styleProps = Promise.resolve(styles);
      runtime['saveStyleData'] = () => Promise.resolve(styles);

      const promise = runtime.renameStyle('barney', 'betty');

      expect(await promise).toBe(styles);
    });

    it('should raise error when REST call fails', async () => {
      const err = new Error('No data found from server');
      runtime.styleProps = Promise.resolve(styles);
      runtime['saveStyleData'] = () => Promise.reject(err);

      const promise = runtime.renameStyle('barney', 'betty');
      await promise.then(
        () => fail('Promise should fail'),
        (e) => expect(e).toBeTruthy()
      );
    });
  });

  describe('removeStyle', () => {
    it('should also get when REST call succeeds', async () => {
      runtime.styleProps = Promise.resolve(styles);
      runtime['saveStyleData'] = () => Promise.resolve(styles);

      spyOn(preferences, 'addSystemData').and.returnValue(of({ data: styles }));

      const promise = runtime.removeStyle('barney');

      // delay between calls.
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(await promise).toBe(styles);
    });

    it('should raise error when REST call fails', async () => {
      const err = new Error('No data found from server');
      runtime.styleProps = Promise.resolve(styles);
      runtime['saveStyleData'] = () => Promise.reject(err);

      const promise = runtime.removeStyle('barney');

      await promise.then(
        () => fail('Promise should fail'),
        (e) => expect(e).toBeTruthy()
      );
    });
  });

  describe('saveStyle', () => {
    it('should also get when REST call succeeds', async () => {
      runtime.styleProps = Promise.resolve(styles);
      runtime['saveStyleData'] = () => Promise.resolve(styles);

      const style = { styleName: 'wilma' };
      const promise = runtime.saveStyle(style);

      // delay between calls.
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(await promise).toBe(style);
    });

    it('should raise error when REST call fails', async () => {
      const err = new Error('No data found from server');
      runtime.styleProps = Promise.resolve(styles);
      runtime['saveStyleData'] = () => Promise.reject(err);

      const promise = runtime.saveStyle({ styleName: 'wilma' });

      await promise.then(
        () => fail('Promise should fail'),
        (e) => expect(e).toBeTruthy()
      );
    });
  });

  describe('saveCitation', () => {
    it('should call the service', async () => {
      const citation = {
        referenceId: 'oicu812',
      };

      // calling it twice to cover remove
      await runtime.saveCitation(citation);
      const out = await runtime.saveCitation(citation);

      expect(out).toContain(citation);
    });
  });

  describe('getCitationsAsync', () => {
    it('should return array of citations', async () => {
      const out = await runtime.getCitationsAsync();

      expect(out).toEqual([]);
    });
  });

  describe('getAcronyms', () => {
    it('should return array of Acronyms', async () => {
      const out = await runtime.getAcronyms();

      expect(out).toEqual(ACRONYMS_CONTENT);
    });
  });

  describe('getGlossary', () => {
    it('should return array of Glossarys', async () => {
      const out = await runtime.getGlossary();

      expect(out).toEqual(GLOSSARY_CONTENT);
    });
  });

  it('should set the linkcallback function correctly', () => {
    const mockCallback = jasmine.createSpy('callback');
    runtime.setlinkCallback(mockCallback);

    expect(runtime['linkcallback']).toBe(mockCallback);
  });

  it('should invoke linkcallback with correct parameters if defined', () => {
    const mockCallback = jasmine.createSpy('callback');
    runtime.setlinkCallback(mockCallback);

    const testLink = 'https://example.com';
    const testPopupString = 'Test Popup';

    runtime?.['linkcallback']?.(testLink, testPopupString);
    expect(mockCallback).toHaveBeenCalledWith(testLink, testPopupString);
  });

  it('should call linkcallback with correct parameters when defined', () => {
    const mockCallback = jasmine.createSpy('callback');
    runtime.setlinkCallback(mockCallback);

    const testLink = 'https://example.com';
    const testPopupString = 'Test Popup';

    runtime.openLinkDialog(testLink, testPopupString);

    expect(mockCallback).toHaveBeenCalledWith(testLink, testPopupString);
  });

  it('should not call linkcallback when it is undefined', () => {
    const testLink = 'https://example.com';
    const testPopupString = 'Test Popup';

    runtime['linkcallback'] = undefined;
    spyOn(runtime, 'openLinkDialog').and.callThrough();
    runtime.openLinkDialog(testLink, testPopupString);
    expect(runtime['linkcallback']).toBeUndefined();
    expect(runtime.openLinkDialog).toHaveBeenCalledWith(
      testLink,
      testPopupString
    );
  });

  describe('getRecentColors', () => {
    it('should return a promise', () => {
      const promise = runtime.getRecentColors();

      expect(promise).toBeDefined();
    });

    it('should return an empty array if error', async () => {
      const getUserData = spyOn(
        runtime.preferences,
        'getUserData'
      ).and.returnValue(throwError(() => new Error('test error')));

      const result = await runtime.getRecentColors();

      expect(result).toEqual([]);
      expect(getUserData).toHaveBeenCalled();
    });
  });

  describe('saveRecentColor', () => {
    it('should return a promise', () => {
      const promise = runtime.saveRecentColor([]);
      expect(promise).toBeDefined();
    });
  });

  describe('deleteRecentColorById', () => {
    it('should return a promise', () => {
      const promise = runtime.deleteRecentColorById(1);
      expect(promise).toBeDefined();
    });

    it('should delete a color by id', async () => {
      const idToDelete = 3;
      const mockColors = [
        { id: 1, color: 'red' },
        { id: 2, color: 'blue' },
      ];

      spyOn(runtime, 'getRecentColors').and.returnValue(
        Promise.resolve(mockColors)
      );
      // eslint-disable-next-line
      spyOn<any>(runtime, 'saveColors').and.returnValue(mockColors);

      const result = await runtime.deleteRecentColorById(idToDelete);

      expect(result).toEqual(mockColors);
      expect(runtime.getRecentColors).toHaveBeenCalled();
      expect(runtime['saveColors']).toHaveBeenCalledWith(mockColors);
    });
  });

  describe('saveStyleData', () => {
    it('should return styles after saving', async () => {
      const mockStyles: Style[] = [
        {
          styleName: 'Style 1',
          mode: 1,
          description: 'Description 1',
          styles: { color: 'red', selectedStyleMode: '' },
          docType: 'text/css',
        },
      ];

      spyOn(runtime['http'], 'put').and.returnValue(of(null));

      const result = runtime['saveStyleData'](mockStyles);

      expect(await result).toEqual(mockStyles);
    });
  });

  describe('saveColors', () => {
    it('should save colors', async () => {
      const mockColors = [
        { id: 1, color: 'red' },
        { id: 2, color: 'blue' },
      ];

      spyOn(runtime.preferences, 'addUserData').and.returnValue(
        of({ url: '', data: mockColors })
      );

      const result = runtime['saveColors'](mockColors);

      expect(await result).toEqual(mockColors);
    });
  });

  describe('fetchStyles', () => {
    it('should set Default styles on failure', async () => {
      const defaultStyle: Style[] = [
        {
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
        },
      ];

      spyOn(runtime['http'], 'get').and.returnValue(of({ body: null }));
      // eslint-disable-next-line
      spyOn<any>(runtime, 'saveStyleData').and.callThrough();

      const result = await runtime.fetchStyles('');

      expect(result).toEqual(defaultStyle);

      expect(runtime['http'].get).toHaveBeenCalledWith(
        runtime['getStyleUrl'](),
        Object({ observe: 'response' })
      );
    });

    it('should handle error on saveStyleData', async () => {
      spyOn(runtime['http'], 'get').and.returnValue(of([]));
      const error = spyOn(console, 'error');
      // eslint-disable-next-line
      spyOn<any>(runtime, 'saveStyleData').and.returnValue(
        Promise.reject(new Error('error'))
      );

      await runtime.fetchStyles('');

      expect(error).toHaveBeenCalledWith(
        'Failed to save default styles',
        jasmine.any(Error)
      );
    });

    it('should handle non-404 errors and reject the promise', async () => {
      const mockUrl = 'https://example.com/styles';
      // eslint-disable-next-line
      spyOn<any>(runtime, 'getStyleUrl').and.returnValue(mockUrl);

      const mockHttpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: mockUrl,
      });

      spyOn(runtime['http'], 'get').and.returnValue(
        throwError(() => mockHttpError)
      );

      const result = await runtime.fetchStyles('');

      expect(result).toBeTruthy();
    });
  });
});
