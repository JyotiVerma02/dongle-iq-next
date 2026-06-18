import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function getCloudinarySignedUrl(publicId: string, options?: {
  resourceType?: "image" | "video" | "raw" | "auto";
  expiresAt?: number;
}) {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: "private",
    resource_type: options?.resourceType || "auto",
    expires_at: options?.expiresAt,
  });
}

export default cloudinary;
