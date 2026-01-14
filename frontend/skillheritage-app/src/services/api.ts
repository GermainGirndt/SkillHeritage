import dotenv from "./dotenv";
import Constants from "expo-constants";

// is runing expo web or native
console.log(Constants.platform);

console.log("API BASE URL:", dotenv.CURRENT_BACKEND_API_BASE_URL);

export const API = {
  uploadVideo: `${dotenv.CURRENT_BACKEND_API_BASE_URL}/video/upload`,
  videoStream: `${dotenv.CURRENT_BACKEND_API_BASE_URL}/video/stream`,
};
