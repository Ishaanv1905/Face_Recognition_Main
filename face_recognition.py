from facenet_pytorch import MTCNN, InceptionResnetV1
import logging  # Added for logging
logging.basicConfig(level=logging.INFO)  # Added for logging configuration
mtcnn = MTCNN(image_size=160, margin=0)
model = InceptionResnetV1(pretrained='vggface2').eval()

def capture_face(frame_input=None):
    try:
        if frame_input is None:
            logging.warning("No frame input provided to capture_face.")  # Added logging
            return None
        face = mtcnn(frame_input)
        if face is not None:
            return model(face.unsqueeze(0)).detach().numpy()[0].astype('float32')
        else:
            logging.info("No face detected in the image.")  # Added logging
            return None
    except Exception as e:
        logging.error(f"Error in capture_face: {e}")  # Added logging
        return None  # Added error handling