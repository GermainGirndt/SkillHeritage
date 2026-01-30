import ITutorial from "@/models/ITutorial";
import env from "@/config/dotenv";
import axios from "axios";
import { API } from "@/src/services/api";
import { Platform } from "react-native";

interface IUploadVideoParams {
  uri: string;
  webBlob?: Blob;
}

/**
 * Separate interface for hydration (details fetch).
 * This avoids returning large payloads (transcripts/timestamps/etc.) from search.
 */
export interface ITutorialApiClient {
  getById(id: string): Promise<ITutorial>;
  getByIds(ids: string[]): Promise<ITutorial[]>;
  list(limit?: number): Promise<ITutorial[]>;
  transcribeAudio(uri: string): Promise<string>;
  uploadVideo(params: IUploadVideoParams): Promise<string>;
}

/**
 * Dummy Tutorial repository (details fetch).
 * In a real app, this would call your backend: GET /Tutorial/:id (and/or batch).
 */
class DummyTutorialsApiClient implements ITutorialApiClient {
  private readonly db: Record<string, ITutorial> = {
    tutorial_1: {
      _id: "tutorial_1",
      // uploaded video data
      videoGridFsFileId: "gridfs_file_id-121426262",
      videoFileName: "change_car_tire.webm",
      processingStatus: "completed",
      // audio transcript (speech2text)
      audioTranscript: "To change a car tire, first loosen the lug nuts...",
      timelinedAudioTranscript: [
        {
          order: 1,
          timestamp: 0,
          text: "To change a car tire, first loosen the lug nuts...",
        },
        {
          order: 2,
          timestamp: 10,
          text: "Then, jack up the car and remove the flat tire...",
        },
      ],
      // ai generated
      title: "How to change a car tire",
      shortDescription:
        "Learn how to change a car tire safely and efficiently.",
      structuredInstructions:
        "Step 1: Loosen the lug nuts...\nStep 2: Jack up the car...\nStep 3: Remove the flat tire...\nStep 4: Mount the spare tire...\nStep 5: Tighten the lug nuts...\nStep 6: Lower the car and finish tightening the lug nuts.",

      // 'audioTranscript' file id (in the embedding vector store)
      vectorStoreFileId: "vector_store_file_id-121426262",

      // metadata
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tutorial_2: {
      _id: "tutorial_2",
      // uploaded video data
      videoGridFsFileId: "gridfs_file_id-121426263",
      videoFileName: "repair_car_motor.webm",
      // audio transcript (speech2text)
      processingStatus: "completed",
      audioTranscript:
        "To repair a car motor, start by checking the ignition system...",
      timelinedAudioTranscript: [
        {
          order: 1,
          timestamp: 0,
          text: "To repair a car motor, start by checking the ignition system...",
        },
        {
          order: 2,
          timestamp: 12,
          text: "Next, inspect the fuel system for any blockages...",
        },
      ],
      // ai generated
      title: "How to repair a car motor",
      shortDescription:
        "Learn the basics of repairing a car motor, starting with the ignition system.",
      structuredInstructions:
        "Step 1: Check the ignition system...\nStep 2: Inspect the fuel system...\nStep 3: Examine the cooling system...\nStep 4: Test the battery and alternator...\nStep 5: Replace faulty components as needed.",

      // 'audioTranscript' file id (in the embedding vector store)
      vectorStoreFileId: "vector_store_file_id-121426263",

      // metadata
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  async getById(id: string): Promise<ITutorial> {
    const item = this.db[id];
    if (!item) throw new Error(`Tutorial not found: ${id}`);
    return item;
  }

  async getByIds(ids: string[]): Promise<ITutorial[]> {
    return Promise.all(ids.map((id) => this.getById(id)));
  }

  async list(limit?: number): Promise<ITutorial[]> {
    return Object.values(this.db).slice(0, limit);
  }

  async transcribeAudio(uri: string): Promise<string> {
    const transcribedAudio = `This is the dummy transcribed audio for file at URI: ${uri}`;
    return transcribedAudio;
  }

  async uploadVideo(params: IUploadVideoParams): Promise<string> {
    return this.db["tutorial_1"]._id;
  }
}

class BackendTutorialsApiClient implements ITutorialApiClient {
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

const DefaultTutorialsApiClient: ITutorialApiClient = env.USE_DUMMY_API_CLIENT
  ? new DummyTutorialsApiClient()
  : new BackendTutorialsApiClient();

console.log(
  `Using ${DefaultTutorialsApiClient.constructor.name} as TutorialsApiClient`,
);

export { DummyTutorialsApiClient, DefaultTutorialsApiClient };
