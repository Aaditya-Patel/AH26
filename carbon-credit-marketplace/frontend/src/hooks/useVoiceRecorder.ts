import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderOptions {
  onTranscript?: (audioFile: File) => Promise<void>;
  onError?: (error: Error) => void;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder with optimal settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', // WebM with Opus codec (good browser support)
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Process audio if callback provided
        if (options.onTranscript && audioBlob.size > 0) {
          setIsProcessing(true);
          try {
            // Create File object from blob for API
            const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
            await options.onTranscript(audioFile);
          } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to process audio');
            setError(error.message);
            options.onError?.(error);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start recording');
      setError(error.message);
      setIsRecording(false);
      options.onError?.(error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
        setError('Microphone permission denied. Please allow microphone access and try again.');
      } else if (error.message.includes('NotFoundError') || error.message.includes('not found')) {
        setError('No microphone found. Please connect a microphone and try again.');
      }
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsProcessing(false);
    setError(null);
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

