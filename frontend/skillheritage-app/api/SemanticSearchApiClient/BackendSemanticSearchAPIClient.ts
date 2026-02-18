import Tutorial from "@/interfaces/ITutorial";
import env from "@/config/dotenv";
import axios from "axios";
import ITutorialSemanticSearchHit from "@/interfaces/ITutorialSemanticSearchHit";

import ITutorialsSemanticSearchAPIClient from "@/interfaces/ITutorialsSemanticSearchAPIClient";

class BackendSemanticSearchAPIClient implements ITutorialsSemanticSearchAPIClient {
  private readonly baseUrl = `${env.DEFAULT_BACKEND_API_BASE_URL}/semantic-search/tutorials`;

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

export default BackendSemanticSearchAPIClient;
