import React, { useRef, useState, useEffect } from 'react';
import { FaQrcode, FaTimes, FaQrcode as FaScan, FaIdCard } from 'react-icons/fa';
import jsQR from 'jsqr';
import toast from 'react-hot-toast';

interface ScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  mode?: 'qr' | 'cedula';
}

const QrCodeScanner: React.FC<ScannerProps> = ({ onScan, onClose, mode = 'qr' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [scanMode, setScanMode] = useState<'qr' | 'cedula'>(mode);
  
  // ID para el intervalo de escaneo
  const scanIntervalRef = useRef<number | null>(null);

  // Inicializar la cámara
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission(true);
        setScanning(true);
        toast.success('Cámara iniciada correctamente');
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, permita el acceso a la cámara o utilice otro dispositivo.');
      toast.error('Error al acceder a la cámara');
      console.error('Error al acceder a la cámara:', err);
    }
  };

  // Detener la cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Limpiar el intervalo de escaneo
    if (scanIntervalRef.current !== null) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  // Escanear código QR o cédula según el modo
  const scanFrame = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        if (scanMode === 'qr') {
          // Usar jsQR para detectar el código QR
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (qrCode) {
            setResult(qrCode.data);
            stopCamera();
            setScanning(false);
            toast.success('Código QR escaneado correctamente');
            // Añadir un pequeño retardo para mostrar feedback visual
            setTimeout(() => {
              onScan(qrCode.data);
            }, 500);
          }
        } else {
          // Simulación de OCR para cédulas
          // En una implementación real, aquí se usaría una biblioteca OCR como Tesseract.js
          simulateOCRScan(canvas);
        }
      }
    }
  };

  // Simulación de escaneo OCR para cédulas
  // Esta es una simulación básica. En una implementación real, utilizaríamos Tesseract.js u otra biblioteca OCR
  const simulateOCRScan = (canvas: HTMLCanvasElement) => {
    // La probabilidad de "detectar" una cédula aumenta con el tiempo
    if (Math.random() < 0.05) { // 5% de probabilidad cada 200ms
      // Generar una cédula panameña ficticia: PE-123-456
      const cedulas = [
        "8-123-456",
        "PE-123-456",
        "E-123-456789",
        "1-234-567",
        "N-12-345"
      ];
      
      const cedulaGenerada = cedulas[Math.floor(Math.random() * cedulas.length)];
      
      setResult(cedulaGenerada);
      stopCamera();
      setScanning(false);
      toast.success('Cédula escaneada correctamente');
      // Añadir un pequeño retardo para mostrar feedback visual
      setTimeout(() => {
        onScan(cedulaGenerada);
      }, 500);
    }
  };

  // Inicializar la cámara al montar el componente
  useEffect(() => {
    initializeCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Configurar el intervalo de escaneo cuando la cámara está activa
  useEffect(() => {
    if (scanning && cameraPermission) {
      scanIntervalRef.current = window.setInterval(scanFrame, 200);
    }
    
    return () => {
      if (scanIntervalRef.current !== null) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [scanning, cameraPermission, scanMode]);

  // Si se ha encontrado un código QR o cédula
  const handleConfirm = () => {
    if (result) {
      onScan(result);
    }
  };

  // Reiniciar el escaneo
  const handleReset = () => {
    setResult(null);
    setScanning(true);
    initializeCamera();
  };

  // Cambiar el modo de escaneo
  const toggleScanMode = () => {
    const currentMode = scanMode;
    setScanMode(currentMode === 'qr' ? 'cedula' : 'qr');
    toast.success(`Cambiado a modo de escaneo: ${currentMode === 'qr' ? 'cédula' : 'QR'}`);
    if (result) {
      handleReset();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 bg-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {scanMode === 'qr' ? 'Escanear código QR' : 'Escanear cédula'}
          </h3>
          <div className="flex items-center">
            <button 
              onClick={toggleScanMode} 
              className="mr-3 text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-all"
              title={scanMode === 'qr' ? 'Cambiar a escaneo de cédula' : 'Cambiar a escaneo de QR'}
            >
              {scanMode === 'qr' ? <FaIdCard size={20} /> : <FaQrcode size={20} />}
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 bg-gray-50 p-2 rounded-full transition-all"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
              <p>{error}</p>
              <button 
                onClick={() => initializeCamera()} 
                className="mt-3 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : result ? (
            <div className="text-center p-4">
              <div className="bg-green-50 text-green-700 p-4 mb-4 rounded-lg border border-green-100">
                {scanMode === 'qr' ? <FaQrcode className="inline-block text-3xl mb-2" /> : <FaIdCard className="inline-block text-3xl mb-2" />}
                <h4 className="font-medium mb-2">
                  {scanMode === 'qr' ? '¡Código QR escaneado correctamente!' : '¡Cédula escaneada correctamente!'}
                </h4>
                <p className="text-sm break-all">{result}</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/3] w-full bg-gray-900 flex justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-green-500 w-2/3 h-2/3 opacity-70"></div>
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded max-h-[70vh] max-w-full"
              />
              <canvas ref={canvasRef} className="hidden" />
              {scanning && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-black bg-opacity-50 text-white py-2 px-4 rounded-full text-sm">
                    {scanMode === 'qr' ? 'Buscando código QR...' : 'Analizando cédula...'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-100 flex justify-center space-x-4">
          {result ? (
            <>
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center transition-colors"
              >
                <FaScan className="mr-2" /> Escanear otro
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
              >
                Confirmar
              </button>
            </>
          ) : !error && !scanning ? (
            <button
              onClick={() => setScanning(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
            >
              Iniciar escaneo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default QrCodeScanner; 