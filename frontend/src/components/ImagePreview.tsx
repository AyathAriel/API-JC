import { useState } from 'react';
import { FaEdit, FaTrash, FaCamera } from 'react-icons/fa';

interface ImagePreviewProps {
  image: string;
  onDelete: () => void;
  onRetake: () => void;
  label?: string;
}

export default function ImagePreview({ image, onDelete, onRetake, label }: ImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (isZoomed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={toggleZoom}>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <img 
            src={image} 
            alt="Vista ampliada" 
            className="max-h-screen max-w-screen-lg object-contain"
          />
          <button 
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-2 text-white"
            onClick={toggleZoom}
          >
            <FaEdit size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border rounded-lg overflow-hidden bg-gray-100 shadow-sm">
      {label && (
        <div className="absolute top-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white px-3 py-1 text-sm z-10">
          {label}
        </div>
      )}
      
      <div className="relative" style={{ aspectRatio: "4/3" }}>
        <img
          src={image}
          alt={label || "Imagen capturada"}
          className="w-full h-full object-cover"
          onClick={toggleZoom}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between p-2 bg-gray-800 bg-opacity-75">
        <button
          onClick={onDelete}
          className="text-white hover:text-red-400 p-1"
          title="Eliminar"
        >
          <FaTrash />
        </button>
        
        <button
          onClick={onRetake}
          className="text-white hover:text-blue-400 p-1"
          title="Volver a tomar"
        >
          <FaCamera />
        </button>
      </div>
    </div>
  );
} 