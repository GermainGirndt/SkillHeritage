import { DummyTutorialsApiClient } from "@/api/tutorial.api.client";
import Tutorial from "@/models/ITutorial";
import env from "@/config/dotenv";
import axios from "axios";

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
  search(intent: string, topK: number): Promise<ITutorialSemanticSearchHit[]>;
}

class DummyTutorialsSemanticSearchAPIClient implements ITutorialsSemanticSearchAPIClient {
  private tutorialApiClient: DummyTutorialsApiClient;

  constructor() {
    this.tutorialApiClient = new DummyTutorialsApiClient();
  }

  async search(
    intent: string,
    topK: number,
  ): Promise<ITutorialSemanticSearchHit[]> {
    if (intent.trim() === "") {
      return [];
    }

    const allTutorials = await this.tutorialApiClient.list(100);

    const filteredTutorials = allTutorials.filter(
      (t) =>
        t.title.toLowerCase().includes(intent.toLowerCase()) ||
        t.shortDescription.toLowerCase().includes(intent.toLowerCase()),
    );

    const results: ITutorialSemanticSearchHit[] = filteredTutorials.map(
      (t) => ({
        fileId: t._id,
        filename: t.videoFileName,
        tutorial: t,
        score: 1.0,
      }),
    );

    return results.slice(0, topK);
  }
}

class BackendSemanticSearchAPIClient implements ITutorialsSemanticSearchAPIClient {
  private readonly baseUrl = `${env.CURRENT_BACKEND_API_BASE_URL}/semantic-search/tutorials`;

  async search(
    intent: string,
    topK: number,
  ): Promise<ITutorialSemanticSearchHit[]> {
    if (intent.trim() === "") {
      return [];
    }

    const response = await axios.get(`${this.baseUrl}`, {
      params: {
        intent,
        topK,
      },
    });

    /**
     * Expected backend response example:
     * [
     *   {
     *     fileId: "123",
     *     filename: "engine_repair.mp4",
     *     score: 0.92,
     *     tutorial: { ... }
     *   }
     * ]
     */
    return response.data.map((hit: any) => ({
      fileId: hit.fileId,
      filename: hit.filename,
      score: hit.score,
      tutorial: hit.tutorial as Tutorial,
    }));
  }
}

const TutorialsSemanticSearchAPIClient: ITutorialsSemanticSearchAPIClient =
  env.USE_DUMMY_API_CLIENT
    ? new DummyTutorialsSemanticSearchAPIClient()
    : new BackendSemanticSearchAPIClient();

export {
  ITutorialSemanticSearchHit,
  ITutorialsSemanticSearchAPIClient,
  TutorialsSemanticSearchAPIClient,
};
