interface IVideoSource {
  url: string;
}

interface ITextTimestamp {
  timestamp: number; // in seconds? maybe float?
  text: string;
}

interface IAudioTranscript {
  fullText: string;
  timestamps: ITextTimestamp[];
}

interface IStepByStepInstructions {
  text: string;
}

// Notes:
// Just an initial model for Instructions. Please expand as needed.
interface IInstructions {
  id: string;
  title: string;
  shortDescription: string; // TODO: generate from transcript
  videoSource: IVideoSource;
  transcript: IAudioTranscript;
  stepByStepInstructions: IStepByStepInstructions;
}

export default IInstructions;
