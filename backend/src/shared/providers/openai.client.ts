import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TranscriptionSegment } from 'openai/resources/audio/transcriptions';

interface ISearchVectorStoreParams {
  intent: string;
  topK?: number;
}

interface SearchHit {
  fileId: string;
  filename: string;
  score: number;
}

interface IStoreFileInVectorStoreRequestParams {
  file: File;
}

interface IStoreFileInVectorStoreResponse {
  fileId: string;
  filename: string;
  createdAt: string;
}

interface TranscriptionResponse {
  text: string;
  segments: TranscriptionSegment[];
}

@Injectable()
export class OpenAIClient {
  private readonly client: OpenAI;
  private readonly vectorStoreId: string;
  // TODO: Katharina: Correct and improve system prompts
  private readonly systemPromptTitle =
    'Du bist ein Schreiber, der Reparaturaleitungen für KFZ-Mechaniker zusammenfast. Erstelle einen kurzen, eingängigen Titel aus dem Input-Text. Gib nur den Titel zurück.';
  // TODO: Katharina: Correct and improve system prompts
  private readonly systemPromptDescription =
    'Du bist ein Schreiber, der Reparaturaleitungen für KFZ-Mechaniker zusammenfast. Erstelle einen kurze Beschreibung aus dem Input-Text. Die Beschreibung soll ein Satz lang sein. Gib nur die Beschreibung zurück, erfinde nichts dazu und halte dich kurz.';
  // TODO: Katharina: Correct and improve system prompts
  private readonly systemPromptInstruction =
    'Du bist ein Schreiber, der Reparaturaleitungen für KFZ-Mechaniker zusammenfast. Erstelle einen kurze, strukturierte Schritt-für-Schritt Anleitung aus dem Input-Text.  Benutze folgende Abschnitte: Thema, TLDR, Benötigte Werkzeuge, Schritt-für-Schritt Anleitung, Tipps und Tricks. Beispiel-Input:Zum Festziehen loser Schrauben an einem Fahrzeug braucht man einen Schrauber und einen Steckschlüssel. Man setzt die Werkzeuge an und dreht die Schrauben, bis alles wieder fest sitzt. Beispiel-Output: Hauptthema: Schrauben festziehen\n\nTLDR: Schrauben mit Schrauber und Steckschlüssel sichern.\n\nWerkzeuge: Schrauber, Steckschlüssel\n\nSchritte:\n1. Werkzeuge bereitlegen\n2. Lockere Schrauben finden\n3. Schrauben anziehen\n\nTipps:\n- Passende Werkzeuggröße verwenden\n- Schrauben korrekt prüfen. Gib nur die Anleitung zurück, erfinde nichts dazu und halte dich kurz. ';
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    this.vectorStoreId = this.configService.get<string>(
      'SKILL_HERITAGE_TUTORIALS_VECTOR_STORE_ID',
    );

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in configuration.');
    }

    if (!this.vectorStoreId) {
      throw new Error(
        'SKILL_HERITAGE_TUTORIALS_VECTOR_STORE_ID is not defined in configuration.',
      );
    }

    this.client = new OpenAI({ apiKey });
  }

  // for audio transcibing, for voice search
  async transcribe(file): Promise<string> {
    try {
      const response = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file,
      });

      return response.text;
    } catch (error) {
      console.error('OpenAI Transcription error:', error);
      return '';
    }
  }

  async getTimestamps(file): Promise<TranscriptionResponse> {
    try {
      const response = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file: file,
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      return { text: response.text, segments: response.segments };
    } catch (error) {
      console.error('OpenAI Transcription error:', error);
      return null;
    }
  }

  async getTitle(transcription): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-5',
        input: [
          {
            role: 'developer',
            content: this.systemPromptTitle,
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: transcription,
              },
            ],
          },
        ],
      });

      const title = response.output_text;

      return title;
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }

  async getShortDescription(transcription): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-5',
        input: [
          {
            role: 'developer',
            content: this.systemPromptDescription,
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: transcription,
              },
            ],
          },
        ],
      });

      const description = response.output_text;

      return description;
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }

  async getInstructions(transcription): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-5',
        input: [
          {
            role: 'developer',
            content: this.systemPromptInstruction,
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: transcription,
              },
            ],
          },
        ],
      });

      const instructions = response.output_text;

      return instructions;
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }

  get sdk(): OpenAI {
    return this.client;
  }

  async searchInVectorStore({
    intent,
    topK = 5,
  }: ISearchVectorStoreParams): Promise<SearchHit[]> {
    const page = await this.client.vectorStores.search(this.vectorStoreId, {
      query: intent,
      max_num_results: topK,
    });

    const results: SearchHit[] = [];

    while (results.length < topK) {
      page.data.forEach((item) => {
        if (results.length >= topK) {
          return;
        }

        if (!item.file_id) {
          throw new Error(`Item is missing file_id: ${JSON.stringify(item)}`);
        }
        if (!item.filename) {
          throw new Error(`Item is missing filename: ${JSON.stringify(item)}`);
        }
        if (item.score === undefined) {
          throw new Error(`Item is missing score: ${JSON.stringify(item)}`);
        }

        results.push({
          fileId: item.file_id,
          filename: item.filename,
          score: item.score,
        });
      });

      if (!page.hasNextPage()) {
        break;
      }
      await page.getNextPage();
    }

    return results;
  }

  async storeFileInVectorStore({
    file,
  }: IStoreFileInVectorStoreRequestParams): Promise<IStoreFileInVectorStoreResponse> {
    const vectorStoreFile = await this.client.vectorStores.files.uploadAndPoll(
      this.vectorStoreId,
      file,
    );

    const { id: fileId, created_at: createdAt } = vectorStoreFile;

    return {
      fileId,
      filename: file.name,
      createdAt: new Date(createdAt).toISOString(),
    };
  }
}
