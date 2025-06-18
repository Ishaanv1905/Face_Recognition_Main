from facenet_pytorch import MTCNN, InceptionResnetV1
mtcnn = MTCNN(image_size=160, margin=0)
model = InceptionResnetV1(pretrained='vggface2').eval()

def capture_face(frame_input=None):
    face = mtcnn(frame_input)
    if face is not None:
        return model(face.unsqueeze(0)).detach().numpy()[0].astype('float32')
    else:
        return None