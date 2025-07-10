# AI Classroom Assistant

A multimodal AI-powered assistant for classrooms that can answer questions, generate image captions, and combine visual and textual understanding to help students and teachers.

## Features
- **Text QnA:** Ask questions and get answers using a local LLM (Phi-2, OpenVINO-optimized).
- **Speech-to-Text (Experimental):** Record audio directly in the browser and convert it to text for asking questions. Works best with FFmpeg installed, but can also work without it if your browser supports WAV recording.
- **Image Captioning:** Upload images and get descriptive captions using BLIP.
- **Image QnA:** Upload an image and ask a question about it; the system uses the image caption as context for the LLM.
- **Modern Web Frontend:** Simple, interactive UI for all features.
- **Runs fully offline** (after initial model downloads).

## Project Structure
```
ai_classroom_assistant/
├── backend/
│   ├── app.py                # Flask backend with API endpoints
│   ├── nlp_module.py         # QnA logic using Phi-2
│   ├── image_captioning.py   # Image captioning logic using BLIP
│   ├── input_handler.py      # (stub)
│   ├── response_engine.py    # (stub)
│   ├── vision_module.py      # (stub)
│   └── speech_module.py      # (stub)
├── frontend/
│   ├── index.html            # Main web UI
│   └── static/
│       └── app.js            # Frontend JS logic
├── models/
│   ├── phi-2-int8-ov/        # Phi-2 OpenVINO model files
│   ├── blip_pytorch/         # BLIP PyTorch model files
│   └── whisper-tiny-int4-ov/ # Whisper OpenVINO model files for speech-to-text
├── data/                     # empty for future use
├── download_whisper_model.py # Script to download and convert Whisper model
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Requirements
- Python 3.8+
- (Recommended) Virtual environment (venv)
- Sufficient disk space for models (several GB)
- FFmpeg (recommended but not strictly required for the speech-to-text feature - see Troubleshooting section for details)

## Installation & Setup
1. **Clone or download this repository.**
2. **Install FFmpeg** (required for speech-to-text functionality):
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH
   - **Mac**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg` or equivalent for your distribution
3. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv # first run this to creat virtual enviroment
   # On Windows:
   .\venv\Scripts\activate # activate enviroment
   # On Mac/Linux:
   source venv/bin/activate
   ```
4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt  # install requirments
   ```
4. **Download/prepare models:**   (optional if you already have models)
   - Place the OpenVINO-optimized Phi-2 model files in `models/phi-2-int8-ov/`.
   - Place the BLIP PyTorch model files in `models/blip_pytorch/`.
   - For the Whisper speech-to-text model, run the download script:
     ```bash
     python download_whisper_model.py
     ```
   - (See project documentation for model download/conversion instructions if needed.)

## Running the Project
1. **Start the backend server:**
   ```bash
   cd backend
   python app.py
   ```
   The server will run at http://127.0.0.1:5000/

2. **Access the frontend:**
   - Open your browser and go to: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## API Endpoints
- `POST /api/qna` — JSON: `{ "question": "...", "context": "..." }` → `{ "answer": "..." }`
- `POST /api/image-caption` — FormData: `image` → `{ "caption": "..." }`
- `POST /api/image-qna` — FormData: `image`, `question` → `{ "caption": "...", "answer": "..." }`
- `POST /api/speech-to-text` — FormData: `audio` → `{ "text": "..." }`

## Notes
- All models run locally; no internet is required after setup.
- For best performance, use on a machine with sufficient RAM and CPU.
- The backend and frontend are decoupled; you can extend or replace the UI as needed.

## Troubleshooting
- **404 for /static/app.js:** Ensure your static files are in `frontend/static/` and Flask is configured to serve them.
- **Model loading errors:** Double-check model paths and formats.
- **No answer from QnA:** Try asking more specific questions; the LLM is not a code interpreter.
- **Speech-to-Text Issues**:
  - **Using Without FFmpeg**:
    - The application now attempts to work without FFmpeg by using browser-native WAV recording when possible
    - Click the "Test Audio Formats" button to check if your browser supports WAV recording
    - If your browser supports WAV recording, speech-to-text should work without FFmpeg
    - If your browser doesn't support WAV recording, you'll need to install FFmpeg for the feature to work
    - You can create a test WAV file using the included utility:
      ```bash
      python backend/create_test_wav.py
      ```
  - **With FFmpeg Installed**:
    - Make sure FFmpeg is properly installed and available in your system PATH
    - Check that your microphone is working and properly connected
    - Try speaking clearly and in a quiet environment
  - **General Troubleshooting**:
    - If you see "Error transcribing audio" messages, check the terminal logs for more detailed error information
    - Run the diagnostic tool to check your system configuration:
      ```bash
      python backend/speech_module.py --check
      ```
    - Test transcription with a specific audio file:
      ```bash
      python backend/speech_module.py --file path/to/your/audio.wav
      ```

## Credits
- [OpenVINO](https://docs.openvino.ai/) by Intel
- [Phi-2](https://huggingface.co/microsoft/phi-2) by Microsoft
- [Whisper](https://huggingface.co/openai/whisper-tiny) by OpenAI
- [BLIP](https://huggingface.co/Salesforce/blip-image-captioning-base) by Salesforce
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)

---

*Let's make classrooms smarter and more student-friendly through AI!*
