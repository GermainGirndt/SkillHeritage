import ITutorialApiClient, {
  IUploadVideoParams,
} from "@/src/interfaces/ITutorialApiClient";
import ITutorial from "@/src/interfaces/ITutorial";

/**
 * Dummy Tutorial repository – use for mock test only.
 * The data is hardcoded and the methods simulate async behavior.
 * The real implemention can be see in the 'BackendTutorialsApiClient' class below, which calls the actual backend API.
 */
class DummyTutorialApiClient implements ITutorialApiClient {
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

export default DummyTutorialApiClient;
