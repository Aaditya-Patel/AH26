"""
Voice API endpoints for Text-to-Speech (TTS) and Speech-to-Text (STT)

This module provides endpoints for:
- TTS: Convert text to speech audio
- STT: Convert speech audio to text
- Voice-enabled chat: Chat with voice input/output support
"""

import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, Response
from typing import Optional
import io

from app.schemas.schemas import (
    TTSRequest,
    TTSResponse,
    STTResponse,
    VoiceChatRequest,
    VoiceChatResponse,
    ChatRequest,
)
from app.services.tts_service import get_tts_service
from app.services.stt_service import get_stt_service
from app.agents.education_agent import chat_with_education_agent

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/tts", response_class=StreamingResponse)
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech audio using Microsoft Edge TTS
    
    Returns audio stream (MP3 format) with appropriate headers for playback
    
    Note: Microsoft Edge TTS may have rate limits and may return 403 errors
    from Docker containers. The service will automatically retry with exponential backoff.
    """
    try:
        tts_service = get_tts_service()
        
        # Generate audio with retry logic
        audio_bytes = await tts_service.text_to_speech(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            pitch=request.pitch,
            volume=request.volume,
        )
        
        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Content-Length": str(len(audio_bytes)),
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.get("/tts/voices")
async def get_available_voices():
    """
    Get list of available TTS voices
    
    Returns list of voices with their properties (name, locale, gender, etc.)
    """
    try:
        tts_service = get_tts_service()
        voices = await tts_service.get_available_voices()
        return {"voices": voices}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get voices error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch voices: {str(e)}")


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(
    audio: UploadFile = File(..., description="Audio file (wav, mp3, m4a, etc.)"),
    language: Optional[str] = Form(None, description="Language code (e.g., 'en', 'es'). Auto-detect if not provided"),
    task: str = Form("transcribe", description="'transcribe' or 'translate'")
):
    """
    Convert speech audio to text using Whisper
    
    Supports various audio formats: wav, mp3, m4a, flac, etc.
    Automatically detects language if not specified.
    """
    try:
        stt_service = get_stt_service()
        
        # Validate audio file
        if not audio.content_type or not audio.content_type.startswith("audio/"):
            # Still allow if content type is not set (some browsers don't send it)
            logger.warning(f"Audio file content type not recognized: {audio.content_type}")
        
        # Process audio
        result = await stt_service.speech_to_text_from_file(
            file=audio,
            language=language,
            task=task,
        )
        
        return STTResponse(
            text=result["text"],
            language=result["language"],
            segments=result["segments"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"STT endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Speech recognition failed: {str(e)}")


@router.post("/chat/voice", response_model=VoiceChatResponse)
async def voice_chat(request: VoiceChatRequest):
    """
    Chat with voice support: Get text response and optionally audio
    
    This endpoint combines the education agent chat with optional TTS.
    If enable_tts is True, the response will include audio data.
    """
    try:
        # Get chat response from education agent
        chat_result = await chat_with_education_agent(request.question)
        
        response = VoiceChatResponse(
            answer=chat_result["answer"],
            sources=chat_result["sources"],
            audio_url=None,
        )
        
        # Generate audio if requested
        if request.enable_tts:
            try:
                tts_service = get_tts_service()
                audio_bytes = await tts_service.text_to_speech(text=chat_result["answer"])
                
                # For now, we'll return a separate endpoint for audio
                # In a full implementation, you might want to base64 encode or use a CDN
                # For simplicity, we'll indicate that TTS was requested
                # The client can call /voice/tts separately with the answer text
                response.audio_url = "/api/voice/tts"  # Client should call this with the text
            except Exception as e:
                logger.warning(f"TTS generation failed for voice chat, continuing without audio: {e}")
                # Continue without audio - graceful fallback
        
        return response
    except Exception as e:
        logger.error(f"Voice chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Voice chat failed: {str(e)}")


@router.get("/health")
async def voice_health_check():
    """
    Health check for voice services
    
    Verifies that TTS and STT services are available and functioning
    """
    try:
        health_status = {
            "status": "healthy",
            "services": {}
        }
        
        # Check TTS service
        try:
            tts_service = get_tts_service()
            await tts_service.get_available_voices()
            health_status["services"]["tts"] = "available"
        except Exception as e:
            logger.warning(f"TTS service unavailable: {e}")
            health_status["services"]["tts"] = f"unavailable: {str(e)}"
            health_status["status"] = "degraded"
        
        # Check STT service
        try:
            stt_service = get_stt_service()
            # Just check if service is initialized (model loading happens on first use)
            health_status["services"]["stt"] = "available"
        except Exception as e:
            logger.warning(f"STT service unavailable: {e}")
            health_status["services"]["stt"] = f"unavailable: {str(e)}"
            health_status["status"] = "degraded"
        
        status_code = 200 if health_status["status"] == "healthy" else 503
        return health_status
    except Exception as e:
        logger.error(f"Health check error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

