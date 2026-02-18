import ITutorialSemanticSearchHit from "@/interfaces/ITutorialSemanticSearchHit";

interface ITutorialsSemanticSearchAPIClient {
  search(intent: string, topK: number): Promise<ITutorialSemanticSearchHit[]>;
}

export default ITutorialsSemanticSearchAPIClient;
