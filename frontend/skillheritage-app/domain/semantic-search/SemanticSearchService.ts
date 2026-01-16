import { DummyInstructionsApiClient } from "@/api/tutorial.api.client";
import Tutorial from "@/models/ITutorial";

/**
 * A single semantic-search hit. Keep this lightweight for list rendering.
 * Fetch the full Tutorial object separately via an InstructionsRepository.
 */
export interface ITutorialSemanticSearchHit {
  fileId: string;
  filename: string;
  score: number;
  tutorial: Tutorial;
}

export interface ITutorialSemanticSearchService {
  search(query: string, topK: number): Promise<ITutorialSemanticSearchHit[]>;
}

class DummyInstructionsSemanticSearchService
  implements ITutorialSemanticSearchService
{
  private tutorialApiClient: DummyInstructionsApiClient;

  constructor() {
    this.tutorialApiClient = new DummyInstructionsApiClient();
  }
  async search(
    query: string,
    topK: number
  ): Promise<ITutorialSemanticSearchHit[]> {
    if (query.trim() === "") {
      throw new Error("Query cannot be empty");
    }

    if (topK <= 0) {
      throw new Error("topK must be greater than 0");
    }

    const firstResult: ITutorialSemanticSearchHit = {
      fileId: "instruction_1",
      filename: "how_to_change_a_car_tire.pdf",
      tutorial: await this.tutorialApiClient.getById("instruction_1"),
      score: 0.95,
    };

    const secondResult: ITutorialSemanticSearchHit = {
      fileId: "instruction_2",
      filename: "car_maintenance_basics.pdf",
      tutorial: await this.tutorialApiClient.getById("instruction_2"),
      score: 0.9,
    };

    const results = [firstResult, secondResult];

    return results.slice(0, topK);
  }
}

export const TutorialSemanticSearchService: ITutorialSemanticSearchService =
  new DummyInstructionsSemanticSearchService();
