export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dfbup2swi",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "perfume"
};

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);
    
    return {
      success: failedUploads.length === 0,
      urls: successfulUploads.map(result => result.url),
      publicIds: successfulUploads.map(result => result.publicId),
      errors: failedUploads.map(result => result.error)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteImage = async (publicId) => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          upload_preset: CLOUDINARY_CONFIG.uploadPreset
        })
      }
    );

    const data = await response.json();
    return {
      success: data.result === 'ok',
      message: data.result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 