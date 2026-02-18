# pip install -U openai-whisper==20250625
import whisper
import sys
import tempfile
import json

audio_bytes = sys.stdin.buffer.read()

tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
try:
    tmp.write(audio_bytes)
    tmp.flush()
    tmp.close()

    model = whisper.load_model("small")
    result = model.transcribe(tmp.name, language="de", verbose=False)

    segments = [
        {"start": round(seg["start"], 2),  # type: ignore
         "end": round(seg["end"], 2),  # type: ignore
         "text": seg["text"].strip()}  # type: ignore
        for seg in result["segments"]
    ]

    print(json.dumps({

        "text": result["text"].strip(),  # type: ignore
        # ignoring type error because result["text"] is always a string coming from Whispers tokenizer;
        # the type hinting in the whisper library is just not accurate here
        "segments": segments
    }))
finally:
    import os
    os.unlink(tmp.name)  # delete temp file manually
