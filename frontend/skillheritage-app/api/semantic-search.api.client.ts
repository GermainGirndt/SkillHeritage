import { DummyTutorialsApiClient } from "@/api/tutorial.api.client";
import Tutorial from "@/models/ITutorial";

// Refactor to semantic-search.api.client.ts

/**
 * A single semantic-search hit. Keep this lightweight for list rendering.
 * Fetch the full Tutorial object separately via an TutorialsRepository.
 */
export interface ITutorialSemanticSearchHit {
  fileId: string;
  filename: string;
  score: number;
  tutorial: Tutorial;
}

export interface ITutorialsSemanticSearchAPIClient {
  search(query: string, topK: number): Promise<ITutorialSemanticSearchHit[]>;
}

export class DummyTutorialsSemanticSearchAPIClient implements ITutorialsSemanticSearchAPIClient {
  private tutorialApiClient: DummyTutorialsApiClient;

  constructor() {
    this.tutorialApiClient = new DummyTutorialsApiClient();
  }

  async search(query: string, topK: number): Promise<ITutorialSemanticSearchHit[]> {
    if (query.trim() === "") {
      return [];
    }

    const allTutorials = await this.tutorialApiClient.list(100);

    const filteredTutorials = allTutorials.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) || 
      t.shortDescription.toLowerCase().includes(query.toLowerCase())
    );

    const results: ITutorialSemanticSearchHit[] = filteredTutorials.map(t => ({
      fileId: t.id,
      filename: t.videoFileName,
      tutorial: t,
      score: 1.0
    }));

    return results.slice(0, topK);
  }
}