import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.212.62.23:3000'
    : 'http://localhost:3000';

export const API = {
  uploadVideo: `${BASE_URL}/video/upload`,
  videoStream: `${BASE_URL}/video/stream`,
};
