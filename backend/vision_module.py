# MultipleFiles/vision_module.py

import cv2
import face_recognition
from deepface import DeepFace
import numpy as np

def live_attention_analysis():
    """Capture video from webcam and analyze attention and emotion in real-time."""
    video_capture = cv2.VideoCapture(0)  # Use the default camera

    while True:
        # Capture frame-by-frame
        ret, frame = video_capture.read()
        if not ret:
            print("Failed to capture video")
            break

        # Convert the image from BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Find all face locations and encodings
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        emotions = []
        attention_scores = []

        for face_encoding in face_encodings:
            # Analyze emotion using DeepFace
            try:
                deepface_result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                if isinstance(deepface_result, list) and deepface_result:
                    dominant_emotion = deepface_result[0]['dominant_emotion']
                    emotions.append(dominant_emotion)

                    # Basic attention estimation based on emotion
                    attention_score = 0.5  # Default neutral
                    if dominant_emotion in ["happy", "neutral", "surprise"]:
                        attention_score = 0.8
                    elif dominant_emotion in ["angry", "disgust", "fear", "sad"]:
                        attention_score = 0.2
                    attention_scores.append(attention_score)

            except Exception as e:
                print(f"Error analyzing emotion: {e}")
                emotions.append("unknown")
                attention_scores.append(0.5)  # Default neutral

        # Draw rectangles around faces and display emotions and attention scores
        for (top, right, bottom, left), emotion, score in zip(face_locations, emotions, attention_scores):
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, f"{emotion} ({score:.2f})", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # Display the resulting frame
        cv2.imshow('Live Attention Analysis', frame)

        # Break the loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the capture and close windows
    video_capture.release()
    cv2.destroyAllWindows()
