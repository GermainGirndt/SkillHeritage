// everything related to a tutorial
// it should come from the backend

export const TutorialStatus = {
  UPLOADED: "uploaded",
  READY_TO_TRANSCRIBE: "ready_to_transcribe",
  READY_FOR_LLM_PROCESSING: "ready_for_llm_processing",
  READY_FOR_VECTOR_STORE_STORAGE: "ready_for_vector_store_storage",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type TutorialProcessingStatus =
  (typeof TutorialStatus)[keyof typeof TutorialStatus];

interface ITutorial {
  _id: string;
  videoUrl?: string;
  processingStatus: TutorialProcessingStatus;
  // uploaded video data
  videoFileName: string;
  videoGridFsFileId: string; // file id for video file in the database (GridFS format chunks)

  // audio transcript (speech2text)
  audioTranscript: string;
  timelinedAudioTranscript: {
    order: number;
    timestamp: number; // seconds/milliseconds (can be float?)
    text: string;
  }[];

  // ai generated
  title: string;
  shortDescription: string;
  structuredInstructions: string;

  // 'audioTranscript' file id (in the embedding vector store)
  vectorStoreFileId: string;

  // metadata
  createdAt: Date;
  updatedAt: Date;
}

export default ITutorial;
