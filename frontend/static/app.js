document.addEventListener('DOMContentLoaded', function() {
    // Audio Recording Variables
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    const recordButton = document.getElementById('record-button');
    const micIcon = document.getElementById('mic-icon');
    const recordingStatus = document.getElementById('recording-status');
    const questionInput = document.getElementById('question');
    
    // Setup audio recording
    recordButton.addEventListener('click', toggleRecording);
    
    async function toggleRecording() {
        if (!isRecording) {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Try different audio formats in order of preference for librosa compatibility
                // WAV is preferred as it can be processed directly without FFmpeg
                let mimeType = null;
                const preferredTypes = [
                    'audio/wav',
                    'audio/x-wav',
                    'audio/webm',
                    'audio/webm;codecs=opus',
                    'audio/ogg',
                    'audio/ogg;codecs=opus'
                ];
                
                // Find the first supported MIME type
                for (const type of preferredTypes) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        mimeType = type;
                        break;
                    }
                }
                
                const options = mimeType ? { mimeType, audioBitsPerSecond: 128000 } : {};
                console.log('Using audio format:', mimeType || 'browser default');
                
                try {
                    mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    console.warn('MediaRecorder with specified options not supported, using default');
                    mediaRecorder = new MediaRecorder(stream);
                }
                
                audioChunks = [];
                
                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });
                
                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                    console.log('Audio recorded with MIME type:', mediaRecorder.mimeType);
                    sendAudioToServer(audioBlob);
                });
                
                // Request data every second to ensure we capture all audio
                mediaRecorder.start(1000);
                isRecording = true;
                recordButton.classList.add('recording');
                micIcon.textContent = '⏹️';
                recordingStatus.style.display = 'block';
            } catch (err) {
                console.error('Error accessing microphone:', err);
                alert('Could not access microphone. Please check permissions.');
            }
        } else {
            // Stop recording
            mediaRecorder.stop();
            isRecording = false;
            recordButton.classList.remove('recording');
            micIcon.textContent = '🎤';
            recordingStatus.style.display = 'none';
            
            // Stop all audio tracks
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
    
    function sendAudioToServer(audioBlob) {
        const formData = new FormData();
        // Add a proper filename with extension to help the backend identify the format
        const audioExt = mediaRecorder.mimeType.includes('webm') ? 'webm' : 
                        mediaRecorder.mimeType.includes('wav') ? 'wav' : 
                        mediaRecorder.mimeType.includes('mp4') ? 'mp4' : 'audio';
        formData.append('audio', audioBlob, `recording.${audioExt}`);
        
        // Show loading indicator
        questionInput.placeholder = 'Transcribing audio...';
        
        fetch('/api/speech-to-text', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.text) {
                questionInput.value = data.text;
            } else if (data.error) {
                console.error('Error:', data.error);
                alert('Error transcribing audio: ' + data.error);
            }
            questionInput.placeholder = 'Type your question here';
        })
        .catch(error => {
            console.error('Error sending audio to server:', error);
            alert('Error sending audio to server');
            questionInput.placeholder = 'Type your question here';
        });
    }
    
    // QnA Form Submission
    document.getElementById('qna-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const question = document.getElementById('question').value;
        const context = document.getElementById('context').value;
        const resultDiv = document.getElementById('qna-result');
        
        resultDiv.innerHTML = 'Loading...';
        resultDiv.style.display = 'block';
        
        fetch('/api/qna', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, context }),
        })
        .then(response => response.json())
        .then(data => {
            resultDiv.innerHTML = `<strong>Answer:</strong> ${data.answer}`;
        })
        .catch((error) => {
            resultDiv.innerHTML = `<span class="error">Error: ${error}</span>`;
        });
    });


// Image + Question (Image QnA) Form
document.getElementById('image-qna-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const imageFile = document.getElementById('image-qna-image').files[0];
    const imageQuestion = document.getElementById('image-qna-question').value;
    const resultDiv = document.getElementById('image-qna-result');
    
    if (!imageFile) {
        resultDiv.innerHTML = '<span class="error">Please select an image file.</span>';
        resultDiv.style.display = 'block';
        return;
    }
    
    resultDiv.innerHTML = '<div class="loader"></div> Processing image and question...';
    resultDiv.style.display = 'block';
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('question', imageQuestion);
    
    fetch('/api/image-qna', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        resultDiv.innerHTML = `<strong>Caption:</strong> ${data.caption}<br><strong>Answer:</strong> ${data.answer}`;
    })
    .catch((error) => {
        resultDiv.innerHTML = `<span class="error">Error: ${error}</span>`;
    });
});

// Image Captioning Form
document.getElementById('image-caption-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const imageFile = document.getElementById('caption-image-file').files[0];
    const resultDiv = document.getElementById('image-caption-result');
    
    if (!imageFile) {
        resultDiv.innerHTML = '<span class="error">Please select an image file.</span>';
        resultDiv.style.display = 'block';
        return;
    }
    
    resultDiv.innerHTML = '<div class="loader"></div> Generating caption...';
    resultDiv.style.display = 'block';
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    fetch('/api/image-caption', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        resultDiv.innerHTML = `<strong>Caption:</strong> ${data.caption}`;
    })
    .catch((error) => {
        resultDiv.innerHTML = `<span class="error">Error: ${error}</span>`;
    });
});

});