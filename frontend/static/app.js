// QnA Form
document.getElementById('qna-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const question = document.getElementById('question').value;
    const context = document.getElementById('context').value;
    const resDiv = document.getElementById('qna-result');
    resDiv.style.display = 'none';
    resDiv.textContent = 'Loading...';
    try {
        const response = await fetch('/api/qna', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, context })
        });
        const data = await response.json();
        resDiv.textContent = data.answer || data.error || 'No answer.';
    } catch (err) {
        resDiv.textContent = 'Error: ' + err;
    }
    resDiv.style.display = 'block';
});

// Image + Question (Image QnA) Form
document.getElementById('image-qna-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const imageInput = document.getElementById('image-qna-image');
    const questionInput = document.getElementById('image-qna-question');
    const resDiv = document.getElementById('image-qna-result');
    resDiv.style.display = 'none';
    resDiv.textContent = 'Loading...';
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('question', questionInput.value);
    try {
        const response = await fetch('/api/image-qna', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        resDiv.innerHTML = `<b>Caption:</b> ${data.caption || data.error || 'No caption.'}<br><b>Answer:</b> ${data.answer || 'No answer.'}`;
    } catch (err) {
        resDiv.textContent = 'Error: ' + err;
    }
    resDiv.style.display = 'block';
});

// Image Captioning Form
document.getElementById('caption-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const imageInput = document.getElementById('image');
    const resDiv = document.getElementById('caption-result');
    resDiv.style.display = 'none';
    resDiv.textContent = 'Loading...';
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    try {
        const response = await fetch('/api/image-caption', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        resDiv.textContent = data.caption || data.error || 'No caption.';
    } catch (err) {
        resDiv.textContent = 'Error: ' + err;
    }
    resDiv.style.display = 'block';
}); 