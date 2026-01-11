"""
Text-to-Speech (TTS) Service using Microsoft Edge TTS

This service provides high-quality neural voice synthesis using Microsoft Edge TTS.
It supports multiple languages and voices with low latency and high-quality output.
"""

import asyncio
import logging
import io
from typing import Optional
import edge_tts
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class TTSService:
    """Text-to-Speech service using Microsoft Edge TTS"""
    
    def __init__(self):
        self.voice: Optional[str] = "en-US-AriaNeural"  # Default neural voice
        self.rate: str = "+0%"
        self.pitch: str = "+0Hz"
        self.volume: str = "+0%"
        self._voice_cache: Optional[list] = None
    
    async def get_available_voices(self) -> list:
        """Get list of available voices"""
        try:
            if self._voice_cache is None:
                voices = await edge_tts.list_voices()
                self._voice_cache = [
                    {
                        "name": voice["Name"],
                        "locale": voice["Locale"],
                        "gender": voice["Gender"],
                        "short_name": voice["ShortName"],
                    }
                    for voice in voices
                ]
            return self._voice_cache
        except Exception as e:
            logger.error(f"Error fetching voices: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch voices: {str(e)}")
    
    async def text_to_speech(
        self,
        text: str,
        voice: Optional[str] = None,
        rate: Optional[str] = None,
        pitch: Optional[str] = None,
        volume: Optional[str] = None,
        max_retries: int = 3,
    ) -> bytes:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert to speech
            voice: Voice name (e.g., "en-US-AriaNeural"). Defaults to instance voice.
            rate: Speech rate (e.g., "+0%", "-10%", "+20%"). Defaults to instance rate.
            pitch: Speech pitch (e.g., "+0Hz", "-50Hz", "+50Hz"). Defaults to instance pitch.
            volume: Speech volume (e.g., "+0%", "-10%", "+20%"). Defaults to instance volume.
            max_retries: Maximum number of retry attempts (default: 3)
        
        Returns:
            Audio data as bytes (MP3 format)
        """
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Use provided parameters or defaults
        voice_name = voice or self.voice
        speech_rate = rate or self.rate
        speech_pitch = pitch or self.pitch
        speech_volume = volume or self.volume
        
        last_error = None
        for attempt in range(max_retries):
            try:
                # Generate audio using edge_tts
                communicate = edge_tts.Communicate(text, voice_name, rate=speech_rate, pitch=speech_pitch, volume=speech_volume)
                
                # Collect audio chunks
                audio_data = io.BytesIO()
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_data.write(chunk["data"])
                
                audio_bytes = audio_data.getvalue()
                
                if not audio_bytes:
                    raise HTTPException(status_code=500, detail="Failed to generate audio: empty response")
                
                logger.info(f"Generated TTS audio: {len(audio_bytes)} bytes for {len(text)} characters")
                return audio_bytes
                
            except HTTPException:
                raise
            except Exception as e:
                last_error = e
                error_str = str(e)
                
                # Check if it's a 403/rate limit error
                if "403" in error_str or "WSServerHandshakeError" in error_str:
                    if attempt < max_retries - 1:
                        # Exponential backoff: wait 1s, 2s, 4s
                        wait_time = 2 ** attempt
                        logger.warning(f"TTS rate limit/403 error (attempt {attempt + 1}/{max_retries}), retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        # Final attempt failed
                        logger.error(f"TTS failed after {max_retries} attempts: {error_str}")
                        raise HTTPException(
                            status_code=503,
                            detail="TTS service is currently unavailable (rate limited). Please try again in a moment."
                        )
                else:
                    # Other errors - don't retry
                    logger.error(f"TTS error: {error_str}", exc_info=True)
                    raise HTTPException(
                        status_code=500,
                        detail=f"TTS generation failed: {error_str}"
                    )
        
        # Should not reach here, but just in case
        raise HTTPException(
            status_code=503,
            detail=f"TTS service unavailable after {max_retries} attempts: {str(last_error)}"
        )
    
    async def text_to_speech_stream(
        self,
        text: str,
        voice: Optional[str] = None,
        rate: Optional[str] = None,
        pitch: Optional[str] = None,
        volume: Optional[str] = None,
    ):
        """
        Convert text to speech with streaming audio output
        
        Yields audio chunks as they are generated for lower latency
        """
        try:
            if not text or not text.strip():
                raise HTTPException(status_code=400, detail="Text cannot be empty")
            
            voice_name = voice or self.voice
            speech_rate = rate or self.rate
            speech_pitch = pitch or self.pitch
            speech_volume = volume or self.volume
            
            communicate = edge_tts.Communicate(text, voice_name, rate=speech_rate, pitch=speech_pitch, volume=speech_volume)
            
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
                    
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"TTS streaming error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"TTS streaming failed: {str(e)}")


# Global TTS service instance
_tts_service: Optional[TTSService] = None

def get_tts_service() -> TTSService:
    """Get or create TTS service instance (singleton)"""
    global _tts_service
    if _tts_service is None:
        _tts_service = TTSService()
    return _tts_service

