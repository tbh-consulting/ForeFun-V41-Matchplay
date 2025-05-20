import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  isLoading?: boolean;
}

export function ImageUpload({ 
  currentImage, 
  onUpload, 
  onRemove,
  isLoading 
}: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Course"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={() => onRemove()}
            className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {isDragActive ? 
              'Drop the image here' : 
              'Drag & drop an image here, or click to select'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: 10MB
          </p>
        </div>
      )}
    </div>
  );
}