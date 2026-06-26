// utils/cloudinary.ts
const CLOUD_NAME = "dgxghowdt";
const UPLOAD_PRESET = "t6xghzi5";

export async function uploadToCloudinary(media: {
  uri: string;
  mimeType?: string;
  fileName?: string;
}): Promise<string> {
  
  // React Native mein FileReader nahi hota
  // FormData use karo — yeh React Native mein sahi kaam karta hai
  const formData = new FormData();

  formData.append("file", {
    uri: media.uri,
    type: media.mimeType || "image/jpeg",
    name: media.fileName || "upload.jpg",
  } as any);

  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("cloud_name", CLOUD_NAME);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
      // Content-Type mat lagao — FormData khud set karta hai boundary
    }
  );

  const json = await response.json();

  if (json.secure_url) {
    return json.secure_url;
  } else {
    throw new Error(json.error?.message || "Upload failed");
  }
}