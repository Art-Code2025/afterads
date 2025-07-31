export const CLOUDINARY_CONFIG = {
  cloudName: "dfbup2swi",
  uploadPreset: "perfume"
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.secure_url;
};

export default CLOUDINARY_CONFIG; 