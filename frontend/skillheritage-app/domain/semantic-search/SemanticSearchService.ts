import Instructions from "@/models/Instructions";

interface ISemanticSearchServiceResult<Result> {
  result: Result;
  score: number;
}

interface ISemanticSearchService<Result> {
  search(
    query: string,
    topK: number
  ): Promise<Array<ISemanticSearchServiceResult<Result>>>;
}

class DummyInstructionsSemanticSearchService
  implements ISemanticSearchService<Instructions>
{
  async search(
    query: string,
    topK: number
  ): Promise<Array<ISemanticSearchServiceResult<Instructions>>> {
    if (query.trim() === "") {
      throw new Error("Query cannot be empty");
    }

    if (topK <= 0) {
      throw new Error("topK must be greater than 0");
    }

    const firstResult: ISemanticSearchServiceResult<Instructions> = {
      result: {
        id: "instruction_1",
        title: "How to change a car tire",
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
          text: "Step 1: Loosen the lug nuts...\nStep 2: Jack up the car...\nStep 3: Remove the flat tire...\nStep 4: Mount the spare tire...\nStep 5: Tighten the lug nuts...\n Step 6: Lower the car and finish tightening the lug nuts.",
        },
      },
      score: 0.95,
    };

    const secondResult: ISemanticSearchServiceResult<Instructions> = {
      result: {
        id: "instruction_2",
        title: "How to repair a car motor",
        videoSource: {
          url: "https://example.com/videos/repair_car_motor.mp4",
        },
        transcript: {
          fullText:
            "To repair a car motor, first repair the ignition system...",
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
          text: "Step 1: Repair the ignition system...\nStep 2: Diagnose the fuel system...\nStep 3: Check for any issues...\nStep 4: Replace faulty parts...\nStep 5: Test the motor...\n Step 6: Finalize and clean up.",
        },
      },
      score: 0.9,
    };

    return [firstResult, secondResult].slice(0, topK);
  }
}

export const InstructionsSemanticSearchService: ISemanticSearchService<Instructions> =
  new DummyInstructionsSemanticSearchService();

export { ISemanticSearchService };
