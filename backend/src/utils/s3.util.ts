/**
 * S3 Utility for Image Uploads
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { AWS_CONFIG } from '../constants';

// Multer file type definition
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export class S3Util {
  private static client = new S3Client({ region: AWS_CONFIG.REGION });

  /**
   * Upload an image file to S3
   * @param file - Multer file object
   * @param userId - User ID for organizing files
   * @returns S3 URL of uploaded image
   */
  static async uploadImage(file: MulterFile, userId: string): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: AWS_CONFIG.S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    return `https://${AWS_CONFIG.S3_BUCKET}.s3.${AWS_CONFIG.REGION}.amazonaws.com/${fileName}`;
  }

  /**
   * Validate image file type and size
   * @param file - Multer file object
   * @throws Error if file is invalid
   */
  static validateImageFile(file: MulterFile): void {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }
  }

  /**
   * Process section data and upload any image files
   * Returns the section data with S3 URLs injected for image fields
   * @param sectionData - Section data object
   * @param imageFields - Array of field names that contain images
   * @param files - Uploaded files grouped by field name
   * @param userId - User ID for organizing files
   * @returns Section data with S3 URLs
   */
  static async processImageFields(
    sectionData: Record<string, unknown>,
    imageFields: string[],
    files: { [fieldname: string]: MulterFile[] },
    userId: string
  ): Promise<Record<string, unknown>> {
    const processedData = { ...sectionData };

    for (const fieldName of imageFields) {
      const filesForField = files[fieldName];
      if (filesForField && filesForField.length > 0) {
        const file = filesForField[0];
        this.validateImageFile(file);
        const imageUrl = await this.uploadImage(file, userId);
        processedData[fieldName] = imageUrl;
      }
    }

    return processedData;
  }
}
