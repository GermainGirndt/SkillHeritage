export const TutorialStatus = {
  UPLOADED: 'uploaded',
  TRANSCRIBING: 'transcribing',
  TRANSCRIPT_READY: 'transcript_ready',
  LLM_PROCESSING: 'llm_processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type TutorialProcessingStatus =
  (typeof TutorialStatus)[keyof typeof TutorialStatus];
