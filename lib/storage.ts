import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Check if Spaces is configured
const isSpacesConfigured = () => Boolean(process.env.SPACES_KEY && process.env.SPACES_SECRET)

// Lazy-init S3 client (only when needed)
let s3Client: S3Client | null = null
function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.SPACES_REGION || 'sfo3',
      endpoint: process.env.SPACES_ENDPOINT || 'https://sfo3.digitaloceanspaces.com',
      credentials: {
        accessKeyId: process.env.SPACES_KEY || '',
        secretAccessKey: process.env.SPACES_SECRET || '',
      },
    })
  }
  return s3Client
}

export interface UploadResult {
  url: string
  key: string
}

/**
 * Upload to DigitalOcean Spaces (production)
 */
async function uploadToSpaces(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> {
  const bucket = process.env.SPACES_BUCKET || 'blog-uploads'
  const cdnEndpoint = process.env.SPACES_CDN_ENDPOINT || `https://${bucket}.sfo3.cdn.digitaloceanspaces.com`
  
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const key = `uploads/${randomUUID()}.${ext}`

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    })
  )

  return { url: `${cdnEndpoint}/${key}`, key }
}

/**
 * Upload to local filesystem (development)
 */
async function uploadToLocal(buffer: Buffer, filename: string): Promise<UploadResult> {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const key = `${randomUUID()}.${ext}`
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, key), buffer)

  return { url: `/uploads/${key}`, key }
}

/**
 * Unified upload function - auto-detects backend
 * - If SPACES_KEY is set: uploads to DigitalOcean Spaces
 * - Otherwise: uploads to local public/uploads folder
 */
export async function uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> {
  if (isSpacesConfigured()) {
    return uploadToSpaces(buffer, filename, contentType)
  }
  return uploadToLocal(buffer, filename)
}
