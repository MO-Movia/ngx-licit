/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
  asTransformConfig,
  DocxTransformer,
  LicitConverter,
  LicitDocumentJSON,
  parseFrameMakerHTM5Zip,
  processAllTableWidths,
  removeEmptyParagraphFromJSON,
  TransformConfig,
  updateSource,
} from '@modusoperandi/licit-import-utils';

export interface FileProcessingStatus {
  progress: number; // Percentage complete (0-100)
  message: string; // Current status message
  isComplete: boolean; // Whether processing is finished
  result?: string; // Final processed result if applicable
}

@Injectable({
  providedIn: 'root',
})
export class DocumentImporterService {
  public async parseFMZip(
    file: File,
    config?: Partial<TransformConfig>,
  ): Promise<LicitDocumentJSON> {
    const elements = await parseFrameMakerHTM5Zip(file, (f) =>
      toBase64DataUrl(f),
    );
 
    const doc = new LicitConverter(
      asTransformConfig(config)
    ).parseFrameMakerHTML5(elements);
    if (!doc) {
      throw new Error('Unable to parse FrameMaker HTML5 zip.');
    }
    return removeEmptyParagraphFromJSON(doc);
  }

  public async parseJsonFile(file: File): Promise<LicitDocumentJSON> {
    return JSON.parse(await file.text()) as LicitDocumentJSON;
  }

  // Using file reader reads the file and pass the result array buffer to mammoth HTM converter method
  // after converting to HTML the resulted HTML is passed to JSON converter method
  public async parseDocxFile(
    file: File,
    docType: string = "General",
    updateSrc: (src: File) => Promise<string> = toBase64DataUrl,
    config?: Partial<TransformConfig>,
  ): Promise<LicitDocumentJSON> {
    const dom = await new DocxTransformer(
      docType,
      config?.messageSink,
    ).transform(await file.arrayBuffer());

    const imgTags = dom.querySelectorAll('img');
    let counter: number = 1;
    for (const img of Array.from(imgTags)) {
      await updateSource(img, counter++, updateSrc);
    }

    const doc = new LicitConverter(asTransformConfig(config)).parseHTML(dom, true, docType);
    if (docType !== "general") {
      processAllTableWidths(doc);
    }
    return removeEmptyParagraphFromJSON(doc);
  }
}

  async function toBase64DataUrl(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!(file instanceof File)) {
          reject(new Error("Provided input is not a valid File object."));
          return;
        }

        const reader = new FileReader();

        // Success handler
        reader.onload = () => resolve(reader.result as string);

        // Error handler
        reader.onerror = () => reject(new Error("Error reading file."));

        // Read file as Data URL (Base64 encoded)
        reader.readAsDataURL(file);
      });
  }