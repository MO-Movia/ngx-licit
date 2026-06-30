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
} from '@angular/common/http';
import { LocalRuntime } from './localRuntime';
import type { Style } from '@modusoperandi/licit-tiptap/plugins/custom-styles';
import { RecentColor } from '../models/recent-color';
import { LicitNode } from '../models/licit-document';
import { SimpleRuntime } from '../models';

describe('RuntimeService', () => {
  let runtime: RuntimeService;
  let localRuntime: SimpleRuntime;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        LocalRuntime,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    localRuntime = TestBed.inject(LocalRuntime);
    runtime = new RuntimeService(localRuntime);
  });

  it('should be created', () => {
    expect(runtime).toBeTruthy();
  });

  it('should bind all methods in constructor', () => {
    expect(runtime.canUploadImage).toBeDefined();
    expect(runtime.uploadImage).toBeDefined();
    expect(runtime.canUploadVideo).toBeDefined();
    expect(runtime.uploadVideo).toBeDefined();
    expect(runtime.getVideoSrc).toBeDefined();
    expect(runtime.getProxyImageSrc).toBeDefined();
    expect(runtime.canProxyImageSrc).toBeDefined();
    expect(runtime.getAcronyms).toBeDefined();
    expect(runtime.getGlossary).toBeDefined();
    expect(runtime.getRecentColors).toBeDefined();
    expect(runtime.saveRecentColor).toBeDefined();
    expect(runtime.deleteRecentColorById).toBeDefined();
    expect(runtime.openLinkDialog).toBeDefined();
    expect(runtime.goToInnerLinkSection).toBeDefined();
    expect(runtime.fetchInnerLinkSelectionIds).toBeDefined();
    expect(runtime.fetchCompleteDoc).toBeDefined();
  });

  it('should set canEditStyle from api', () => {
    expect(runtime.canEditStyle).toBe(true);
  });

  describe('openLinkDialog', () => {
    it('should call api openLinkDialog if available', () => {
      const spy = vi.fn();
      localRuntime.openLinkDialog = spy;
      runtime = new RuntimeService(localRuntime);
      runtime.openLinkDialog('http://example.com', 'popup');
      expect(spy).toHaveBeenCalledWith('http://example.com', 'popup');
    });

    it('should not throw if api openLinkDialog is not available', () => {
      localRuntime.openLinkDialog = undefined;
      runtime = new RuntimeService(localRuntime);
      expect(() => runtime.openLinkDialog('http://example.com', 'popup')).not.toThrow();
    });
  });

  describe('goToInnerLinkSection', () => {
    it('should call api goToInnerLinkSection if available', () => {
      const spy = vi.fn();
      localRuntime.goToInnerLinkSection = spy;
      runtime = new RuntimeService(localRuntime);
      runtime.goToInnerLinkSection('section-123');
      expect(spy).toHaveBeenCalledWith('section-123');
    });

    it('should not throw if api goToInnerLinkSection is not available', () => {
      localRuntime.goToInnerLinkSection = undefined;
      runtime = new RuntimeService(localRuntime);
      expect(() => runtime.goToInnerLinkSection('section-123')).not.toThrow();
    });
  });

  describe('fetchInnerLinkSelectionIds', () => {
    it('should call api getInnerLinkSections if available', async () => {
      const mockNodes: LicitNode[] = [{ type: 'paragraph', id: '1' }, { type: 'paragraph', id: '2' }] as LicitNode[];
      const spy = vi.fn().mockResolvedValue(mockNodes);
      localRuntime.getInnerLinkSections = spy;
      runtime = new RuntimeService(localRuntime);
      const result = await runtime.fetchInnerLinkSelectionIds(['style1', 'style2']);
      expect(spy).toHaveBeenCalledWith(['style1', 'style2']);
      expect(result).toEqual(mockNodes);
    });

    it('should return empty array if api getInnerLinkSections is not available', async () => {
      localRuntime.getInnerLinkSections = undefined;
      runtime = new RuntimeService(localRuntime);
      const result = await runtime.fetchInnerLinkSelectionIds(['style1']);
      expect(result).toEqual([]);
    });
  });

  describe('fetchCompleteDoc', () => {
    it('should call api getCompleteDoc if available', () => {
      const mockDoc: LicitNode = { type: 'doc', id: 'doc-1' };
      const spy = vi.fn().mockReturnValue(mockDoc);
      localRuntime.getCompleteDoc = spy;
      runtime = new RuntimeService(localRuntime);
      const result = runtime.fetchCompleteDoc();
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual(mockDoc);
    });

    it('should return empty object if api getCompleteDoc is not available', () => {
      localRuntime.getCompleteDoc = undefined;
      runtime = new RuntimeService(localRuntime);
      const result = runtime.fetchCompleteDoc();
      expect(result).toEqual({});
    });
  });

  describe('getAcronyms', () => {
    it('should resolve acronyms content', async () => {
      const result = await runtime.getAcronyms();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getGlossary', () => {
    it('should resolve glossary content', async () => {
      const result = await runtime.getGlossary();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('canUploadImage', () => {
    it('should return true', () => {
      expect(runtime.canUploadImage()).toBe(true);
    });
  });

  describe('uploadImage', () => {
    it('should call api uploadImage', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockResult = { src: 'http://example.com/image.png', id: '1', width: 100, height: 100 };
      const spy = vi.spyOn(localRuntime, 'uploadImage').mockResolvedValue(mockResult);
      const result = await runtime.uploadImage(mockBlob);
      expect(spy).toHaveBeenCalledWith(mockBlob);
      expect(result).toEqual(mockResult);
    });
  });

  describe('canProxyImageSrc', () => {
    it('should return true', () => {
      expect(runtime.canProxyImageSrc()).toBe(true);
    });
  });

  describe('getProxyImageSrc', () => {
    it('should call api getProxyImageSrc', async () => {
      const mockSrc = 'http://example.com/image.png';
      const mockResult = 'http://proxy.example.com/image.png';
      const spy = vi.spyOn(localRuntime, 'getProxyImageSrc').mockResolvedValue(mockResult);
      const result = await runtime.getProxyImageSrc(mockSrc);
      expect(spy).toHaveBeenCalledWith(mockSrc);
      expect(result).toEqual(mockResult);
    });
  });

  describe('canUploadVideo', () => {
    it('should return true', () => {
      expect(runtime.canUploadVideo()).toBe(true);
    });
  });

  describe('uploadVideo', () => {
    it('should call api uploadVideo', async () => {
      const mockFile = new File(['test'], 'video.mp4', { type: 'video/mp4' });
      const mockResult = { src: 'http://example.com/video.mp4', id: '1', width: 100, height: 100 };
      const spy = vi.spyOn(localRuntime, 'uploadVideo').mockResolvedValue(mockResult);
      const result = await runtime.uploadVideo(mockFile);
      expect(spy).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(mockResult);
    });
  });

  describe('canProxyVideoSrc', () => {
    it('should return false', () => {
      expect(runtime.canProxyVideoSrc()).toBe(false);
    });
  });

  describe('getVideoSrc', () => {
    it('should call api getVideoSrc', async () => {
      const mockId = 'video-123';
      const mockResult = 'http://example.com/video.mp4';
      const spy = vi.spyOn(localRuntime, 'getVideoSrc').mockResolvedValue(mockResult);
      const result = await runtime.getVideoSrc(mockId);
      expect(spy).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getStylesAsync', () => {
    it('should call api getStyles', async () => {
      const mockStyles: Style[] = [
        { styleName: 'style1' },
        { styleName: 'style2' },
      ];
      const spy = vi.spyOn(localRuntime, 'getStyles').mockResolvedValue(mockStyles);
      const result = await runtime.getStylesAsync();
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual(mockStyles);
    });
  });

  describe('getRecentColors', () => {
    it('should call api getColors', async () => {
      const mockColors: RecentColor[] = [
        { id: 1, color: '#FF0000' },
        { id: 2, color: '#00FF00' },
      ];
      const spy = vi.spyOn(localRuntime, 'getColors').mockResolvedValue(mockColors);
      const result = await runtime.getRecentColors();
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual(mockColors);
    });
  });

  describe('renameStyle', () => {
    it('should rename style and call api saveStyles', async () => {
      const mockStyles: Style[] = [
        { styleName: 'oldName' },
        { styleName: 'other' },
      ];
      vi.spyOn(localRuntime, 'getStyles').mockResolvedValue(mockStyles);
      const saveSpy = vi.spyOn(localRuntime, 'saveStyles').mockResolvedValue(mockStyles);
      
      await runtime.renameStyle('oldName', 'newName');
      
      expect(saveSpy).toHaveBeenCalled();
      const savedStyles = saveSpy.mock.calls[0][0];
      expect(savedStyles[0].styleName).toBe('newName');
      expect(savedStyles[1].styleName).toBe('other');
    });
  });

  describe('removeStyle', () => {
    it('should remove style and call api saveStyles', async () => {
      const mockStyles: Style[] = [
        { styleName: 'style1' },
        { styleName: 'style2' },
      ];
      vi.spyOn(localRuntime, 'getStyles').mockResolvedValue(mockStyles);
      const saveSpy = vi.spyOn(localRuntime, 'saveStyles').mockResolvedValue([mockStyles[1]]);
      
      await runtime.removeStyle('style1');
      
      expect(saveSpy).toHaveBeenCalled();
      const savedStyles = saveSpy.mock.calls[0][0];
      expect(savedStyles).toHaveLength(1);
      expect(savedStyles[0].styleName).toBe('style2');
    });
  });

  describe('deleteRecentColorById', () => {
    it('should delete color by id and call api saveColors', async () => {
      const mockColors: RecentColor[] = [
        { id: 1, color: '#FF0000' },
        { id: 2, color: '#00FF00' },
      ];
      vi.spyOn(localRuntime, 'getColors').mockResolvedValue(mockColors);
      const saveSpy = vi.spyOn(localRuntime, 'saveColors').mockResolvedValue([mockColors[1]]);
      
      await runtime.deleteRecentColorById(1);
      
      expect(saveSpy).toHaveBeenCalled();
      const savedColors = saveSpy.mock.calls[0][0];
      expect(savedColors).toHaveLength(1);
      expect(savedColors[0].id).toBe(2);
    });
  });

  describe('saveStyle', () => {
    it('should save style and call api saveStyles', async () => {
      const mockStyles: Style[] = [
        { styleName: 'existing' },
      ];
      const newStyle: Style = { styleName: 'newStyle' };
      vi.spyOn(localRuntime, 'getStyles').mockResolvedValue(mockStyles);
      const saveSpy = vi.spyOn(localRuntime, 'saveStyles').mockResolvedValue([...mockStyles, newStyle]);
      
      const result = await runtime.saveStyle(newStyle);
      
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(newStyle);
    });

    it('should update existing style with same name', async () => {
      const mockStyles: Style[] = [
        { styleName: 'style1' },
      ];
      const updatedStyle: Style = { styleName: 'style1' };
      vi.spyOn(localRuntime, 'getStyles').mockResolvedValue(mockStyles);
      const saveSpy = vi.spyOn(localRuntime, 'saveStyles').mockResolvedValue([updatedStyle]);
      
      await runtime.saveStyle(updatedStyle);
      
      expect(saveSpy).toHaveBeenCalled();
      const savedStyles = saveSpy.mock.calls[0][0];
      expect(savedStyles).toHaveLength(1);
    });
  });

  describe('saveStyleSet', () => {
    it('should save style set and call api saveStyles', async () => {
      const mockStyles: Style[] = [
        { styleName: 'style1' },
        { styleName: 'style2' },
      ];
      const saveSpy = vi.spyOn(localRuntime, 'saveStyles').mockResolvedValue(mockStyles);
      
      const result = await runtime.saveStyleSet(mockStyles);
      
      expect(saveSpy).toHaveBeenCalledWith(mockStyles);
      expect(result).toEqual(mockStyles);
    });
  });

  describe('saveRecentColor', () => {
    it('should call api saveColors', async () => {
      const mockColors: RecentColor[] = [
        { id: 1, color: '#FF0000' },
      ];
      const saveSpy = vi.spyOn(localRuntime, 'saveColors').mockResolvedValue(mockColors);
      
      const result = await runtime.saveRecentColor(mockColors);
      
      expect(saveSpy).toHaveBeenCalledWith(mockColors);
      expect(result).toEqual(mockColors);
    });
  });

  describe('Citation Runtime', () => {
    describe('saveCitation', () => {
      it('should save citation and return citations', async () => {
        const citation = { referenceId: 'ref1' };
        const result = await runtime.saveCitation(citation);
        expect(result).toContainEqual(citation);
      });

      it('should replace existing citation with same referenceId', async () => {
        await runtime.saveCitation({ referenceId: 'ref1' });
        await runtime.saveCitation({ referenceId: 'ref2' });
        const result = await runtime.saveCitation({ referenceId: 'ref1' });
        expect(result).toHaveLength(2);
        expect(result.filter((c) => c.referenceId === 'ref1')).toHaveLength(1);
      });
    });

    describe('fetchCitations', () => {
      it('should return citations', async () => {
        await runtime.saveCitation({ referenceId: 'ref1' });
        const result = runtime.fetchCitations();
        expect(result).toContainEqual({ referenceId: 'ref1' });
      });
    });

    describe('getCitationsAsync', () => {
      it('should return citations as promise', async () => {
        await runtime.saveCitation({ referenceId: 'ref1' });
        const result = await runtime.getCitationsAsync();
        expect(result).toContainEqual({ referenceId: 'ref1' });
      });
    });

    describe('removeCitation', () => {
      it('should remove citation by referenceId', async () => {
        await runtime.saveCitation({ referenceId: 'ref1' });
        await runtime.saveCitation({ referenceId: 'ref2' });
        const result = await runtime.removeCitation('ref1');
        expect(result).toHaveLength(1);
        expect(result[0].referenceId).toBe('ref2');
      });

      it('should return empty array if citation not found', async () => {
        const result = await runtime.removeCitation('nonexistent');
        expect(result).toHaveLength(0);
      });
    });
  });
});
