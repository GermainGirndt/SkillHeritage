import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tutorial, TutorialDocument } from '../schemas/tutorial.schema';
import { TutorialStatus } from './tutorial-status';

@Injectable()
export class TutorialProcessingService {
  private readonly logger = new Logger(TutorialProcessingService.name);

  constructor(
    @InjectModel(Tutorial.name)
    private readonly tutorialModel: Model<TutorialDocument>,
  ) {}

  /**
   * Fetch a batch of tutorials that are not completed.
   * (Simple version: no locks, no retries stored, no attempt counters.)
   */

  async fetchPending(batchSize = 10): Promise<TutorialDocument[]> {
    return this.tutorialModel
      .find({
        processingStatus: { $ne: TutorialStatus.COMPLETED },
        $or: [
          { processingAttempts: { $exists: false } },
          { processingAttempts: { $lte: 5 } },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(batchSize)
      .exec();
  }

  async processTutorial(tutorial: TutorialDocument): Promise<void> {
    console.log(
      `TutorialProcessingService - processTutorial called at ${new Date().toISOString()}`,
    );
    const id = tutorial._id.toString();
    const status = tutorial.processingStatus;

    // Increment attempt counter (soft field)
    await this.tutorialModel.updateOne(
      { _id: tutorial._id },
      { $inc: { processingAttempts: 1 } },
    );

    this.logger.log(`Processing tutorial=${id} status=${status}`);

    try {
      switch (status) {
        case TutorialStatus.UPLOADED:
          await this.stepUploaded(tutorial);
          break;

        case TutorialStatus.TRANSCRIBING:
          await this.stepTranscribing(tutorial);
          break;

        case TutorialStatus.TRANSCRIPT_READY:
          await this.stepTranscriptReady(tutorial);
          break;

        case TutorialStatus.LLM_PROCESSING:
          await this.stepLLMProcessing(tutorial);
          break;

        case TutorialStatus.FAILED:
          await this.stepFailureRecovery(tutorial);
          break;

        case TutorialStatus.COMPLETED:
          throw new Error(`Tutorial ${id} is already COMPLETED.`);
          break;

        default:
          this.logger.warn(
            `Unknown processing status for tutorial=${id}: ${status}`,
          );
          await this.setStatus(id, TutorialStatus.FAILED);
          break;
      }

      // if success, resets attempts counter
      await this.tutorialModel.updateOne(
        { _id: tutorial._id },
        { $set: { processingAttempts: 0 } },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Error processing tutorial=${id} status=${status}: ${msg}`,
        err instanceof Error ? err.stack : undefined,
      );

      await this.setStatus(id, TutorialStatus.FAILED);
    }
  }

  private async setStatus(id: string, status: string) {
    await this.tutorialModel.updateOne(
      { _id: id },
      { $set: { processingStatus: status } },
    );
  }

  // ---------------------------
  // Processing steps (placeholders)
  // ---------------------------

  /**
   * uploaded -> transcribing
   */
  private async stepUploaded(tutorial: TutorialDocument) {
    // TODO:
    // - read video from GridFS (tutorial.videoGridFsFileId)
    // - start transcription (call external service or enqueue job)

    await this.setStatus(tutorial._id.toString(), TutorialStatus.TRANSCRIBING);
  }

  /**
   * transcribing -> transcript_ready
   */
  private async stepTranscribing(tutorial: TutorialDocument) {
    // TODO:
    // - poll transcription result or check if transcription finished
    // - store results:
    //   - audioTranscript
    //   - timelinedAudioTranscript

    await this.tutorialModel.updateOne(
      { _id: tutorial._id },
      {
        $set: {
          // audioTranscript: "...",
          // timelinedAudioTranscript: [...],
          processingStatus: TutorialStatus.TRANSCRIPT_READY,
        },
      },
    );
  }

  /**
   * transcript_ready -> llm_processing
   */
  private async stepTranscriptReady(tutorial: TutorialDocument) {
    // TODO:
    // - generate title / shortDescription / structuredInstructions via LLM
    // - or enqueue LLM job

    await this.setStatus(
      tutorial._id.toString(),
      TutorialStatus.LLM_PROCESSING,
    );
  }

  /**
   * llm_processing -> completed
   */
  private async stepLLMProcessing(tutorial: TutorialDocument) {
    // TODO:
    // - poll LLM job or compute synchronously
    // - store:
    //   - title
    //   - shortDescription
    //   - structuredInstructions

    await this.setStatus(tutorial._id.toString(), TutorialStatus.COMPLETED);
  }

  private async stepFailureRecovery(tutorial: TutorialDocument) {
    const id = tutorial._id.toString();

    // "soft field" read: if absent treat as 0
    const attempts = (tutorial as any).processingAttempts ?? 0;

    // If we've already exhausted retries, keep it failed.
    // Note: processingAttempts is incremented at the start of processTutorial(),
    // so at this point attempts may already include the current run.
    if (attempts > 5) {
      this.logger.warn(
        `Failure recovery skipped for tutorial=${id}: attempts=${attempts} exceeded limit.`,
      );

      await this.tutorialModel.updateOne(
        { _id: tutorial._id },
        {
          $set: {
            processingStatus: TutorialStatus.FAILED,
            // optional "soft" debug field
            processingError: `Max retry attempts exceeded (${attempts}). Manual intervention required.`,
          },
        },
      );
      return;
    }

    const hasTranscript: boolean =
      typeof (tutorial as any).audioTranscript === 'string' &&
      (tutorial as any).audioTranscript.trim().length > 0;

    const hasTimedTranscript: boolean =
      Array.isArray((tutorial as any).timelinedAudioTranscript) &&
      (tutorial as any).timelinedAudioTranscript.length > 0;

    const hasTitle: boolean =
      typeof (tutorial as any).title === 'string' &&
      (tutorial as any).title.trim().length > 0;

    const hasShortDescription: boolean =
      typeof (tutorial as any).shortDescription === 'string' &&
      (tutorial as any).shortDescription.trim().length > 0;

    const hasStructuredInstructions: boolean =
      typeof (tutorial as any).structuredInstructions === 'string' &&
      (tutorial as any).structuredInstructions.trim().length > 0;

    // Decide the most reasonable status to resume from
    let nextStatus: string;

    // No transcript data -> go back to transcription stage
    if (!hasTranscript || !hasTimedTranscript) {
      nextStatus = TutorialStatus.TRANSCRIBING;

      // Transcript exists, but LLM-derived fields missing -> go to LLM processing
    } else if (
      !hasTitle ||
      !hasStructuredInstructions ||
      !hasShortDescription
    ) {
      nextStatus = TutorialStatus.LLM_PROCESSING;

      // Looks complete based on fields we care about -> complete it
    } else {
      nextStatus = TutorialStatus.COMPLETED;
    }

    this.logger.warn(
      `Failure recovery for tutorial=${id}: attempts=${attempts}, resuming with status=${nextStatus}`,
    );

    await this.tutorialModel.updateOne(
      { _id: tutorial._id },
      {
        $set: {
          processingStatus: nextStatus,
          // optional "soft" debug field
          processingError: `Auto-recovery applied. Next status: ${nextStatus}. Attempts=${attempts}`,
        },
      },
    );
  }
}
