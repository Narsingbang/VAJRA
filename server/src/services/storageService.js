import sharp from 'sharp';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const BUCKET = 'crop-images';

/**
 * Re-encodes an image with Sharp to strip EXIF data and optimize dimensions.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<{buffer: Buffer, mimetype: string, extension: string}>}
 */
export async function sanitizeAndOptimizeImage(buffer, mimetype) {
  let pipeline = sharp(buffer).rotate(); // Auto-rotate based on EXIF then strip EXIF

  if (mimetype === 'image/png') {
    const optimized = await pipeline.png({ compressionLevel: 8 }).toBuffer();
    return { buffer: optimized, mimetype: 'image/png', extension: 'png' };
  } else if (mimetype === 'image/webp') {
    const optimized = await pipeline.webp({ quality: 85 }).toBuffer();
    return { buffer: optimized, mimetype: 'image/webp', extension: 'webp' };
  } else {
    // Default to JPEG
    const optimized = await pipeline.jpeg({ quality: 85 }).toBuffer();
    return { buffer: optimized, mimetype: 'image/jpeg', extension: 'jpg' };
  }
}

/**
 * Uploads sanitized images to Supabase Storage in private bucket.
 * Path format: crop-images/<user_id>/<advisory_id>/<random_uuid>.<ext>
 * 
 * @param {string} userId
 * @param {string} advisoryId
 * @param {Array<{buffer: Buffer, mimetype: string}>} files
 * @returns {Promise<string[]>} Array of storage object paths
 */
export async function uploadAdvisoryImages(userId, advisoryId, files = []) {
  if (!files || files.length === 0) return [];

  const uploadedPaths = [];

  for (const file of files) {
    try {
      const { buffer, extension, mimetype } = await sanitizeAndOptimizeImage(
        file.buffer,
        file.mimetype
      );

      const filename = `${crypto.randomUUID()}.${extension}`;
      const path = `${userId}/${advisoryId}/${filename}`;

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, {
          contentType: mimetype,
          upsert: false
        });

      if (error) {
        logger.error('Failed to upload image to storage', { path, error: error.message });
      } else {
        uploadedPaths.push(path);
      }
    } catch (err) {
      logger.error('Error during image optimization/upload', { error: err.message });
    }
  }

  return uploadedPaths;
}

/**
 * Generates short-lived signed URLs for storage paths (expiry 10 minutes = 600 seconds).
 * @param {string[]} paths
 * @returns {Promise<Array<{path: string, signedUrl: string}>>}
 */
export async function getSignedImageUrls(paths = []) {
  if (!paths || paths.length === 0) return [];

  const results = [];
  for (const path of paths) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(path, 600); // 10 minutes

      if (!error && data?.signedUrl) {
        results.push({
          path,
          signedUrl: data.signedUrl
        });
      }
    } catch (err) {
      logger.warn('Failed to create signed URL', { path, error: err.message });
    }
  }

  return results;
}

/**
 * Deletes all images associated with an advisory.
 * @param {string[]} paths
 */
export async function deleteAdvisoryImages(paths = []) {
  if (!paths || paths.length === 0) return;
  try {
    await supabaseAdmin.storage.from(BUCKET).remove(paths);
  } catch (err) {
    logger.warn('Failed to delete storage objects', { paths, error: err.message });
  }
}
