export const TutorialStatus = {
  UPLOADED: 'uploaded',
  READY_TO_TRANSCRIBE: 'ready_to_transcribe',
  READY_FOR_LLM_PROCESSING: 'ready_for_llm_processing',
  READY_FOR_VECTOR_STORE_STORAGE: 'ready_for_vector_store_storage',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type TutorialProcessingStatus =
  (typeof TutorialStatus)[keyof typeof TutorialStatus];
