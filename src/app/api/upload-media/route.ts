import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import envVars from '@/data/env/envVars';
import { auth } from '@clerk/nextjs/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files: File[] = [];
    
    // Extract files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('media_') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No media files provided' },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: `twitter-media/${userId}`,
            transformation: [
              { width: 1200, height: 675, crop: 'limit' }, // Twitter recommended size
              { quality: 'auto' },
              { format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result?.secure_url);
            }
          }
        ).end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls: urls.filter(url => url !== null),
      count: urls.length
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload media files' },
      { status: 500 }
    );
  }
}