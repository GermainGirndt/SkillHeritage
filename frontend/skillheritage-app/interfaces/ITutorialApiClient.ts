import ITutorial from "@/interfaces/ITutorial";

interface IUploadVideoParams {
  uri: string;
  webBlob?: Blob;
}

/**
 * Separate interface for hydration (details fetch).
 * This avoids returning large payloads (transcripts/timestamps/etc.) from search.
 */
export interface ITutorialApiClient {
  getById(id: string): Promise<ITutorial>;
  getByIds(ids: string[]): Promise<ITutorial[]>;
  list(limit?: number): Promise<ITutorial[]>;
  transcribeAudio(uri: string): Promise<string>;
  uploadVideo(params: IUploadVideoParams): Promise<string>;
}

export { IUploadVideoParams };
export default ITutorialApiClient;
