# AI Classroom Assistant

A multimodal AI-powered assistant for classrooms that can answer questions, generate image captions, and combine visual and textual understanding to help students and teachers.

## Features
- **Text QnA:** Ask questions and get answers using a local LLM (Phi-2, OpenVINO-optimized).
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
│   └── blip_pytorch/         # BLIP PyTorch model files
├── data/                     # empty for future use
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Requirements
- Python 3.8+
- (Recommended) Virtual environment (venv)
- Sufficient disk space for models (several GB)

## Installation & Setup
1. **Clone or download this repository.**
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv # first run this to creat virtual enviroment
   # On Windows:
   .\venv\Scripts\activate # activate enviroment
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt  # install requirments
   ```
4. **Download/prepare models:**   (optional if you dont have modals)
   - Place the OpenVINO-optimized Phi-2 model files in `models/phi-2-int8-ov/`.
   - Place the BLIP PyTorch model files in `models/blip_pytorch/`.
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

## Notes
- All models run locally; no internet is required after setup.
- For best performance, use on a machine with sufficient RAM and CPU.
- The backend and frontend are decoupled; you can extend or replace the UI as needed.

## Troubleshooting
- **404 for /static/app.js:** Ensure your static files are in `frontend/static/` and Flask is configured to serve them.
- **Model loading errors:** Double-check model paths and formats.
- **No answer from QnA:** Try asking more specific questions; the LLM is not a code interpreter.

## Credits
- [Phi-2](https://huggingface.co/microsoft/phi-2) by Microsoft
- [BLIP](https://huggingface.co/Salesforce/blip-image-captioning-base) by Salesforce
- [OpenVINO](https://docs.openvino.ai/) by Intel
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)

---

*Let's make classrooms smarter and more student-friendly through AI!*
