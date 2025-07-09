import { ParsedResumeData, ResumeParsingResult } from '../types/resume';

export class ResumeParserService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly SUPPORTED_FORMATS = ['pdf', 'doc', 'docx'];

  static async parseResume(fileUri: string, fileName: string): Promise<ResumeParsingResult> {
    try {
      const validation = await this.validateFile(fileUri, fileName);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          confidence: 0,
          warnings: []
        };
      }

      // Step 1: Read the file from URI
      const response = await fetch(fileUri);
      const fileBlob = await response.blob();

      // Step 2: Send it to the backend parser
      const parsedResponse = await this.uploadAndParseResume(fileBlob, fileName);

      return parsedResponse;
    } catch (error) {
      console.error('Resume parsing error:', error);
      return {
        success: false,
        error: 'Unexpected error during resume parsing. Please try again.',
        confidence: 0,
        warnings: []
      };
    }
  }

  private static async validateFile(fileUri: string, fileName: string): Promise<{ valid: boolean; error?: string }> {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension || !this.SUPPORTED_FORMATS.includes(extension)) {
      return {
        valid: false,
        error: 'Unsupported file format. Please upload PDF, DOC, or DOCX files only.'
      };
    }

    // Simulate file size check (replace with actual check if available)
    const mockFileSize = Math.random() * 10 * 1024 * 1024;
    if (mockFileSize > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit. Please upload a smaller file.'
      };
    }

    return { valid: true };
  }

  private static async uploadAndParseResume(file: Blob, fileName: string): Promise<ResumeParsingResult> {
    try {
      const formData = new FormData();
      formData.append('resume', file, fileName);

      const response = await fetch('http://localhost:5000/parse', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend Error: ${errorText}`);
      }

      const result = await response.json();

      return {
        success: result.success,
        data: result.data as ParsedResumeData,
        confidence: result.confidence ?? 0.9,
        warnings: result.warnings ?? []
      };
    } catch (err) {
      console.error('Error uploading or parsing resume:', err);
      return {
        success: false,
        error: 'Failed to upload or parse resume via backend',
        confidence: 0,
        warnings: []
      };
    }
  }
}
