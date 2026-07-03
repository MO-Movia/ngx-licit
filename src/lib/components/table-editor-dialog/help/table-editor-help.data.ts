/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

/** One titled help text section displayed in the help dialog. */
export interface TableEditorHelpSection {
  title: string;
  body: string;
}

/** Help content for one table editor tab. */
export interface TableEditorHelpEntry {
  title: string;
  steps: string[];
  sections: TableEditorHelpSection[];
}

/** Contextual help entries in the same order as the table editor tabs. */
export const TABLE_EDITOR_HELP: TableEditorHelpEntry[] = [
  {
    title: 'Help: Borders & Shading',
    steps: ['Select Edge', 'Pick Color & Weight', 'Click Apply'],
    sections: [
      {
        title: 'Interactive Border Map',
        body: 'Click on any line segment in the wireframe diagram to select that specific edge of your table. Active edges will glow. You can select multiple edges at once to apply the same style across all of them.',
      },
      {
        title: 'Line Weight & Style',
        body: 'Choose between solid, dashed, or double lines. Use the numbered buttons for quick 1px, 2px, or 3px thicknesses. For heavier borders, use the custom input field next to the standard buttons and type any pixel value directly.',
      },
      {
        title: 'Applying Changes',
        body: 'Colors and styles are applied to your active edges the moment you select them. Click Apply at the bottom of the dialog to commit these changes to your actual document table.',
      },
    ],
  },
  {
    title: 'Help: Typography & Padding',
    steps: ['Set Padding', 'Adjust Typography', 'View Preview'],
    sections: [
      {
        title: 'Padding & The Lock Icon',
        body: 'Padding controls the physical buffer space between your text and the cell borders. By default, the lock icon is active, meaning changing one padding value will synchronize all four sides. Click the lock to unlock it and adjust sides individually.',
      },
      {
        title: 'Advanced Spacing',
        body: 'The letter spacing control allows you to push characters apart with positive numbers, or pull them closer together using negative numbers. The line height control accepts decimal points, such as 1.25, to adjust vertical breathing room.',
      },
      {
        title: 'Live Preview',
        body: 'The center text box provides a real-time preview of your formatting. Transparent cell backgrounds are placed over a high-contrast checkerboard with a soft gray wash to ensure text remains highly legible.',
      },
    ],
  },
  {
    title: 'Help: Table Details',
    steps: ['Check Dimensions', 'Note Red Warnings'],
    sections: [
      {
        title: 'Orientation Checking',
        body: 'This read-only panel compares your physical table against standard printable page sizes. Select either Portrait or Landscape to see how your current table footprint fits onto the target canvas.',
      },
      {
        title: 'Overflow Warnings',
        body: 'The visualization map on the right displays the document limits along its edges. If your table becomes too wide or too tall, the specific dimension readout will turn red, and the overflowing boundary line on the map will highlight to alert you.',
      },
      {
        title: 'Grid Analysis',
        body: 'The system automatically calculates the total rows and the absolute maximum columns of your table, actively accounting for complex designs where cells have been merged horizontally.',
      },
    ],
  },
];
