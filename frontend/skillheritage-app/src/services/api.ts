// This file defines the API endpoints for video uploading and streaming.
import dotenv from "../../config/dotenv";
import Constants from "expo-constants";

console.log(Constants.platform);
console.log("API BASE URL:", dotenv.CURRENT_BACKEND_API_BASE_URL);

export const API = {
  uploadVideo: `${dotenv.CURRENT_BACKEND_API_BASE_URL}/tutorials`,
  videoStream: `${dotenv.CURRENT_BACKEND_API_BASE_URL}/tutorials`,
};
