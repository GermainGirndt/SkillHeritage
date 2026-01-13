from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

vector_store_id: str = "vs_69666624aa888191a637fb5dcffa0d47"

if not vector_store_id:
    raise ValueError(
        "Please set the vector_store_id variable to your vector store ID.")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


results = client.vector_stores.search(
    vector_store_id=vector_store_id,
    query="What is the return policy?",
)

print("Search results:")
print(results)
for index, data_obj in enumerate(results.data):
    print(f"Result {index + 1}:")
    print(data_obj)
    print("\n\n\n")


"""
Structure:
class VectorStoreSearchResponse:
    attributes: dict[str, Any]         # empty {} in your sample
    content: list[Content]             # list of content chunks
    file_id: str                       # e.g. "file-N77a8S5c..."
    filename: str                      # e.g. "step_by_step_instructions__....txt"
    score: float                       # relevance score

"""
