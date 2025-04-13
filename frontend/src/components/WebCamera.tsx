import React, { useRef, useState, useCallback, useEffect } from 'react';
import { FaCamera, FaTimes, FaRedo } from 'react-icons/fa';

interface WebCameraProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const WebCamera: React.FC<WebCameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission(true);
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, permita el acceso a la cámara o utilice otro dispositivo.');
      console.error('Error al acceder a la cámara:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    initializeCamera();
    
    return () => {
      stopCamera();
    };
  }, [initializeCamera, stopCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    initializeCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 bg-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tomar foto</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
              <p>{error}</p>
            </div>
          ) : capturedImage ? (
            <div className="relative flex justify-center">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="rounded max-h-[70vh] max-w-full"
              />
            </div>
          ) : (
            <div className="relative aspect-[4/3] w-full bg-gray-900 flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded max-h-[70vh] max-w-full"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-100 flex justify-center space-x-4">
          {capturedImage ? (
            <>
              <button
                onClick={retakePhoto}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
              >
                <FaRedo className="mr-2" /> Volver a tomar
              </button>
              <button
                onClick={confirmPhoto}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Confirmar
              </button>
            </>
          ) : !error && cameraPermission ? (
            <button
              onClick={takePhoto}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-8 rounded-full flex items-center justify-center"
            >
              <FaCamera size={24} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WebCamera; 