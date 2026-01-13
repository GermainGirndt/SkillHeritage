import dotenv from "./dotenv";

console.log("API BASE URL:", dotenv.CURRENT_BACKEND_API_BASE_URL);

export const API = {
  uploadVideo: `${dotenv.CURRENT_BACKEND_API_BASE_URL}/video/upload`,
  videoStream: `${dotenv.CURRENT_BACKEND_API_BASE_URL}/video/stream`,
};
