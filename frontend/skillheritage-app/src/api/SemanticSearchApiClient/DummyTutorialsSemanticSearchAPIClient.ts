import ITutorialSemanticSearchHit from "@/src/interfaces/ITutorialSemanticSearchHit";
import DummyTutorialApiClient from "../TutorialApiClient/DummyTutorialApiClient";
import ITutorialsSemanticSearchAPIClient from "@/src/interfaces/ITutorialsSemanticSearchAPIClient";

class DummyTutorialsSemanticSearchAPIClient implements ITutorialsSemanticSearchAPIClient {
  private tutorialApiClient: DummyTutorialApiClient;

  constructor() {
    this.tutorialApiClient = new DummyTutorialApiClient();
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

export default DummyTutorialsSemanticSearchAPIClient;
