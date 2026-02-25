import ITutorial from "@/src/interfaces/ITutorial";

/**
 * A single semantic-search hit. Keep this lightweight for list rendering.
 * Fetch the full Tutorial object separately via an TutorialsRepository.
 */
interface ITutorialSemanticSearchHit {
  fileId: string;
  filename: string;
  score: number;
  tutorial: ITutorial;
}

export default ITutorialSemanticSearchHit;
