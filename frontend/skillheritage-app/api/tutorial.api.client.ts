import ITutorial from "@/models/ITutorial";

/**
 * Separate interface for hydration (details fetch).
 * This avoids returning large payloads (transcripts/timestamps/etc.) from search.
 */
export interface ITutorialApiClient {
  getById(id: string): Promise<ITutorial>;
  getByIds(ids: string[]): Promise<ITutorial[]>;
}

/**
 * Dummy Tutorial repository (details fetch).
 * In a real app, this would call your backend: GET /Tutorial/:id (and/or batch).
 */
class DummyInstructionsApiClient implements ITutorialApiClient {
  private readonly db: Record<string, ITutorial> = {
    instruction_1: {
      id: "instruction_1",
      title: "How to change a car tire",
      shortDescription:
        "Learn how to change a car tire safely and efficiently.",
      videoUrl: "https://example.com/videos/change_car_tire.mp4",
      videoLocalFilePath: undefined,
      audioTranscript: "To change a car tire, first loosen the lug nuts...",
      timelinedAudioTranscript: [
        {
          timestamp: 0,
          text: "To change a car tire, first loosen the lug nuts...",
        },
        {
          timestamp: 10,
          text: "Then, jack up the car and remove the flat tire...",
        },
      ],
      structuredInstructions:
        "Step 1: Loosen the lug nuts...\nStep 2: Jack up the car...\nStep 3: Remove the flat tire...\nStep 4: Mount the spare tire...\nStep 5: Tighten the lug nuts...\nStep 6: Lower the car and finish tightening the lug nuts.",
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
}

export const InstructionsRepository: ITutorialApiClient =
  new DummyInstructionsApiClient();
