// This file defines the API endpoints for video uploading and streaming.
import dotenv from "../../config/dotenv";
import Constants from "expo-constants";

console.log(Constants.platform);
console.log("API BASE URL:", dotenv.DEFAULT_BACKEND_API_BASE_URL);

export const API = {
  uploadVideo: `${dotenv.DEFAULT_BACKEND_API_BASE_URL}/tutorials`,
  videoStream: `${dotenv.DEFAULT_BACKEND_API_BASE_URL}/tutorials`,
};
