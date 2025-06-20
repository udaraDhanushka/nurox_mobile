// services/OCRService.ts
import TextRecognition from '@react-native-ml-kit/text-recognition';

interface OCRResult {
  text: string;
  blocks: TextBlock[];
}

interface TextBlock {
  text: string;
  frame: BoundingBox;
  lines: TextLine[];
}

interface TextLine {
  text: string;
  frame: BoundingBox;
  elements: TextElement[];
}

interface TextElement {
  text: string;
  frame: BoundingBox;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  confidence: number;
  detected: boolean;
  source: 'detected' | 'manual';
  boundingBox?: BoundingBox;
  createdAt: string;
}

export class OCRService {
  // Enhanced medicine name patterns with more comprehensive detection
  private readonly MEDICINE_PATTERNS = [
    // Exact known medicines (high confidence)
    /\b(lisinopril|metformin|aspirin|atorvastatin|amlodipine|omeprazole|simvastatin|losartan|hydrochlorothiazide|levothyroxine|gabapentin|sertraline|escitalopram|duloxetine|trazodone|clonazepam|lorazepam|alprazolam|zolpidem|pantoprazole|esomeprazole|ranitidine|famotidine|citalopram|fluoxetine|paroxetine|venlafaxine|bupropion|mirtazapine|quetiapine|aripiprazole|risperidone|olanzapine|haloperidol|ibuprofen|acetaminophen|tylenol|advil|motrin|aleve|naproxen|prednisone|warfarin|digoxin|furosemide|lipitor|crestor|norvasc|prinivil|zestril|glucophage|nexium|prilosec|zocor|cozaar|microzide|synthroid|neurontin|zoloft|lexapro|cymbalta|xanax|ativan|klonopin|ambien|protonix|prevacid|pepcid|celexa|prozac|paxil|effexor|wellbutrin|remeron|seroquel|abilify|risperdal|zyprexa|haldol)\b/gi,
    
    // Common OTC medicines and supplements
    /\b(vitamin|calcium|iron|magnesium|zinc|omega|multivitamin|fish oil|glucosamine|coq10|biotin|folic acid|b12|d3|b6|thiamine|riboflavin|niacin|pantothenic|pyridoxine|cobalamin|ascorbic|tocopherol|phylloquinone|biotin|choline)\b/gi,
    
    // Medicine suffixes (medium confidence)
    /\b[A-Za-z]{3,}(?:ol|in|ine|ate|ide|oxin|mycin|cillin|nacin|pril|sartan|pine|zole|tinib|mab|ex|ax|ix|um|an|yl|ic)\b/gi,
    
    // Generic patterns for medicine names (usually capitalized)
    /\b[A-Z][a-z]+(?:ol|in|ine|ate|ide|oxin|mycin|cillin|nacin|pril|sartan|pine|zole|tinib|mab)\b/g,
    
    // Any capitalized word that could be a medicine (4+ letters for testing)
    /\b[A-Z][a-z]{3,}\b/g,
    
    // Medicine with dosage patterns
    /\b[A-Za-z]{3,}\s+\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?|iu)\b/gi,
  ];

  // Enhanced dosage patterns
  private readonly DOSAGE_PATTERNS = [
    /\b\d+(?:\.\d+)?\s*(?:mg|mcg|μg|g|ml|mL|units?|iu|IU|mEq|meq)\b/gi,
    /\b\d+(?:\.\d+)?\/\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml)\b/gi, // combination dosages like 5/10mg
    /\b\d+(?:\.\d+)?\s*(?:milligram|microgram|gram|milliliter|unit|international unit)s?\b/gi,
  ];

  // Enhanced frequency patterns
  private readonly FREQUENCY_PATTERNS = [
    /\b(?:once|twice|three times?|four times?|\d+\s*times?)\s*(?:daily|a day|per day|every day|each day)\b/gi,
    /\b(?:once|twice|three times?|four times?|\d+\s*times?)\s*(?:weekly|a week|per week|each week)\b/gi,
    /\bevery\s+\d+\s+hours?\b/gi,
    /\b(?:morning|evening|night|bedtime|breakfast|lunch|dinner|with meals|before meals|after meals)\b/gi,
    /\b(?:as needed|prn|when necessary|if needed)\b/gi,
    /\b(?:bid|tid|qid|qd|q\d+h|qam|qpm|qhs|ac|pc|hs)\b/gi, // Medical abbreviations
    /\b(?:take\s+)?\d+\s*(?:tablet|capsule|pill)s?\s*(?:daily|twice daily|once daily|as directed)\b/gi,
  ];

  /**
   * Test method for basic OCR functionality
   */
  async testOCRBasic(imageUri: string): Promise<void> {
    try {
      console.log('🧪 Testing basic OCR functionality...');
      console.log('📸 Image URI:', imageUri);
      
      const result = await TextRecognition.recognize(imageUri);
      
      console.log('📄 Raw ML Kit Result:');
      console.log('- Has text:', !!result?.text);
      console.log('- Text length:', result?.text?.length || 0);
      console.log('- Full text:', result?.text);
      console.log('- Blocks count:', result?.blocks?.length || 0);
      
      if (result?.blocks) {
        result.blocks.forEach((block, index) => {
          console.log(`📦 Block ${index}:`, block.text);
        });
      }
      
      // Test our medicine patterns
      if (result?.text) {
        console.log('🔍 Testing medicine patterns on extracted text...');
        const lines = result.text.split('\n');
        lines.forEach((line, index) => {
          console.log(`Line ${index}: "${line}"`);
          const medicines = this.extractMedicineNames(line);
          if (medicines.length > 0) {
            console.log(`💊 Found medicines in line: ${medicines}`);
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Basic OCR test failed:', error);
    }
  }

  /**
   * Extract text from image using ML Kit with enhanced error handling
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      // Validate image URI
      if (!this.validateImageUri(imageUri)) {
        throw new Error('Invalid image format or path. Please use JPG, PNG, or other supported formats.');
      }

      console.log('🔍 Processing image URI:', imageUri);

      // Ensure proper URI format for ML Kit
      let processedUri = imageUri;
      
      // Handle different URI formats
      if (imageUri.startsWith('content://') || imageUri.startsWith('file://') || imageUri.startsWith('ph://')) {
        processedUri = imageUri;
      } else if (imageUri.startsWith('/')) {
        processedUri = `file://${imageUri}`;
      } else if (!imageUri.startsWith('http')) {
        // Assume it's a local path
        processedUri = `file://${imageUri}`;
      }

      console.log('📱 Processed URI for ML Kit:', processedUri);

      const result = await TextRecognition.recognize(processedUri);
      
      console.log('📊 OCR Result Summary:', {
        hasText: !!result?.text,
        textLength: result?.text?.length || 0,
        blocksCount: result?.blocks?.length || 0,
        firstBlock: result?.blocks?.[0]?.text?.substring(0, 100) || 'No blocks'
      });

      // Handle case where result might not have blocks
      if (!result || !result.blocks) {
        console.warn('⚠️ No text blocks found in image');
        return {
          text: result?.text || '',
          blocks: [],
        };
      }

      const blocks: TextBlock[] = result.blocks.map(block => ({
        text: block.text || '',
        frame: this.convertFrame(block.frame),
        lines: (block.lines || []).map(line => ({
          text: line.text || '',
          frame: this.convertFrame(line.frame),
          elements: (line.elements || []).map(element => ({
            text: element.text || '',
            frame: this.convertFrame(element.frame),
          })),
        })),
      }));

      console.log('✅ Successfully processed OCR with', blocks.length, 'text blocks');

      return {
        text: result.text || '',
        blocks,
      };
    } catch (error) {
      console.error('❌ OCR extraction failed:', error);
      
      // Safely extract error message
      const errorMessage = this.getErrorMessage(error);
      
      // Provide more specific error messages
      if (errorMessage.includes('permission')) {
        throw new Error('Permission denied: Cannot access image file');
      } else if (errorMessage.includes('not found')) {
        throw new Error('Image file not found or invalid path');
      } else if (errorMessage.includes('format')) {
        throw new Error('Unsupported image format. Please use JPG, PNG, or other common formats');
      } else {
        throw new Error(`Failed to extract text from image: ${errorMessage}`);
      }
    }
  }

  /**
   * Convert ML Kit frame to our BoundingBox format
   */
  private convertFrame(frame: any): BoundingBox {
    if (!frame) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    // ML Kit uses different property names depending on platform
    const x = frame.x ?? frame.left ?? frame.origin?.x ?? 0;
    const y = frame.y ?? frame.top ?? frame.origin?.y ?? 0;
    const width = frame.width ?? (frame.right ? frame.right - x : 0);
    const height = frame.height ?? (frame.bottom ? frame.bottom - y : 0);

    return { x, y, width, height };
  }

  /**
   * Safely extract error message from unknown error type
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }
    return 'Unknown error occurred';
  }

  /**
   * Validate image format and accessibility
   */
  private validateImageUri(imageUri: string): boolean {
    if (!imageUri || typeof imageUri !== 'string') {
      return false;
    }

    // Check for valid image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'];
    const hasValidExtension = validExtensions.some(ext => 
      imageUri.toLowerCase().includes(ext)
    );

    // Accept URIs without extensions if they're from camera or gallery
    const isValidUri = hasValidExtension || 
                      imageUri.includes('content://') || 
                      imageUri.includes('file://') ||
                      imageUri.includes('ph://'); // iOS Photos

    return isValidUri;
  }

  /**
   * Enhanced prescription text analysis with comprehensive debugging
   */
  async analyzePrescriptionText(ocrResult: OCRResult): Promise<DetectedMedicine[]> {
    const { text, blocks } = ocrResult;
    const detectedMedicines: DetectedMedicine[] = [];
    
    console.log('🔍 Analyzing text for medicines...');
    console.log('📄 Full text to analyze:', text);
    
    // Split text into lines for analysis
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    console.log(`📋 Processing ${lines.length} lines`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`🔍 Analyzing line ${i + 1}: "${line}"`);
      
      // Skip header information, dates, doctor names, etc.
      if (this.isHeaderOrFooterLine(line)) {
        console.log(`⏭️ Skipping header/footer line: "${line}"`);
        continue;
      }
      
      // Look for medicine names
      const medicineMatches = this.extractMedicineNames(line);
      console.log(`💊 Found potential medicines in line: [${medicineMatches.join(', ')}]`);
      
      for (const medicineName of medicineMatches) {
        // Look for dosage in current line or nearby lines
        const dosage = this.extractDosage(line, lines, i);
        
        // Look for frequency in current line or nearby lines
        const frequency = this.extractFrequency(line, lines, i);
        
        // Find bounding box for this medicine
        const boundingBox = this.findBoundingBox(medicineName, blocks);
        
        // Calculate confidence based on various factors
        const confidence = this.calculateConfidence(medicineName, dosage, frequency, line);
        
        console.log(`💊 Medicine candidate: "${medicineName}" | Dosage: "${dosage}" | Frequency: "${frequency}" | Confidence: ${confidence.toFixed(2)}`);
        
        // Lowered confidence threshold for better detection during testing
        if (confidence > 0.15) { // Lowered from 0.3 to 0.15
          const medicine: DetectedMedicine = {
            id: `detected_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: this.cleanMedicineName(medicineName),
            dosage: dosage || 'Not specified',
            frequency: frequency || 'As directed',
            confidence,
            detected: true,
            source: 'detected',
            boundingBox,
            createdAt: new Date().toISOString(),
          };
          
          detectedMedicines.push(medicine);
          console.log(`✅ Added medicine: ${JSON.stringify(medicine, null, 2)}`);
        } else {
          console.log(`❌ Rejected medicine "${medicineName}" due to low confidence: ${confidence.toFixed(2)}`);
        }
      }
    }

    console.log(`🎯 Total medicines before deduplication: ${detectedMedicines.length}`);
    
    // Remove duplicates and improve results
    const finalMedicines = this.deduplicateAndRefine(detectedMedicines);
    console.log(`✅ Final medicines after deduplication: ${finalMedicines.length}`);
    console.log('📋 Final medicine list:', finalMedicines.map(m => ({ name: m.name, confidence: m.confidence })));
    
    return finalMedicines;
  }

  /**
   * Extract medicine names from a line of text with enhanced patterns
   */
  private extractMedicineNames(line: string): string[] {
    const medicines: string[] = [];
    
    console.log(`🔍 Testing patterns on line: "${line}"`);
    
    for (let i = 0; i < this.MEDICINE_PATTERNS.length; i++) {
      const pattern = this.MEDICINE_PATTERNS[i];
      const matches = line.match(pattern);
      if (matches) {
        console.log(`✅ Pattern ${i} matched: [${matches.join(', ')}]`);
        medicines.push(...matches);
      }
    }
    
    const uniqueMedicines = [...new Set(medicines)]; // Remove duplicates
    console.log(`💊 Unique medicines found: [${uniqueMedicines.join(', ')}]`);
    
    return uniqueMedicines;
  }

  /**
   * Extract dosage information with enhanced patterns
   */
  private extractDosage(currentLine: string, allLines: string[], lineIndex: number): string | null {
    // Check current line first
    for (const pattern of this.DOSAGE_PATTERNS) {
      const match = currentLine.match(pattern);
      if (match) {
        console.log(`💊 Found dosage in current line: "${match[0]}"`);
        return match[0];
      }
    }
    
    // Check adjacent lines
    const adjacentLines = [
      allLines[lineIndex - 1],
      allLines[lineIndex + 1],
    ].filter(Boolean);
    
    for (const line of adjacentLines) {
      for (const pattern of this.DOSAGE_PATTERNS) {
        const match = line.match(pattern);
        if (match) {
          console.log(`💊 Found dosage in adjacent line: "${match[0]}"`);
          return match[0];
        }
      }
    }
    
    return null;
  }

  /**
   * Extract frequency information with enhanced patterns
   */
  private extractFrequency(currentLine: string, allLines: string[], lineIndex: number): string | null {
    // Check current line first
    for (const pattern of this.FREQUENCY_PATTERNS) {
      const match = currentLine.match(pattern);
      if (match) {
        console.log(`⏰ Found frequency in current line: "${match[0]}"`);
        return match[0];
      }
    }
    
    // Check adjacent lines
    const adjacentLines = [
      allLines[lineIndex - 1],
      allLines[lineIndex + 1],
    ].filter(Boolean);
    
    for (const line of adjacentLines) {
      for (const pattern of this.FREQUENCY_PATTERNS) {
        const match = line.match(pattern);
        if (match) {
          console.log(`⏰ Found frequency in adjacent line: "${match[0]}"`);
          return match[0];
        }
      }
    }
    
    return null;
  }

  /**
   * Find bounding box for detected text
   */
  private findBoundingBox(text: string, blocks: TextBlock[]): BoundingBox | undefined {
    for (const block of blocks) {
      if (block.text && block.text.toLowerCase().includes(text.toLowerCase())) {
        // Find the specific line containing the text
        for (const line of block.lines) {
          if (line.text && line.text.toLowerCase().includes(text.toLowerCase())) {
            // Return line frame if it has valid dimensions
            if (line.frame && (line.frame.width > 0 || line.frame.height > 0)) {
              return line.frame;
            }
          }
        }
        // Return block frame if it has valid dimensions
        if (block.frame && (block.frame.width > 0 || block.frame.height > 0)) {
          return block.frame;
        }
      }
    }
    return undefined;
  }

  /**
   * Enhanced confidence calculation with better weighting
   */
  private calculateConfidence(
    medicineName: string, 
    dosage: string | null, 
    frequency: string | null, 
    originalLine: string
  ): number {
    let confidence = 0.2; // Lower base confidence for testing
    
    console.log(`🎯 Calculating confidence for "${medicineName}"`);
    
    // High confidence for exact known medicines
    if (this.MEDICINE_PATTERNS[0].test(medicineName)) {
      confidence += 0.6; // Known medicine name
      console.log(`✅ Known medicine bonus: +0.6`);
    }
    
    // Medium confidence for medicine-like suffixes
    if (/(?:ol|in|ine|ate|ide|oxin|mycin|cillin|nacin|pril|sartan|pine|zole|tinib|mab)$/i.test(medicineName)) {
      confidence += 0.3;
      console.log(`✅ Medicine suffix bonus: +0.3`);
    }
    
    // Increase confidence if dosage is found
    if (dosage) {
      confidence += 0.2;
      console.log(`✅ Dosage found bonus: +0.2`);
    }
    
    // Increase confidence if frequency is found
    if (frequency) {
      confidence += 0.1;
      console.log(`✅ Frequency found bonus: +0.1`);
    }
    
    // Reduced penalty for short names during testing
    if (medicineName.length < 4) {
      confidence -= 0.1;
      console.log(`❌ Short name penalty: -0.1`);
    }
    
    // Increase confidence if the line contains typical prescription indicators
    const prescriptionIndicators = /\b(take|tablet|capsule|pill|medication|rx|prescription|dose|daily|twice|once|mg|mcg)\b/i;
    if (prescriptionIndicators.test(originalLine)) {
      confidence += 0.15;
      console.log(`✅ Prescription context bonus: +0.15`);
    }
    
    // Increase confidence for capitalized words (likely proper nouns/medicine names)
    if (/^[A-Z][a-z]+$/.test(medicineName)) {
      confidence += 0.1;
      console.log(`✅ Proper capitalization bonus: +0.1`);
    }
    
    const finalConfidence = Math.min(Math.max(confidence, 0), 1);
    console.log(`🎯 Final confidence for "${medicineName}": ${finalConfidence.toFixed(2)}`);
    
    return finalConfidence;
  }

  /**
   * Check if a line is likely header/footer information
   */
  private isHeaderOrFooterLine(line: string): boolean {
    const headerFooterPatterns = [
      /^(dr\.?|doctor|physician|clinic|hospital|pharmacy)/i,
      /\b(phone|fax|address|email|website|www\.)\b/i,
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // Date patterns
      /^(patient|name|dob|address|city|state|zip):/i,
      /^(rx|prescription)#?\s*\d+/i,
      /^\d{10,}$/, // Long numbers (phone, account numbers)
      /^[A-Z]{2,}\s+\d{5}$/, // State ZIP codes
    ];
    
    return headerFooterPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Clean and standardize medicine names
   */
  private cleanMedicineName(name: string): string {
    return name
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase()); // Title case
  }

  /**
   * Remove duplicates and refine results
   */
  private deduplicateAndRefine(medicines: DetectedMedicine[]): DetectedMedicine[] {
    const uniqueMedicines = new Map<string, DetectedMedicine>();
    
    for (const medicine of medicines) {
      const key = medicine.name.toLowerCase();
      
      if (!uniqueMedicines.has(key) || 
          uniqueMedicines.get(key)!.confidence < medicine.confidence) {
        uniqueMedicines.set(key, medicine);
      }
    }
    
    return Array.from(uniqueMedicines.values())
      .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
  }

  /**
   * Main method to process prescription image with comprehensive debugging
   */
  async processPrescriptionImage(imageUri: string): Promise<{
    detectedMedicines: DetectedMedicine[];
    ocrText: string;
    confidence: number;
    processingTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting prescription image processing...');
      console.log('📸 Image URI:', imageUri);
      
      // Validate image URI first
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('Invalid image URI: must be a valid string path');
      }

      // Extract text using OCR
      console.log('📝 Step 1: Extracting text from image...');
      const ocrResult = await this.extractTextFromImage(imageUri);
      
      console.log('📝 OCR Raw Result:', {
        hasText: !!ocrResult.text,
        textLength: ocrResult.text?.length || 0,
        blocksCount: ocrResult.blocks?.length || 0,
        fullText: ocrResult.text // Important: Log the full extracted text
      });
      
      if (!ocrResult.text || ocrResult.text.trim().length === 0) {
        console.warn('⚠️ No text extracted from image');
        return {
          detectedMedicines: [],
          ocrText: '',
          confidence: 0,
          processingTime: (Date.now() - startTime) / 1000,
        };
      }

      console.log('🔍 Step 2: Analyzing extracted text for medicines...');
      console.log('📄 Full extracted text:', ocrResult.text);
      
      // Split into lines for detailed analysis
      const lines = ocrResult.text.split('\n').filter(line => line.trim().length > 0);
      console.log('📋 Lines found:', lines.length);
      lines.forEach((line, index) => {
        console.log(`Line ${index + 1}: "${line}"`);
      });
      
      // Analyze text to detect medicines
      const detectedMedicines = await this.analyzePrescriptionText(ocrResult);
      
      console.log('💊 Step 3: Medicine detection complete');
      console.log('🎯 Detected medicines:', detectedMedicines);
      
      // Calculate overall confidence
      const overallConfidence = detectedMedicines.length > 0
        ? detectedMedicines.reduce((sum, med) => sum + med.confidence, 0) / detectedMedicines.length
        : 0;
      
      const processingTime = (Date.now() - startTime) / 1000;
      
      console.log('📊 Processing summary:', {
        processingTime: processingTime.toFixed(2) + 's',
        medicinesFound: detectedMedicines.length,
        overallConfidence: (overallConfidence * 100).toFixed(1) + '%'
      });
      
      // IMPORTANT: Always return actual results, never hardcoded mock data
      return {
        detectedMedicines,
        ocrText: ocrResult.text,
        confidence: overallConfidence,
        processingTime,
      };
    } catch (error) {
      console.error('❌ Prescription processing failed:', error);
      
      const errorMessage = this.getErrorMessage(error);
      const processingTime = (Date.now() - startTime) / 1000;
      
      throw new Error(`Prescription processing failed after ${processingTime.toFixed(2)}s: ${errorMessage}`);
    }
  }
}

// Create and export a singleton instance
const ocrService = new OCRService();
export default ocrService;