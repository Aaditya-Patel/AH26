import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { verificationAPI } from '../api/client';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface DocumentUploadProps {
  documentType: string;
  label: string;
  required?: boolean;
  onUploadComplete?: (data: any) => void;
  onExtractedData?: (extractedData: any) => void;
  className?: string;
}

export default function DocumentUpload({
  documentType,
  label,
  required = false,
  onUploadComplete,
  onExtractedData,
  className
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await verificationAPI.extractOCR(file, documentType);
      const data = response.data;

      setExtractedData(data.extracted_data);
      
      if (onExtractedData) {
        onExtractedData(data.extracted_data);
      }
      
      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {extractedData && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-1 text-sm text-swachh-green-500"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Data Extracted</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!file ? (
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            isDragging
              ? "border-swachh-green-500 bg-swachh-green-500/10"
              : "border-border hover:border-swachh-green-500/50 hover:bg-muted/50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Drag and drop your document here
          </p>
          <p className="text-xs text-muted-foreground">
            or click to browse (Max 10MB)
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {/* Preview */}
          <div className="relative border rounded-lg overflow-hidden bg-muted/30">
            {preview && (
              <img
                src={preview}
                alt="Document preview"
                className="w-full h-48 object-contain"
              />
            )}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border shadow-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* File Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{file.name}</span>
            <span>•</span>
            <span>{(file.size / 1024).toFixed(1)} KB</span>
          </div>

          {/* Upload Button */}
          {!extractedData && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              variant="gradient"
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Extract Data from Document
                </>
              )}
            </Button>
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-swachh-green-500/10 border border-swachh-green-500/20 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center space-x-2 text-sm font-medium text-swachh-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Extracted Data:</span>
              </div>
              <div className="text-sm space-y-1">
                {Object.entries(extractedData).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
