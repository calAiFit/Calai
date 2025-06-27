import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export const uploadToCloudinary = (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "user-profiles",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject("No secure_url in response");
        resolve(result.secure_url);
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
};
