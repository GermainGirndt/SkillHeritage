import Instructions from "@/models/Instructions";

/**
 * A single semantic-search hit. Keep this lightweight for list rendering.
 * Fetch the full Instructions object separately via an InstructionsRepository.
 */
export type InstructionsSearchHit = Pick<
  Instructions,
  "id" | "title" | "shortDescription"
>;

export interface ISemanticSearchServiceResult<Hit> {
  result: Hit;
  score: number;
}

export interface ISemanticSearchService<Hit> {
  search(
    query: string,
    topK: number
  ): Promise<ISemanticSearchServiceResult<Hit>[]>;
}

class DummyInstructionsSemanticSearchService
  implements ISemanticSearchService<InstructionsSearchHit>
{
  async search(
    query: string,
    topK: number
  ): Promise<ISemanticSearchServiceResult<InstructionsSearchHit>[]> {
    if (query.trim() === "") {
      throw new Error("Query cannot be empty");
    }

    if (topK <= 0) {
      throw new Error("topK must be greater than 0");
    }

    const firstResult: ISemanticSearchServiceResult<InstructionsSearchHit> = {
      result: {
        id: "instruction_1",
        title: "How to change a car tire",
        shortDescription:
          "Learn how to change a car tire safely and efficiently.",
      },
      score: 0.95,
    };

    const secondResult: ISemanticSearchServiceResult<InstructionsSearchHit> = {
      result: {
        id: "instruction_2",
        title: "How to repair a car motor",
        shortDescription:
          "Learn the basics of repairing a car motor, starting with the ignition system.",
      },
      score: 0.9,
    };

    return [firstResult, secondResult].slice(0, topK);
  }
}

export const InstructionsSemanticSearchService: ISemanticSearchService<InstructionsSearchHit> =
  new DummyInstructionsSemanticSearchService();
