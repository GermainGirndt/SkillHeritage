import { DummyTutorialsApiClient } from "@/api/tutorial.api.client";
import Tutorial from "@/models/ITutorial";

// Refactor to semantic-search.api.client.ts

/**
 * A single semantic-search hit. Keep this lightweight for list rendering.
 * Fetch the full Tutorial object separately via an TutorialsRepository.
 */
interface ITutorialSemanticSearchHit {
  fileId: string;
  filename: string;
  score: number;
  tutorial: Tutorial;
}

interface ITutorialsSemanticSearchAPIClient {
  search(query: string, topK: number): Promise<ITutorialSemanticSearchHit[]>;
}

class DummyTutorialsSemanticSearchAPIClient
  implements ITutorialsSemanticSearchAPIClient
{
  private tutorialApiClient: DummyTutorialsApiClient;

  constructor() {
    this.tutorialApiClient = new DummyTutorialsApiClient();
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
      fileId: "tutorial_1",
      filename: "how_to_change_a_car_tire.pdf",
      tutorial: await this.tutorialApiClient.getById("tutorial_1"),
      score: 0.95,
    };

    const secondResult: ITutorialSemanticSearchHit = {
      fileId: "tutorial_2",
      filename: "car_maintenance_basics.pdf",
      tutorial: await this.tutorialApiClient.getById("tutorial_2"),
      score: 0.9,
    };

    const results = [firstResult, secondResult];

    return results.slice(0, topK);
  }
}

export {
  ITutorialSemanticSearchHit,
  ITutorialsSemanticSearchAPIClient,
  DummyTutorialsSemanticSearchAPIClient,
};
