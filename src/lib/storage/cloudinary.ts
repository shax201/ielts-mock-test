import { v2 as cloudinary } from 'cloudinary'

// Helper function to convert File to Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  format: string
  bytes: number
}

export async function uploadAudio(file: File | Buffer, filename?: string): Promise<UploadResult> {
  try {
    let fileData: string;
    
    if (file instanceof File) {
      const buffer = await fileToBuffer(file);
      fileData = `data:${file.type};base64,${buffer.toString('base64')}`;
    } else {
      fileData = `data:audio/mp3;base64,${file.toString('base64')}`;
    }
    
    const result = await cloudinary.uploader.upload(
      fileData,
      {
        resource_type: 'video', // Audio files are treated as video in Cloudinary
        folder: 'ielts-mock/audio',
        public_id: filename ? `audio_${filename}` : undefined,
        format: 'mp3',
        quality: 'auto',
        fetch_format: 'auto'
      }
    )

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes
    }
  } catch (error) {
    console.error('Error uploading audio to Cloudinary:', error)
    throw new Error('Failed to upload audio file')
  }
}

export async function uploadPDF(file: Buffer, filename: string): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${file.toString('base64')}`,
      {
        resource_type: 'raw',
        folder: 'ielts-mock/reports',
        public_id: filename.replace('.pdf', ''),
        format: 'pdf'
      }
    )

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes
    }
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error)
    throw new Error('Failed to upload PDF file')
  }
}

export async function deleteFile(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error)
    return false
  }
}

export async function getFileUrl(publicId: string): Promise<string> {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: 'auto'
    })
  } catch (error) {
    console.error('Error generating file URL:', error)
    throw new Error('Failed to generate file URL')
  }
}

export function generateAudioFilename(candidateNumber: string, testTitle: string): string {
  const sanitizedTitle = testTitle.replace(/[^a-zA-Z0-9]/g, '_')
  const timestamp = Date.now()
  return `audio_${candidateNumber}_${sanitizedTitle}_${timestamp}.mp3`
}

export function generatePDFFilename(candidateNumber: string, testTitle: string): string {
  const sanitizedTitle = testTitle.replace(/[^a-zA-Z0-9]/g, '_')
  const timestamp = Date.now()
  return `report_${candidateNumber}_${sanitizedTitle}_${timestamp}.pdf`
}
