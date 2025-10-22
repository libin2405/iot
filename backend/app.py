import torch
import cv2
from flask import Flask
from flask_socketio import SocketIO, emit
from PIL import Image
from torchvision import transforms
import torchvision.models as models
import threading
import time
from sms_service import SMSAlertService

# Initialize Flask app and SocketIO
app = Flask(__name__)
# Replace with a secret key
app.config['SECRET_KEY'] = 'secret!'
# Allow all origins for simplicity in development
socketio = SocketIO(app, cors_allowed_origins="*") 

# Initialize SMS Alert Service
sms_service = SMSAlertService()

# --- Model Loading (from your notebook) ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50(weights=None)
model.fc = torch.nn.Sequential(
    torch.nn.Linear(2048, 128),
    torch.nn.ReLU(),
    torch.nn.Linear(128, 3),
    torch.nn.Softmax(dim=1)
)
model.load_state_dict(torch.load('./trained-models/best_model.pt', map_location=device))
model.to(device)
model.eval()

class_names = ['Fire', 'Neutral', 'Smoke']
prediction_transform = transforms.Compose([
    transforms.Resize(size=(224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
# --- End of Model Loading ---

# Global variable to control the background thread
thread = None
thread_lock = threading.Lock()

def predict_from_frame(frame):
    """Runs prediction on a single video frame."""
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    image = prediction_transform(image).unsqueeze(0)
    image = image.to(device)
    
    with torch.no_grad():
        pred = model(image)
        probabilities = torch.nn.functional.softmax(pred, dim=1)
        idx = torch.argmax(probabilities, dim=1).item()
        prob = probabilities[0][idx].item() * 100
        prediction = class_names[idx]
    return prediction, prob

def background_thread():
    """Continuously captures frames and sends predictions."""
    print("Starting video capture...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Cannot open camera")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
        
        prediction, prob = predict_from_frame(frame)
        
        # Send SMS alert if fire detected with high confidence
        if prediction == 'Fire' and prob >= sms_service.fire_confidence_threshold:
            sms_service.send_fire_alert(prediction, prob)
        
        # Send the prediction and probability to all connected clients
        socketio.emit('prediction_result', {'prediction': prediction, 'probability': f"{prob:.2f}"})
        
        # Control the frame rate to about 10 FPS
        socketio.sleep(0.1) 
    
    cap.release()

@socketio.on('connect')
def connect():
    """Starts the background thread when a client connects."""
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(target=background_thread)
    print("Client connected")

@socketio.on('test_sms')
def test_sms(data):
    """Test SMS functionality"""
    test_number = data.get('phone_number') if data else None
    success, message = sms_service.send_test_message(test_number)
@socketio.on('get_sms_status')
def get_sms_status():
    """Get SMS service status"""
    status = sms_service.get_status()
    emit('sms_status', status)
    emit('sms_test_result', {'success': success, 'message': message})
if __name__ == '__main__':
    # Run the server
    socketio.run(app, debug=True)