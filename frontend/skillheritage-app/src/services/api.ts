// Android emulator: 10.0.2.2 statt localhost
const BASE_URL = 'http://localhost:3000';
// const BASE_URL = 'http://10.0.2.2:3000';

export const API = {
  videoStream: `${BASE_URL}/video/stream`,
  healthCheck: `${BASE_URL}/`,
};
