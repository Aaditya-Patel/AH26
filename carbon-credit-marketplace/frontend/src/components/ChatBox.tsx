import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { voiceAPI } from '@/api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatBox({ messages, onSendMessage, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [isTTSPlaying, setIsTTSPlaying] = useState<number | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice recording hook
  const {
    isRecording,
    isProcessing: isSTTProcessing,
    error: voiceError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    onTranscript: async (audioFile: File) => {
      try {
        setTtsError(null);
        const result = await voiceAPI.speechToText(audioFile);
        if (result.text && result.text.trim()) {
          setInput(result.text);
          // Optionally auto-send the transcribed text
          // onSendMessage(result.text);
        }
      } catch (error: any) {
        setTtsError(error.message || 'Failed to transcribe audio');
        console.error('STT error:', error);
      }
    },
    onError: (error) => {
      setTtsError(error.message);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      setTtsError(null);
      await startRecording();
    }
  };

  const handlePlayTTS = async (messageIndex: number, text: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setTtsError(null);
      setIsTTSPlaying(messageIndex);

      // Generate audio
      const audioBlob = await voiceAPI.textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsTTSPlaying(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsTTSPlaying(null);
        setTtsError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error: any) {
      setIsTTSPlaying(null);
      setTtsError(error.message || 'Failed to generate or play audio');
      console.error('TTS error:', error);
    }
  };

  const handleStopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsTTSPlaying(null);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4",
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-swachh-green-500 to-swachh-green-600 text-white rounded-br-md'
                    : 'glass rounded-bl-md'
                )}
              >
                {/* Assistant Avatar */}
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-swachh-green-500">AI Agent</span>
                  </div>
                )}
                
                {/* User Avatar */}
                {message.role === 'user' && (
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    <span className="text-xs font-medium text-white/80">You</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{message.content}</p>
                  
                  {/* TTS Play Button for Assistant Messages */}
                  {message.role === 'assistant' && message.content && (
                    <button
                      onClick={() => {
                        if (isTTSPlaying === index) {
                          handleStopTTS();
                        } else {
                          handlePlayTTS(index, message.content);
                        }
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors flex-shrink-0",
                        isTTSPlaying === index
                          ? "bg-swachh-green-500/20 text-swachh-green-500"
                          : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                      )}
                      title={isTTSPlaying === index ? "Stop audio" : "Play audio"}
                    >
                      {isTTSPlaying === index ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      Sources
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, i) => (
                        <Badge key={i} variant="glass" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass rounded-2xl rounded-bl-md p-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white animate-pulse" />
                </div>
                <div className="flex space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-swachh-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-swachh-marigold-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-swachh-saffron rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Messages */}
      {(ttsError || voiceError) && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-500">
            {ttsError || voiceError}
          </p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
        <div className="flex space-x-2">
          {/* Voice Record Button */}
          <Button
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={handleVoiceRecord}
            disabled={isLoading || isSTTProcessing}
            className={cn(
              "flex-shrink-0",
              isRecording && "animate-pulse"
            )}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isSTTProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Recording... (click mic to stop)" : "Ask a question or use voice..."}
            disabled={isLoading || isRecording || isSTTProcessing}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="gradient"
            disabled={isLoading || !input.trim() || isRecording || isSTTProcessing}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Recording... Click the microphone to stop</span>
          </div>
        )}
        
        {/* Processing Indicator */}
        {isSTTProcessing && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing audio...</span>
          </div>
        )}
      </form>
    </div>
  );
}
