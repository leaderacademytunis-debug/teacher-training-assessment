import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export interface UploadFileInput {
  base64Data: string;
  fileName: string;
  mimeType: string;
}

export interface UploadFileResult {
  url: string;
  key: string;
}

/**
 * Upload a file to S3 storage
 * @param input - File data including base64 content, filename, and mime type
 * @param userId - User ID for organizing files
 * @returns Object containing the file URL and storage key
 */
export async function uploadFile(
  input: UploadFileInput,
  userId: number
): Promise<UploadFileResult> {
  const { base64Data, fileName, mimeType } = input;

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, "base64");

  // Generate unique file key
  const fileExtension = fileName.split(".").pop() || "";
  const uniqueId = nanoid(10);
  const fileKey = `user-${userId}/chat-attachments/${uniqueId}-${fileName}`;

  // Upload to S3
  const { url } = await storagePut(fileKey, buffer, mimeType);

  return {
    url,
    key: fileKey,
  };
}
