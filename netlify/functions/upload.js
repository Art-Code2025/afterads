import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dfbup2swi',
  api_key: process.env.CLOUDINARY_API_KEY || '916154321177141',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'PZXZo4_HKqc-P0A4jONOIjnfzCc'
});

export const handler = async (event, context) => {
  console.log('🔄 Upload function called:', {
    method: event.httpMethod,
    contentType: event.headers['content-type'],
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  try {
    const contentType = event.headers['content-type'] || '';
    
    // Handle base64 data (primary method)
    if (contentType.includes('application/json')) {
      const body = JSON.parse(event.body || '{}');
      
      if (body.base64Data) {
        console.log('📤 Uploading base64 image to Cloudinary');
        
        try {
          const uploadResult = await cloudinary.uploader.upload(body.base64Data, {
            folder: 'mawasiem-products',
            resource_type: 'auto',
            transformation: [
              { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
            ]
          });
          
          console.log('✅ Cloudinary upload successful:', uploadResult.secure_url);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id
            })
          };
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary upload failed:', cloudinaryError);
    
          // Return the base64 data as fallback
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              url: body.base64Data,
              fallback: true,
              message: 'Image stored as base64 (Cloudinary failed)'
            })
          };
        }
      }
    }
    
    // Handle FormData (multipart/form-data) - simplified approach
    if (contentType.includes('multipart/form-data')) {
      console.log('📤 Processing multipart form data');
      
      try {
        // For now, we'll expect the frontend to convert to base64
        // This is a simpler approach for serverless functions
        console.log('⚠️ Multipart data received, but expecting base64 format');
        
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Please send images as base64 data in JSON format',
            hint: 'Use { "base64Data": "data:image/jpeg;base64,..." } format'
          })
        };
        
      } catch (error) {
        console.error('❌ Error processing multipart data:', error);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Failed to process multipart data'
          })
        };
      }
    }
    
    // If no valid content type, return error
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Invalid content type. Expected JSON with base64Data field',
        example: { base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...' }
      })
    };
    
  } catch (error) {
    console.error('❌ Upload function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Server error: ' + error.message
      })
    };
  }
}; 