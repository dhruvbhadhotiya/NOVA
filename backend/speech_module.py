import os
import uuid
from pydub import AudioSegment
import speech_recognition as sr

def convert_to_wav(input_path, output_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(output_path, format="wav")

def transcribe_audio(audio_file):
    temp_input = None
    temp_wav = None

    try:
        # Step 1: Save uploaded audio to a temporary file
        audio_bytes = audio_file.read()

        if not audio_bytes:
            return "Error: Empty audio file received"

        file_ext = "webm"
        if hasattr(audio_file, 'filename') and audio_file.filename:
            original_ext = os.path.splitext(audio_file.filename)[1].lower()
            if original_ext.startswith('.'):
                file_ext = original_ext[1:]

        temp_id = uuid.uuid4().hex[:8]
        temp_input = f"temp_input_{temp_id}.{file_ext}"
        temp_wav = f"temp_output_{temp_id}.wav"

        with open(temp_input, "wb") as f:
            f.write(audio_bytes)

        # Step 2: Convert to WAV (16kHz mono)
        convert_to_wav(temp_input, temp_wav)

        # Step 3: Transcribe using speech_recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_wav) as source:
            audio_data = recognizer.record(source)
        
        try:
            text = recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Speech not recognized"
        except sr.RequestError as e:
            return f"Google API error: {e}"

    finally:
        # Clean up
        for temp_file in [temp_input, temp_wav]:
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as cleanup_error:
                    print(f"Could not remove temp file {temp_file}: {cleanup_error}")
