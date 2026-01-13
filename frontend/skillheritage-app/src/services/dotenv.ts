import * as Device from "expo-device";

const isEmulator = !Device.isDevice;

// NOTES:
// for loading env variables in expo, the variables must start with EXPO_PUBLIC_
// see: https://docs.expo.dev/guides/environment-variables/
interface EnvironmentVariables {
  CURRENT_BACKEND_API_BASE_URL: string;
  BACKEND_API_BASE_URL_ANDROID_PHONE: string;
  BACKEND_API_BASE_URL_ANDROID_EMULATOR: string;
  IS_ANDROID_EMULATOR: boolean;
  IS_ANDROID_PHONE: boolean;
}

if (!process.env.EXPO_PUBLIC_BACKEND_BASE_URL_ANDROID_PHONE) {
  throw new Error(
    "Missing env variable: EXPO_PUBLIC_BACKEND_BASE_URL_ANDROID_PHONE"
  );
}

if (!process.env.EXPO_PUBLIC_BACKEND_BASE_URL_ANDROID_EMULATOR) {
  throw new Error(
    "Missing env variable: EXPO_PUBLIC_BACKEND_BASE_URL_ANDROID_EMULATOR"
  );
}

// check if is boolean
if (typeof isEmulator !== "boolean") {
  throw new Error("Could not determine if device is emulator or physical.");
}
const BACKEND_API_BASE_URL_ANDROID_PHONE: string =
  process.env.EXPO_PUBLIC_BACKEND_BASE_URL_ANDROID_PHONE;
const BACKEND_API_BASE_URL_ANDROID_EMULATOR: string =
  process.env.EXPO_PUBLIC_BACKEND_BASE_URL_ANDROID_EMULATOR;

const IS_ANDROID_EMULATOR: boolean = isEmulator;
const IS_ANDROID_PHONE: boolean = !isEmulator;

const CURRENT_BACKEND_API_BASE_URL: string = isEmulator
  ? BACKEND_API_BASE_URL_ANDROID_EMULATOR
  : BACKEND_API_BASE_URL_ANDROID_PHONE;

const env: EnvironmentVariables = {
  BACKEND_API_BASE_URL_ANDROID_PHONE,
  BACKEND_API_BASE_URL_ANDROID_EMULATOR,
  CURRENT_BACKEND_API_BASE_URL,
  IS_ANDROID_EMULATOR,
  IS_ANDROID_PHONE,
};

export default env;
