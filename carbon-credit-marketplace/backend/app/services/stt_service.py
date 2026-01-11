"""
Speech-to-Text (STT) Service using OpenAI Whisper

This service provides accurate speech recognition using the Whisper model.
It supports multiple languages and audio formats with high accuracy.
"""

import logging
import tempfile
import os
from typing import Optional
import whisper
from fastapi import HTTPException, UploadFile
import torch

logger = logging.getLogger(__name__)

class STTService:
    """Speech-to-Text service using OpenAI Whisper"""
    
    def __init__(self, model_name: str = "base"):
        """
        Initialize STT service with Whisper model
        
        Args:
            model_name: Whisper model size (tiny, base, small, medium, large, large-v2, large-v3)
                       Default: "base" (good balance of speed and accuracy)
        """
        self.model_name = model_name
        self.model: Optional[whisper.Whisper] = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"STT Service initialized with model: {model_name}, device: {self.device}")
    
    def _load_model(self):
        """Lazy load Whisper model"""
        if self.model is None:
            try:
                logger.info(f"Loading Whisper model: {self.model_name}")
                self.model = whisper.load_model(self.model_name, device=self.device)
                logger.info("Whisper model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load Whisper model: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to load Whisper model: {str(e)}"
                )
    
    async def speech_to_text(
        self,
        audio_data: bytes,
        language: Optional[str] = None,
        task: str = "transcribe",
    ) -> dict:
        """
        Convert speech audio to text
        
        Args:
            audio_data: Audio file bytes (supports various formats: wav, mp3, m4a, etc.)
            language: Language code (e.g., "en", "es", "fr"). If None, auto-detect.
            task: "transcribe" (default) or "translate" (to English)
        
        Returns:
            Dictionary with transcription text and metadata
        """
        try:
            self._load_model()
            
            if not audio_data:
                raise HTTPException(status_code=400, detail="Audio data cannot be empty")
            
            # Save audio data to temporary file for Whisper processing
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                try:
                    temp_file.write(audio_data)
                    temp_file_path = temp_file.name
                    
                    # Load and transcribe audio
                    logger.info(f"Transcribing audio: {len(audio_data)} bytes, language: {language or 'auto'}")
                    
                    kwargs = {"task": task}
                    if language:
                        kwargs["language"] = language
                    
                    result = self.model.transcribe(temp_file_path, **kwargs)
                    
                    # Extract transcription and metadata
                    transcription = result.get("text", "").strip()
                    detected_language = result.get("language", language or "unknown")
                    segments = result.get("segments", [])
                    
                    response = {
                        "text": transcription,
                        "language": detected_language,
                        "segments": [
                            {
                                "start": seg.get("start", 0),
                                "end": seg.get("end", 0),
                                "text": seg.get("text", "").strip(),
                            }
                            for seg in segments
                        ],
                    }
                    
                    logger.info(f"Transcription completed: {len(transcription)} characters, language: {detected_language}")
                    return response
                    
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_file_path):
                        os.unlink(temp_file_path)
                        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"STT error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Speech recognition failed: {str(e)}")
    
    async def speech_to_text_from_file(
        self,
        file: UploadFile,
        language: Optional[str] = None,
        task: str = "transcribe",
    ) -> dict:
        """
        Convert speech from uploaded file to text
        
        Args:
            file: FastAPI UploadFile object
            language: Language code (e.g., "en", "es", "fr"). If None, auto-detect.
            task: "transcribe" (default) or "translate" (to English)
        
        Returns:
            Dictionary with transcription text and metadata
        """
        try:
            audio_data = await file.read()
            return await self.speech_to_text(audio_data, language=language, task=task)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"STT file processing error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Speech recognition failed: {str(e)}")


# Global STT service instance
_stt_service: Optional[STTService] = None

def get_stt_service() -> STTService:
    """Get or create STT service instance (singleton)"""
    global _stt_service
    if _stt_service is None:
        # Use base model for good balance of speed and accuracy
        # Can be configured via environment variable
        model_name = os.getenv("WHISPER_MODEL", "base")
        _stt_service = STTService(model_name=model_name)
    return _stt_service

