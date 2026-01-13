from dotenv import load_dotenv
import os
from openai import OpenAI
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

name = "SkillHeritage"
vector_store = client.vector_stores.create(        # Create vector store
    name=name,
)

# id of the SkillHeritage vector store:
# vs_69666624aa888191a637fb5dcffa0d47
print(f"Created vector store {name} with ID {vector_store.id}")
print(vector_store)
