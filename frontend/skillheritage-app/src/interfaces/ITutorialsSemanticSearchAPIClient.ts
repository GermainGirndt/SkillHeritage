import ITutorialSemanticSearchHit from "@/src/interfaces/ITutorialSemanticSearchHit";

interface ITutorialsSemanticSearchAPIClient {
  search(intent: string, topK: number): Promise<ITutorialSemanticSearchHit[]>;
}

export default ITutorialsSemanticSearchAPIClient;
