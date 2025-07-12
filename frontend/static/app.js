document.addEventListener('DOMContentLoaded', function() {
    // Audio Recording Variables
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    const recordButton = document.getElementById('record-button');
    const micIcon = document.getElementById('mic-icon');
    const recordingStatus = document.getElementById('recording-status');
    const questionInput = document.getElementById('question');
    
    // Chat history array
    let chatHistory = [];
    
    // Initialize the interface
    initializeInterface();
    
    // Theme management
    initializeTheme();
    
    function initializeInterface() {
        setupFileInputs();
        setupAudioRecording();
        setupFormHandlers();
        loadChatHistory();
        updateStatusIndicator('Ready');
    }
    
    function initializeTheme() {
        // Check for saved theme preference or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }
    
    function setTheme(theme) {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (theme === 'light') {
            body.setAttribute('data-theme', 'light');
            themeIcon.textContent = '☀️';
        } else {
            body.removeAttribute('data-theme');
            themeIcon.textContent = '🌙';
        }
        
        localStorage.setItem('theme', theme);
    }
    
    // Global function for theme toggle
    window.toggleTheme = function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        // Show notification
        const themeName = newTheme === 'light' ? 'Light' : 'Dark';
        showNotification(`Switched to ${themeName} mode`, 'info');
    };
    
    function setupFileInputs() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            const wrapper = input.closest('.file-upload-area');
            const display = wrapper.querySelector('.file-upload-display');
            const uploadText = display.querySelector('.upload-text');
            const previewContainer = display.querySelector('.file-preview');
            
            input.addEventListener('change', function() {
                handleFileSelection(this, uploadText, previewContainer, wrapper);
            });
            
            // Drag and drop functionality
            wrapper.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            
            wrapper.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
            });
            
            wrapper.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    input.files = files;
                    handleFileSelection(input, uploadText, previewContainer, wrapper);
                }
            });
        });
    }
    
    function handleFileSelection(input, uploadText, previewContainer, wrapper) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            uploadText.textContent = file.name;
            wrapper.classList.add('file-selected');
            
            // Show image preview
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        } else {
            uploadText.textContent = 'Drop image here or click to browse';
            wrapper.classList.remove('file-selected');
            previewContainer.innerHTML = '';
        }
    }
    
    function setupAudioRecording() {
        recordButton.addEventListener('click', toggleRecording);
    }
    
    async function toggleRecording() {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                let mimeType = null;
                const preferredTypes = [
                    'audio/wav',
                    'audio/x-wav',
                    'audio/webm',
                    'audio/webm;codecs=opus',
                    'audio/ogg',
                    'audio/ogg;codecs=opus'
                ];
                
                for (const type of preferredTypes) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        mimeType = type;
                        break;
                    }
                }
                
                const options = mimeType ? { mimeType, audioBitsPerSecond: 128000 } : {};
                
                try {
                    mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    mediaRecorder = new MediaRecorder(stream);
                }
                
                audioChunks = [];
                
                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });
                
                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                    sendAudioToServer(audioBlob);
                });
                
                mediaRecorder.start(1000);
                isRecording = true;
                recordButton.classList.add('recording');
                micIcon.textContent = '⏹️';
                recordingStatus.style.display = 'block';
                updateStatusIndicator('Recording');
            } catch (err) {
                console.error('Error accessing microphone:', err);
                showNotification('Could not access microphone. Please check permissions.', 'error');
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordButton.classList.remove('recording');
            micIcon.textContent = '🎤';
            recordingStatus.style.display = 'none';
            updateStatusIndicator('Processing');
            
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
    
    function sendAudioToServer(audioBlob) {
        const formData = new FormData();
        const audioExt = mediaRecorder.mimeType.includes('webm') ? 'webm' : 
                        mediaRecorder.mimeType.includes('wav') ? 'wav' : 
                        mediaRecorder.mimeType.includes('mp4') ? 'mp4' : 'audio';
        formData.append('audio', audioBlob, `recording.${audioExt}`);
        
        const originalPlaceholder = questionInput.placeholder;
        questionInput.placeholder = 'Transcribing audio...';
        questionInput.disabled = true;
        
        fetch('/api/speech-to-text', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.text) {
                questionInput.value = data.text;
                showNotification('Audio transcribed successfully!', 'success');
                updateStatusIndicator('Ready');
            } else if (data.error) {
                console.error('Error:', data.error);
                showNotification('Error transcribing audio: ' + data.error, 'error');
                updateStatusIndicator('Error');
            }
        })
        .catch(error => {
            console.error('Error sending audio to server:', error);
            showNotification('Error sending audio to server', 'error');
            updateStatusIndicator('Error');
        })
        .finally(() => {
            questionInput.placeholder = originalPlaceholder;
            questionInput.disabled = false;
        });
    }
    
    function setupFormHandlers() {
        // QnA Form
        document.getElementById('qna-form').addEventListener('submit', function(e) {
            e.preventDefault();
            handleQnASubmission();
        });
        
        // Image QnA Form
        document.getElementById('image-qna-form').addEventListener('submit', function(e) {
            e.preventDefault();
            handleImageQnASubmission();
        });
        
        // Image Caption Form
        document.getElementById('image-caption-form').addEventListener('submit', function(e) {
            e.preventDefault();
            handleImageCaptionSubmission();
        });
    }
    
    function handleQnASubmission() {
        const question = document.getElementById('question').value.trim();
        const context = document.getElementById('context').value.trim();
        const resultDiv = document.getElementById('qna-result');
        const responseCard = document.getElementById('qna-response');
        const submitBtn = document.querySelector('#qna-form button[type="submit"]');
        
        if (!question) {
            showNotification('Please enter a question', 'warning');
            return;
        }
        
        // Add to chat history
        addToChatHistory('Text Q&A', question);
        
        // Show response card and update UI
        showResponseCard(responseCard, 'Text Analysis');
        updateStatusIndicator('Processing');
        
        // Disable form and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loader"></div> Processing...';
        showLoading(resultDiv, 'Analyzing your question...');
        
        fetch('/api/qna', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, context }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.answer) {
                showResult(resultDiv, `<strong>Answer:</strong> ${data.answer}`, 'success');
                showNotification('Answer generated successfully!', 'success');
                updateStatusIndicator('Complete');
                updateEmotionAnalysis('qna-response', 85, 92);
            } else {
                throw new Error('No answer received');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showResult(resultDiv, `<strong>Error:</strong> ${error.message || 'Failed to get answer'}`, 'error');
            showNotification('Failed to get answer', 'error');
            updateStatusIndicator('Error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Send</span><div class="send-icon">→</div>';
        });
    }
    
    function handleImageQnASubmission() {
        const imageFile = document.getElementById('image-qna-image').files[0];
        const imageQuestion = document.getElementById('image-qna-question').value.trim();
        const resultDiv = document.getElementById('image-qna-result');
        const responseCard = document.getElementById('image-response');
        const submitBtn = document.querySelector('#image-qna-form button[type="submit"]');
        
        if (!imageFile) {
            showNotification('Please select an image file', 'warning');
            return;
        }
        
        if (!imageQuestion) {
            showNotification('Please enter a question about the image', 'warning');
            return;
        }
        
        // Add to chat history
        addToChatHistory('Image Q&A', `${imageQuestion} (${imageFile.name})`);
        
        // Show response card and update UI
        showResponseCard(responseCard, 'Image Analysis');
        updateStatusIndicator('Processing');
        
        // Disable form and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loader"></div> Analyzing...';
        showLoading(resultDiv, 'Processing image and analyzing your question...');
        
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('question', imageQuestion);
        
        fetch('/api/image-qna', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.caption && data.answer) {
                showResult(resultDiv, `<strong>Caption:</strong> ${data.caption}<br><br><strong>Answer:</strong> ${data.answer}`, 'success');
                showNotification('Image analyzed successfully!', 'success');
                updateStatusIndicator('Complete');
                updateEmotionAnalysis('image-response', 78, 88);
            } else {
                throw new Error('Incomplete response received');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showResult(resultDiv, `<strong>Error:</strong> ${error.message || 'Failed to analyze image'}`, 'error');
            showNotification('Failed to analyze image', 'error');
            updateStatusIndicator('Error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Analyze</span><div class="send-icon">→</div>';
        });
    }
    
    function handleImageCaptionSubmission() {
        const imageFile = document.getElementById('caption-image-file').files[0];
        const resultDiv = document.getElementById('image-caption-result');
        const responseCard = document.getElementById('image-response');
        const submitBtn = document.querySelector('#image-caption-form button[type="submit"]');
        
        if (!imageFile) {
            showNotification('Please select an image file', 'warning');
            return;
        }
        
        // Add to chat history
        addToChatHistory('Image Caption', `Caption for ${imageFile.name}`);
        
        // Show response card and update UI
        showResponseCard(responseCard, 'Image Analysis');
        updateStatusIndicator('Processing');
        
        // Disable form and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loader"></div> Processing...';
        showLoading(resultDiv, 'Generating caption for your image...');
        
        const formData = new FormData();
        formData.append('image', imageFile);
        
        fetch('/api/image-caption', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.caption) {
                showResult(resultDiv, `<strong>Caption:</strong> ${data.caption}`, 'success');
                showNotification('Caption generated successfully!', 'success');
                updateStatusIndicator('Complete');
                updateEmotionAnalysis('image-response', 82, 90);
            } else {
                throw new Error('No caption received');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showResult(resultDiv, `<strong>Error:</strong> ${error.message || 'Failed to generate caption'}`, 'error');
            showNotification('Failed to generate caption', 'error');
            updateStatusIndicator('Error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Generate Caption</span><div class="send-icon">→</div>';
        });
    }
    
    function showResponseCard(responseCard, type) {
        // Hide welcome message
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
        
        // Update response type and timestamp
        const responseType = responseCard.querySelector('.response-type');
        const timestamp = responseCard.querySelector('.timestamp');
        
        responseType.textContent = type;
        timestamp.textContent = new Date().toLocaleTimeString();
        
        // Show response card
        responseCard.style.display = 'block';
        
        // Scroll to response
        responseCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function updateEmotionAnalysis(cardId, value1, value2) {
        const card = document.getElementById(cardId);
        const emotionBars = card.querySelectorAll('.emotion-fill');
        const emotionValues = card.querySelectorAll('.emotion-value');
        
        if (emotionBars.length >= 2) {
            setTimeout(() => {
                emotionBars[0].style.width = `${value1}%`;
                emotionBars[1].style.width = `${value2}%`;
                emotionValues[0].textContent = `${value1}%`;
                emotionValues[1].textContent = `${value2}%`;
            }, 500);
        }
    }
    
    function updateStatusIndicator(status) {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = status;
        
        // Remove existing status classes
        statusDot.classList.remove('error', 'success', 'warning');
        
        // Add appropriate status class
        if (status === 'Error') {
            statusDot.classList.add('error');
        } else if (status === 'Complete') {
            statusDot.classList.add('success');
        } else if (status === 'Processing') {
            // Default blue color from CSS variables
        }
    }
    
    function addToChatHistory(type, text) {
        const historyItem = {
            type: type,
            text: text,
            timestamp: new Date().toLocaleTimeString()
        };
        
        chatHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(0, 10);
        }
        
        updateChatHistoryDisplay();
        saveChatHistory();
    }
    
    function updateChatHistoryDisplay() {
        const historyList = document.getElementById('chat-history');
        
        if (chatHistory.length === 0) {
            historyList.innerHTML = '<div class="history-empty"><span>No previous conversations</span></div>';
            return;
        }
        
        historyList.innerHTML = chatHistory.map(item => `
            <div class="history-item" onclick="selectHistoryItem('${item.type}', '${item.text.replace(/'/g, "\\'")}')">
                <div class="history-item-type">${item.type}</div>
                <div class="history-item-text">${item.text}</div>
            </div>
        `).join('');
    }
    
    function loadChatHistory() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            chatHistory = JSON.parse(saved);
            updateChatHistoryDisplay();
        }
    }
    
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    
    // Global functions for HTML onclick handlers
    window.switchTab = function(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.closest('.tab-btn').classList.add('active');
        
        // Update form sections
        document.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
        
        if (tabName === 'text') {
            document.getElementById('text-form-section').classList.add('active');
        } else if (tabName === 'image-qna') {
            document.getElementById('image-qna-form-section').classList.add('active');
        } else if (tabName === 'image-caption') {
            document.getElementById('image-caption-form-section').classList.add('active');
        }
    };
    
    window.clearChatHistory = function() {
        chatHistory = [];
        updateChatHistoryDisplay();
        saveChatHistory();
        showNotification('Chat history cleared', 'info');
    };
    
    window.selectHistoryItem = function(type, text) {
        // Switch to appropriate tab and fill form
        if (type === 'Text Q&A') {
            switchTab('text');
            document.getElementById('question').value = text;
        } else if (type === 'Image Q&A') {
            switchTab('image-qna');
            const parts = text.split(' (');
            if (parts.length > 1) {
                document.getElementById('image-qna-question').value = parts[0];
            }
        }
        
        showNotification(`Loaded: ${type}`, 'info');
    };
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    function showLoading(element, message = 'Processing...') {
        element.innerHTML = `<div class="loader"></div> ${message}`;
        element.style.display = 'block';
    }
    
    function showResult(element, content, type = '') {
        element.innerHTML = content;
        element.className = `result-content ${type}`;
        element.style.display = 'block';
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeElement = document.activeElement;
            const form = activeElement.closest('form');
            if (form) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
    
    // Smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});