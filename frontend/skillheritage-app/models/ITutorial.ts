// Notes:
// Just an initial model for Tutorial. Please expand as needed.
interface ITutorial {
  id: string;
  title: string; // generate from transcript with LLM
  shortDescription: string; // generate from transcript with LLM
  videoUrl?: string; // if hosted remotely
  videoLocalFilePath?: string; // if stored locally
  audioTranscript: string; // generated from speech2text
  // generated from speech2text with timestamps
  timelinedAudioTranscript: {
    order: number;
    timestamp: number;
    text: string;
  }[];
  structuredInstructions: string; // generated from transcript with LLM
  createdAt: Date;
}

export default ITutorial;
