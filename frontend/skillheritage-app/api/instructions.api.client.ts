import IInstructions from "@/models/Instructions";

/**
 * Separate interface for hydration (details fetch).
 * This avoids returning large payloads (transcripts/timestamps/etc.) from search.
 */
export interface IInstructionsApiClient {
  getById(id: string): Promise<IInstructions>;
  getByIds(ids: string[]): Promise<IInstructions[]>;
}

/**
 * Dummy instructions repository (details fetch).
 * In a real app, this would call your backend: GET /instructions/:id (and/or batch).
 */
class DummyInstructionsApiClient implements IInstructionsApiClient {
  private readonly db: Record<string, IInstructions> = {
    instruction_1: {
      id: "instruction_1",
      title: "How to change a car tire",
      shortDescription:
        "Learn how to change a car tire safely and efficiently.",
      videoSource: {
        url: "https://example.com/videos/change_car_tire.mp4",
      },
      transcript: {
        fullText: "To change a car tire, first loosen the lug nuts...",
        timestamps: [
          {
            timestamp: 0,
            text: "To change a car tire, first loosen the lug nuts...",
          },
          {
            timestamp: 10,
            text: "Then, jack up the car and remove the flat tire...",
          },
        ],
      },
      stepByStepInstructions: {
        text: [
          "Step 1: Loosen the lug nuts...",
          "Step 2: Jack up the car...",
          "Step 3: Remove the flat tire...",
          "Step 4: Mount the spare tire...",
          "Step 5: Tighten the lug nuts...",
          "Step 6: Lower the car and finish tightening the lug nuts.",
        ].join("\n"),
      },
    },
    instruction_2: {
      id: "instruction_2",
      title: "How to repair a car motor",
      shortDescription:
        "Learn the basics of repairing a car motor, starting with the ignition system.",
      videoSource: {
        url: "https://example.com/videos/repair_car_motor.mp4",
      },
      transcript: {
        fullText: "To repair a car motor, first repair the ignition system...",
        timestamps: [
          {
            timestamp: 0,
            text: "To repair a car motor, first repair the ignition system...",
          },
          {
            timestamp: 10,
            text: "Then, diagnose the fuel system and check for any issues...",
          },
        ],
      },
      stepByStepInstructions: {
        text: [
          "Step 1: Repair the ignition system...",
          "Step 2: Diagnose the fuel system...",
          "Step 3: Check for any issues...",
          "Step 4: Replace faulty parts...",
          "Step 5: Test the motor...",
          "Step 6: Finalize and clean up.",
        ].join("\n"),
      },
    },
  };

  async getById(id: string): Promise<IInstructions> {
    const item = this.db[id];
    if (!item) throw new Error(`Instructions not found: ${id}`);
    return item;
  }

  async getByIds(ids: string[]): Promise<IInstructions[]> {
    return Promise.all(ids.map((id) => this.getById(id)));
  }
}

export const InstructionsRepository: IInstructionsApiClient =
  new DummyInstructionsApiClient();
