import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TutorialProcessingService } from './tutorial-processing.service';

@Injectable()
export class TutorialProcessingJob {
  private readonly logger = new Logger(TutorialProcessingJob.name);
  private isRunning = false;

  constructor(private readonly processingService: TutorialProcessingService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async run() {
    // prevent overlapping runs in the same instance
    if (this.isRunning) return;

    this.isRunning = true;
    try {
      const pending = await this.processingService.fetchPending(10);

      if (pending.length === 0) {
        this.logger.log('No tutorials to process.');
        return;
      }

      this.logger.log(`Found ${pending.length} tutorial(s) to process.`);

      // sequential (simple + safe)
      for (const tutorial of pending) {
        await this.processingService.processTutorial(tutorial);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Tutorial processing job failed: ${msg}`,
        err instanceof Error ? err.stack : undefined,
      );
    } finally {
      this.isRunning = false;
    }
  }
}
