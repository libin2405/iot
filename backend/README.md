# IoTFireGuard Backend - Real-time Fire Detection

This backend service provides real-time fire detection using PyTorch and computer vision.

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Model Setup
Place your trained PyTorch model file at:
```
backend/trained-models/best_model.pt
```

The model should be a ResNet50 with the following architecture:
- Input: 224x224 RGB images
- Output: 3 classes (Fire, Neutral, Smoke)
- Final layer: Linear(2048, 128) -> ReLU -> Linear(128, 3) -> Softmax

### 4. Run the Server
```bash
python app.py
```

The server will start on `http://localhost:5000` and begin capturing from the default camera (index 0).

## API Endpoints

### WebSocket Events

#### Client -> Server
- `connect`: Establishes connection and starts video capture

#### Server -> Client
- `prediction_result`: Real-time detection results
  ```json
  {
    "prediction": "Fire|Smoke|Neutral",
    "probability": "85.32"
  }
  ```

## Configuration

### Camera Settings
- Default camera index: 0
- Frame rate: ~10 FPS
- Image preprocessing: ResNet50 standard normalization

### Model Classes
1. **Fire**: Active fire detected
2. **Smoke**: Smoke plume detected  
3. **Neutral**: Normal forest conditions

## Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Try different camera indices (0, 1, 2...)
- Check if camera is being used by another application

### Model Loading Issues
- Verify model file exists at correct path
- Ensure model architecture matches expected format
- Check PyTorch version compatibility

### Performance Optimization
- Adjust frame rate in `socketio.sleep()` call
- Use GPU acceleration if available
- Consider image resolution reduction for faster processing