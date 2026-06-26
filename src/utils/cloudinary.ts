// utils/cloudinary.ts
const CLOUD_NAME = "dgxghowdt";
const UPLOAD_PRESET = "t6xghzi5";

export async function uploadToCloudinary(media: {
  uri: string;
  mimeType?: string;
  fileName?: string;
  type?: string;
}): Promise<string> {

  const mimeType = media.mimeType || media.type || "image/jpeg";
  const isVideo =
    mimeType.includes("video") ||
    media.uri.toLowerCase().includes(".mp4") ||
    media.uri.toLowerCase().includes(".mov");

  console.log("IS VIDEO:", isVideo);
  console.log("MIME:", mimeType);
  console.log("URI:", media.uri);

  // ✅ /auto/upload — Cloudinary khud detect karta hai image ya video
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const formData = new FormData();
  formData.append("file", {
    uri: media.uri,
    type: isVideo ? "video/mp4" : mimeType,
    name: media.fileName || (isVideo ? "reel.mp4" : "post.jpg"),
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  const text = await response.text();
  console.log("CLOUDINARY RESPONSE:", text);

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Invalid response from Cloudinary");
  }

  if (json.secure_url) {
    return json.secure_url;
  }

  throw new Error(json.error?.message || "Upload failed");
}