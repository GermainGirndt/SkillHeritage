// everything related to a tutorial
// it should come from the backend
interface ITutorial {
  id: string;

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
