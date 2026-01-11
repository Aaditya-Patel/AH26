import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Send, HelpCircle, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import { verificationAPI } from '../api/client';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  'What documents do I need for verification?',
  'How does the verification process work?',
  'What is GCI registration?',
  'How long does verification take?',
  'What happens if my documents are rejected?',
];

export default function VerificationAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Verification Assistant. I\'m here to help you understand the verification process, required documents, and answer any questions about verification. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (message?: string) => {
    const question = message || input.trim();
    if (!question || loading) return;
    
    setInput('');
    setLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: question }]);

    try {
      const response = await verificationAPI.assistantChat(question);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an error: ${error.response?.data?.detail || error.message}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 mb-4 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-display mb-2">
              Verification <GradientText>Assistant</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Get help with document verification and requirements
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6 h-[600px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "flex",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            message.role === 'user'
                              ? "bg-swachh-green-500 text-white"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about verification..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !input.trim()}
                    variant="gradient"
                    size="icon"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </GlassCard>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-4">
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-swachh-green-500" />
                  <h3 className="font-semibold">Suggested Questions</h3>
                </div>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      disabled={loading}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-swachh-green-500/50 hover:bg-muted/50 transition-all text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-swachh-marigold-500" />
                  <h3 className="font-semibold">Quick Info</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    The verification assistant can help you with:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Document requirements</li>
                    <li>Verification process</li>
                    <li>GCI registration</li>
                    <li>Common questions</li>
                  </ul>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
