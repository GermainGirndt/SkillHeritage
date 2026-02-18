import ITutorial from "@/interfaces/ITutorial";
import env from "@/config/dotenv";
import axios from "axios";
import { API } from "@/src/services/api";
import { Platform } from "react-native";
import ITutorialApiClient, {
  IUploadVideoParams,
} from "@/interfaces/ITutorialApiClient";

class BackendTutorialApiClient implements ITutorialApiClient {
  private readonly baseUrl = `${env.DEFAULT_BACKEND_API_BASE_URL}/tutorials`;

  async getById(id: string): Promise<ITutorial> {
    console.log(`BackendTutorialsApiClient.getById called. id=${id}`);
    const response = await axios.get(`${this.baseUrl}/${id}`);
    if (response.status !== 200) throw new Error("Failed to fetch tutorial");
    return response.data;
  }

  async getByIds(ids: string[]): Promise<ITutorial[]> {
    const response = await axios.get(`${this.baseUrl}`, { params: { ids } });

    if (response.status !== 200) throw new Error("Failed to fetch tutorials");
    return response.data;
  }

  async list(limit?: number): Promise<ITutorial[]> {
    const response = await axios.get(`${this.baseUrl}`, { params: { limit } });
    if (response.status !== 200) throw new Error("Failed to fetch tutorials");
    return response.data;
  }

  async transcribeAudio(uri: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "audio/m4a",
      name: "search_query.m4a",
    } as any);

    const response = await axios.post(
      `${this.baseUrl}/speech-to-text`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (response.status !== 200) throw new Error("Speech-to-text failed");

    return response.data;
  }

  async uploadVideo({ uri, webBlob }: IUploadVideoParams): Promise<string> {
    console.log(`BackendTutorialsApiClient.uploadVideo called. uri=${uri}`);

    console.log("Preparing video upload...");
    // Helper: infer type + filename from uri for native uploads
    const guessVideoMeta = (u: string): { type: string; name: string } => {
      const lower = (u || "").toLowerCase();

      if (lower.endsWith(".mp4"))
        return { type: "video/mp4", name: "video.mp4" };
      if (lower.endsWith(".mov"))
        return { type: "video/quicktime", name: "video.mov" };
      if (lower.endsWith(".webm"))
        return { type: "video/webm", name: "video.webm" };

      // Fallback: unknown container
      return { type: "application/octet-stream", name: "video.bin" };
    };

    const formData = new FormData();

    // Decide what to send
    if (webBlob) {
      // Web: send the blob directly
      const filename =
        webBlob.type === "video/webm"
          ? "video.webm"
          : webBlob.type === "video/mp4"
            ? "video.mp4"
            : "video.bin";

      console.log("Web upload -> blob:", {
        type: webBlob.type,
        size: webBlob.size,
        filename,
      });
      formData.append("file", webBlob, filename);
    } else {
      // Native: send file uri with correct mime/name inferred from extension
      if (!uri) throw new Error("uploadVideo: Missing uri for native upload");

      const { type, name } = guessVideoMeta(uri);
      console.log("Native upload -> file meta:", { uri, type, name });

      formData.append("file", {
        uri,
        type,
        name,
      } as any);
    }

    // RN nuance:
    // - Web: don't set Content-Type manually (browser adds boundary)
    // - Native: often safer to set multipart/form-data
    const config =
      Platform.OS === "web"
        ? undefined
        : { headers: { "Content-Type": "multipart/form-data" } };

    console.log("Posting multipart to:", API.uploadVideo);
    const response = await axios.post(API.uploadVideo, formData, config);

    const tutorialIdPrivate = response?.data?.tutorialIdPrivate;

    if (!tutorialIdPrivate) {
      throw new Error("Server did not return tutorialIdPrivate");
    }
    if (typeof tutorialIdPrivate !== "string") {
      throw new Error(
        `Invalid tutorialIdPrivate format from server: ${tutorialIdPrivate} typeof ${typeof tutorialIdPrivate}`,
      );
    }

    return tutorialIdPrivate;
  }
}

export default BackendTutorialApiClient;
