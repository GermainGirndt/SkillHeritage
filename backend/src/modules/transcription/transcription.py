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
        {"start": round(seg["start"], 2),
         "end": round(seg["end"], 2),
         "text": seg["text"].strip()}
        for seg in result["segments"]
    ]

    print(json.dumps({
        "text": result["text"].strip(),
        "segments": segments
    }))
finally:
    import os
    os.unlink(tmp.name)  # delete temp file manually
