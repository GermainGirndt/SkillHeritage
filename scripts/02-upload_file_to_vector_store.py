from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

vector_store_id: str = "vs_69666624aa888191a637fb5dcffa0d47"

if not vector_store_id:
    raise ValueError(
        "Please set the vector_store_id variable to your vector store ID.")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

file_names = [
    # id=file-N77a8S5ckxX8wFidxHdHqJ
    "audio_transcript__throttle_body_replacement.txt",
    # id=file-N77a8S5ckxX8wFidxHdHqJ
    "step_by_step_instructions__throttle_body_replacement.txt"
]

for file_name in file_names:
    vector_store_file = client.vector_stores.files.upload_and_poll(
        vector_store_id=vector_store_id,
        file=open(f"assets/{file_name}", "rb")
    )
    print(f"Uploaded to the vector store")
    print(f"File Name: {file_name}")
    print(f"File ID: {vector_store_file.id}")
