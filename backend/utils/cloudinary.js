import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.resolve('./.env') });

console.log("🔐 CLOUDINARY CONFIG DEBUG:", {
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET ? "✅ Present" : "❌ Missing"
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
  throw new Error("❌ Cloudinary config missing — check your .env file");
}

export default cloudinary;