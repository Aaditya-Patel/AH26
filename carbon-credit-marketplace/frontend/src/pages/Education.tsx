import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Send, Sparkles, MessageCircle, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { educationAPI, voiceAPI } from '../api/client';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

const suggestedQuestions = [
  'What are carbon credits?',
  'How does the CCTS work?',
  'What are the 9 industrial sectors covered?',
  'Explain the MRV process',
  'What is carbon trading?',
  'How to offset emissions?',
];

export default function Education() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Education Agent. I\'m here to help you learn about carbon credits, regulations, and market dynamics. Ask me anything!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice recording hook
  const {
    isRecording,
    isProcessing: isSTTProcessing,
    error: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    onTranscript: async (audioFile: File) => {
      try {
        setVoiceError(null);
        const result = await voiceAPI.speechToText(audioFile);
        if (result.text && result.text.trim()) {
          setInput(result.text);
        }
      } catch (error: any) {
        setVoiceError(error.message || 'Failed to transcribe audio');
        console.error('STT error:', error);
      }
    },
    onError: (error) => {
      setVoiceError(error.message);
    },
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleVoiceRecord = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      setVoiceError(null);
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

      setVoiceError(null);
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
        setVoiceError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error: any) {
      setIsTTSPlaying(null);
      setVoiceError(error.message || 'Failed to generate or play audio');
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

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || loading) return;
    
    setInput('');
    setLoading(true);

    // Add user message and assistant message immediately for streaming
    setMessages((prev) => [...prev, { role: 'user', content: message }, { role: 'assistant', content: '' }]);

    try {
      let accumulatedContent = '';
      
      for await (const chunk of educationAPI.chatStream(message)) {
        // Try to parse as JSON (for sources or errors)
        try {
          const parsed = JSON.parse(chunk);
          
          if (parsed.type === 'sources') {
            // Update the last message (assistant) with sources
            setMessages((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex] && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: accumulatedContent,
                  sources: parsed.sources,
                };
              }
              return updated;
            });
            break;
          } else if (parsed.type === 'error') {
            throw new Error(parsed.message);
          }
        } catch {
          // Not JSON, it's a text chunk
          accumulatedContent += chunk;
          
          // Update the last message (assistant) content incrementally
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex] && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: accumulatedContent,
              };
            }
            return updated;
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex] && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: errorMessage,
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                Education <GradientText>Agent</GradientText>
              </h1>
              <p className="text-muted-foreground">Learn about carbon credits and regulations</p>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Container */}
          <div className="lg:col-span-3">
            <GlassCard className="h-[600px] flex flex-col overflow-hidden" hover={false}>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs font-medium text-swachh-green-500">AI Agent</span>
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
                {loading && (
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
              </div>

              {/* Error Messages */}
              {(voiceError || recorderError) && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                  <p className="text-xs text-red-500">
                    {voiceError || recorderError}
                  </p>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-border/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(input);
                  }}
                  className="flex space-x-2"
                >
                  {/* Voice Record Button */}
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={handleVoiceRecord}
                    disabled={loading || isSTTProcessing}
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

                  <div className="flex-1 relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isRecording ? "Recording... (click mic to stop)" : "Ask about carbon credits or use voice..."}
                      className="pl-10 pr-4"
                      disabled={loading || isRecording || isSTTProcessing}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={loading || !input.trim() || isRecording || isSTTProcessing}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                
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
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6" hover={false}>
              <h3 className="font-semibold font-display mb-4 flex items-center">
                <Sparkles className="w-4 h-4 text-swachh-marigold-500 mr-2" />
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="w-full text-left px-4 py-3 glass rounded-lg text-sm hover:bg-swachh-green-500/10 transition-colors disabled:opacity-50"
                    disabled={loading}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Info Card */}
            <GlassCard className="p-6" glow="green">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-swachh-green-500/10 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-swachh-green-500" />
                </div>
                <h4 className="font-semibold mb-2">Knowledge Base</h4>
                <p className="text-xs text-muted-foreground">
                  Our AI is trained on CCTS regulations, carbon market dynamics, and sustainability best practices.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
