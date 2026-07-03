/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import {
  DEFAULT_BORDER,
  DEFAULT_LAYOUT,
  DEFAULT_METADATA,
  DEFAULT_TABLE,
  DEFAULT_TYPOGRAPHY,
  EDGE_DEFINITIONS,
} from './table-editor-dialog-defaults';
import type {
  BorderEdgeDefinition,
  BorderStyle,
  LayoutConfig,
  TableDetails,
  TableEditorDefaults,
  TableMetadata,
  TypographyConfig,
} from './table-editor-dialog.model';
import {
  createDefaultEdgeStyles,
  getSelectionMode,
  getTableDimension,
  hasOverflow,
  isInnerEdge,
  normalizeBorderStyle,
  normalizeLayoutForForm,
  normalizeLayoutForResult,
  normalizeMetadata,
  normalizeTableForForm,
  normalizeTableForResult,
  normalizeTypographyForForm,
  normalizeTypographyForResult,
  resolveTableEditorDefaults,
  verticalAlignToFlex,
} from './table-editor-domain';

describe('table-editor-domain', () => {
  describe('resolveTableEditorDefaults', () => {
    it('should merge provided defaults with built-in defaults', () => {
      const defaults: TableEditorDefaults = {
        border: { width: '4px' },
        typography: { fontSize: '18px' },
        layout: { paddingTop: '9px' },
        table: { tableWidth: '320px' },
        metadata: { totalRows: 2 },
        pageLimits: { portrait: { width: 700 } },
      };

      const resolved = resolveTableEditorDefaults(defaults);

      expect(resolved.border.width).toBe('4px');
      expect(resolved.typography.fontSize).toBe('18px');
      expect(resolved.layout.paddingTop).toBe('9px');
      expect(resolved.table.tableWidth).toBe('320px');
      expect(resolved.metadata.totalRows).toBe(2);
      expect(resolved.pageLimits.portrait.width).toBe(700);
    });

    it('should use built-in defaults when none are provided', () => {
      const resolved = resolveTableEditorDefaults({});

      expect(resolved.border).toEqual(DEFAULT_BORDER);
      expect(resolved.typography).toEqual(DEFAULT_TYPOGRAPHY);
      expect(resolved.layout).toEqual(DEFAULT_LAYOUT);
      expect(resolved.table).toEqual(DEFAULT_TABLE);
      expect(resolved.metadata).toEqual(DEFAULT_METADATA);
      expect(resolved.edgeDefinitions).toEqual(EDGE_DEFINITIONS);
    });

    it('should use provided edge definitions when non-empty', () => {
      const customEdges: BorderEdgeDefinition[] = [
        { edge: 'top', label: 'Top', className: 'top', vertical: false, inner: false },
      ];
      const resolved = resolveTableEditorDefaults({
        edgeDefinitions: customEdges,
      });

      expect(resolved.edgeDefinitions).toEqual(customEdges);
    });

    it('should use provided font size options when non-empty', () => {
      const resolved = resolveTableEditorDefaults({
        fontSizeOptions: [10, 20],
      });

      expect(resolved.fontSizeOptions).toEqual([10, 20]);
    });

    it('should use provided border width options when non-empty', () => {
      const resolved = resolveTableEditorDefaults({
        borderWidthOptions: [1, 2],
      });

      expect(resolved.borderWidthOptions).toEqual([1, 2]);
    });

    it('should merge landscape page limits', () => {
      const resolved = resolveTableEditorDefaults({
        pageLimits: { landscape: { width: 800 } },
      });

      expect(resolved.pageLimits.landscape.width).toBe(800);
    });
  });

  describe('normalizeBorderStyle', () => {
    it('should merge partial border style with defaults', () => {
      const defaults: BorderStyle = {
        width: '1px',
        style: 'solid',
        color: '#000000',
      };
      const result = normalizeBorderStyle(defaults, { color: '#ff0000' });

      expect(result).toEqual({
        width: '1px',
        style: 'solid',
        color: '#ff0000',
      });
    });
  });

  describe('normalizeLayoutForForm', () => {
    it('should normalize padding values to number strings', () => {
      const layout: LayoutConfig = {
        paddingLocked: false,
        paddingTop: '10px',
        paddingRight: '5px',
        paddingBottom: '15px',
        paddingLeft: '20px',
      };

      const result = normalizeLayoutForForm(layout);

      expect(result.paddingTop).toBe('10');
      expect(result.paddingRight).toBe('5');
      expect(result.paddingBottom).toBe('15');
      expect(result.paddingLeft).toBe('20');
    });
  });

  describe('normalizeLayoutForResult', () => {
    it('should restore pixel units and apply padding lock', () => {
      const layout: LayoutConfig = {
        paddingLocked: false,
        paddingTop: '10',
        paddingRight: '5',
        paddingBottom: '15',
        paddingLeft: '20',
      };

      const result = normalizeLayoutForResult(layout, true);

      expect(result.paddingLocked).toBe(true);
      expect(result.paddingTop).toBe('10px');
      expect(result.paddingRight).toBe('5px');
      expect(result.paddingBottom).toBe('15px');
      expect(result.paddingLeft).toBe('20px');
    });
  });

  describe('normalizeTypographyForForm', () => {
    it('should normalize typography measurements to number strings', () => {
      const typography: TypographyConfig = {
        fontFamily: 'Arial',
        fontSize: '14px',
        textColor: '#000000',
        backgroundColor: 'transparent',
        bold: false,
        italic: false,
        underline: false,
        letterSpacing: '1.5px',
        lineHeight: '1.35',
        textAlign: 'left',
        verticalAlign: 'top',
      };

      const result = normalizeTypographyForForm(typography);

      expect(result.fontSize).toBe('14');
      expect(result.letterSpacing).toBe('1.5');
      expect(result.lineHeight).toBe('1.35');
    });
  });

  describe('normalizeTypographyForResult', () => {
    it('should restore pixel units for typography values', () => {
      const typography: TypographyConfig = {
        fontFamily: 'Arial',
        fontSize: '14',
        textColor: '#000000',
        backgroundColor: 'transparent',
        bold: false,
        italic: false,
        underline: false,
        letterSpacing: '1.5',
        lineHeight: '1.35',
        textAlign: 'left',
        verticalAlign: 'top',
      };

      const result = normalizeTypographyForResult(typography);

      expect(result.fontSize).toBe('14px');
      expect(result.letterSpacing).toBe('2px');
      expect(result.lineHeight).toBe('1.35');
    });
  });

  describe('normalizeTableForForm', () => {
    it('should normalize table dimensions from px values', () => {
      const value: Partial<TableDetails> = {
        tableWidth: '500px',
        tableHeight: '300px',
        selectedCellWidth: '50px',
        selectedCellHeight: '25px',
      };

      const result = normalizeTableForForm(value, DEFAULT_TABLE);

      expect(result.tableWidth).toBe('500');
      expect(result.tableHeight).toBe('300');
      expect(result.selectedCellWidth).toBe('50');
      expect(result.selectedCellHeight).toBe('25');
      expect(result.tableWidthPx).toBe(500);
      expect(result.tableHeightPx).toBe(300);
      expect(result.selectedCellWidthPx).toBe(50);
      expect(result.selectedCellHeightPx).toBe(25);
    });

    it('should fall back to defaults when values are missing', () => {
      const result = normalizeTableForForm({}, DEFAULT_TABLE);

      // DEFAULT_TABLE uses '--' which normalizes to 0
      expect(result.tableWidth).toBe('0');
      expect(result.tableHeight).toBe('0');
    });

    it('should use px companion values when string values are missing', () => {
      const value: Partial<TableDetails> = {
        tableWidthPx: 600,
        tableHeightPx: 400,
        selectedCellWidthPx: 60,
        selectedCellHeightPx: 30,
      };

      const result = normalizeTableForForm(value, DEFAULT_TABLE);

      expect(result.tableWidth).toBe('600');
      expect(result.tableHeight).toBe('400');
      expect(result.selectedCellWidth).toBe('60');
      expect(result.selectedCellHeight).toBe('30');
    });

    it('should use default page orientation when not provided', () => {
      const result = normalizeTableForForm({}, DEFAULT_TABLE);
      expect(result.pageOrientation).toBe(DEFAULT_TABLE.pageOrientation);
    });

    it('should use provided page orientation', () => {
      const value: Partial<TableDetails> = { pageOrientation: 'landscape' };
      const result = normalizeTableForForm(value, DEFAULT_TABLE);
      expect(result.pageOrientation).toBe('landscape');
    });
  });

  describe('normalizeTableForResult', () => {
    it('should restore pixel units for table dimensions', () => {
      const value: Partial<TableDetails> = {
        tableWidth: '500',
        tableHeight: '300',
        selectedCellWidth: '50',
        selectedCellHeight: '25',
      };

      const result = normalizeTableForResult(value, DEFAULT_TABLE);

      expect(result.tableWidth).toBe('500px');
      expect(result.tableHeight).toBe('300px');
      expect(result.selectedCellWidth).toBe('50px');
      expect(result.selectedCellHeight).toBe('25px');
    });

    it('should handle missing cell dimensions with defaults', () => {
      const result = normalizeTableForResult({}, DEFAULT_TABLE);

      expect(result.tableWidth).toContain('px');
      expect(result.tableHeight).toContain('px');
    });
  });

  describe('normalizeMetadata', () => {
    it('should normalize metadata counts', () => {
      const value: Partial<TableMetadata> = {
        totalRows: 3,
        totalColumns: 4,
      };

      const result = normalizeMetadata(value, DEFAULT_METADATA);

      expect(result.totalRows).toBe(3);
      expect(result.totalColumns).toBe(4);
    });

    it('should fall back to defaults when values are missing', () => {
      const result = normalizeMetadata({}, DEFAULT_METADATA);

      expect(result.totalRows).toBe(DEFAULT_METADATA.totalRows);
      expect(result.totalColumns).toBe(DEFAULT_METADATA.totalColumns);
    });
  });

  describe('createDefaultEdgeStyles', () => {
    it('should create styles for all edges', () => {
      const border: BorderStyle = {
        width: '1px',
        style: 'solid',
        color: '#000000',
      };
      const edges: BorderEdgeDefinition[] = [
        { edge: 'top', label: 'Top', className: 'top', vertical: false, inner: false },
        { edge: 'left', label: 'Left', className: 'left', vertical: false, inner: false },
      ];

      const result = createDefaultEdgeStyles(edges, border);

      expect(Object.keys(result).length).toBe(2);
      expect(result.top).toEqual(border);
      expect(result.left).toEqual(border);
    });

    it('should override specific edge styles', () => {
      const border: BorderStyle = {
        width: '1px',
        style: 'solid',
        color: '#000000',
      };
      const edges: BorderEdgeDefinition[] = [
        { edge: 'top', label: 'Top', className: 'top', vertical: false, inner: false },
      ];

      const result = createDefaultEdgeStyles(edges, border, {
        top: { width: '2px' },
      });

      expect(result.top.width).toBe('2px');
      expect(result.top.style).toBe('solid');
    });
  });

  describe('getSelectionMode', () => {
    it('should return single for 1x1 metadata', () => {
      expect(
        getSelectionMode({ totalRows: 1, totalColumns: 1 })
      ).toBe('single');
    });

    it('should return range when totalRows > 1', () => {
      expect(
        getSelectionMode({ totalRows: 2, totalColumns: 1 })
      ).toBe('range');
    });

    it('should return range when totalColumns > 1', () => {
      expect(
        getSelectionMode({ totalRows: 1, totalColumns: 2 })
      ).toBe('range');
    });
  });

  describe('isInnerEdge', () => {
    it('should return true for insideHorizontal', () => {
      expect(isInnerEdge('insideHorizontal')).toBe(true);
    });

    it('should return true for insideVertical', () => {
      expect(isInnerEdge('insideVertical')).toBe(true);
    });

    it('should return false for exterior edges', () => {
      expect(isInnerEdge('top')).toBe(false);
      expect(isInnerEdge('bottom')).toBe(false);
      expect(isInnerEdge('left')).toBe(false);
      expect(isInnerEdge('right')).toBe(false);
    });
  });

  describe('verticalAlignToFlex', () => {
    it('should map top to flex-start', () => {
      expect(verticalAlignToFlex('top')).toBe('flex-start');
    });

    it('should map middle to center', () => {
      expect(verticalAlignToFlex('middle')).toBe('center');
    });

    it('should map bottom to flex-end', () => {
      expect(verticalAlignToFlex('bottom')).toBe('flex-end');
    });
  });

  describe('hasOverflow', () => {
    it('should return true when value exceeds limit', () => {
      expect(hasOverflow(100, 50)).toBe(true);
    });

    it('should return false when value is within limit', () => {
      expect(hasOverflow(50, 100)).toBe(false);
    });

    it('should return false for infinite values', () => {
      expect(hasOverflow(Infinity, 100)).toBe(false);
    });

    it('should return false for NaN values', () => {
      expect(hasOverflow(Number.NaN, 100)).toBe(false);
    });
  });

  describe('getTableDimension', () => {
    it('should return the numeric value when provided', () => {
      expect(getTableDimension(100, '50')).toBe(100);
    });

    it('should parse the fallback string when value is null', () => {
      expect(getTableDimension(null, '50px')).toBe(50);
    });

    it('should parse the fallback string when value is undefined', () => {
      expect(getTableDimension(undefined, '75px')).toBe(75);
    });
  });
});
