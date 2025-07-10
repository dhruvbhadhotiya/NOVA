import os
from flask import Flask, request, jsonify, send_from_directory
from nlp_module import answer_question
from image_captioning import generate_caption
from speech_module import transcribe_audio

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
static_dir = os.path.join(frontend_dir, 'static')

app = Flask(
    __name__,
    static_folder=static_dir,
    static_url_path='/static'
)

@app.route('/api/qna', methods=['POST'])
def qna():
    data = request.get_json()
    question = data.get('question', '')
    context = data.get('context', '')
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    answer = answer_question(question, context)
    return jsonify({'answer': answer})

@app.route('/api/image-caption', methods=['POST'])
def image_caption():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    image_file = request.files['image']
    caption = generate_caption(image_file)
    return jsonify({'caption': caption})

@app.route('/api/image-qna', methods=['POST'])
def image_qna():
    if 'image' not in request.files or 'question' not in request.form:
        return jsonify({'error': 'Image and question required'}), 400
    image_file = request.files['image']
    question = request.form['question']
    caption = generate_caption(image_file)
    answer = answer_question(question, context=caption)
    return jsonify({'caption': caption, 'answer': answer})

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No audio file selected'}), 400
    
    # Log information about the received file
    app.logger.info(f"Received audio file: {audio_file.filename}, Content-Type: {audio_file.content_type}")
    
    try:
        text = transcribe_audio(audio_file)
        if text.startswith("Error"):
            return jsonify({'error': text}), 400
        return jsonify({'text': text})
    except Exception as e:
        app.logger.error(f"Exception in speech_to_text: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/')
def serve_index():
    return send_from_directory(frontend_dir, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
