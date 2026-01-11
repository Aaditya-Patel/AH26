import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalculatorIcon, Send, Sparkles, MessageCircle, TrendingUp, ArrowRight, Leaf, IndianRupee } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Layout from '../components/Layout';
import { calculatorAPI } from '../api/client';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import 'highlight.js/styles/atom-one-dark.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  calculationResult?: any;
}

export default function Calculator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Calculator Agent. I\'ll help you calculate your carbon emissions. Let\'s start - **Which sector are you in?** (e.g., Cement, Iron & Steel, Textiles, Aluminium, Chlor-Alkali, Fertilizer, Pulp & Paper, Petrochemicals, or Petroleum Refining)',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationState, setConversationState] = useState<any>(null);
  const navigate = useNavigate();

  const handleSendMessage = async (message?: string) => {
    const question = message || input.trim();
    if (!question || loading) return;
    
    setInput('');
    setLoading(true);

    // Add user message and assistant message immediately for streaming
    setMessages((prev) => [...prev, { role: 'user', content: question }, { role: 'assistant', content: '' }]);

    try {
      let accumulatedContent = '';
      
      for await (const chunk of calculatorAPI.chatStream(question, conversationState)) {
        // Try to parse as JSON (for state or errors)
        try {
          const parsed = JSON.parse(chunk);
          
          if (parsed.type === 'state') {
            // Update conversation state
            setConversationState(parsed.conversation_state);
            
            // Update the last message (assistant) with accumulated content
            setMessages((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex] && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: accumulatedContent,
                  calculationResult: parsed.conversation_state.calculation_result,
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

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your Calculator Agent. I\'ll help you calculate your carbon emissions. Let\'s start - **Which sector are you in?** (e.g., Cement, Iron & Steel, Textiles, Aluminium, Chlor-Alkali, Fertilizer, Pulp & Paper, Petrochemicals, or Petroleum Refining)',
      },
    ]);
    setConversationState(null);
    setInput('');
  };

  const handleFindSellers = (result: any) => {
    if (result) {
      navigate('/matching', {
        state: {
          creditsNeeded: result.credits_needed,
          costEstimate: result.cost_estimate,
        },
      });
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-marigold-500 to-swachh-saffron flex items-center justify-center">
              <CalculatorIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                Emission <GradientText>Calculator</GradientText>
              </h1>
              <p className="text-muted-foreground">Calculate your carbon footprint</p>
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
                            ? 'bg-gradient-to-r from-swachh-marigold-500 to-swachh-saffron text-white rounded-br-md'
                            : 'glass rounded-bl-md'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-swachh-marigold-500 to-swachh-saffron flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs font-medium text-swachh-marigold-500">AI Agent</span>
                          </div>
                        )}
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                li: ({ children }) => <li className="text-sm">{children}</li>,
                                code: ({ className, children, ...props }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                pre: ({ children }) => (
                                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-2">
                                    {children}
                                  </pre>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-swachh-marigold-500 pl-4 italic my-2 text-muted-foreground">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => (
                                  <a href={href} className="text-swachh-marigold-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-2">
                                    <table className="min-w-full border-collapse border border-border">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({ children }) => (
                                  <th className="border border-border p-2 bg-muted font-semibold text-left">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="border border-border p-2">
                                    {children}
                                  </td>
                                ),
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                            
                            {/* Action Buttons for Calculation Results */}
                            {message.calculationResult && (
                              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-3">
                                <Button
                                  onClick={() => handleFindSellers(message.calculationResult)}
                                  variant="gradient"
                                  size="sm"
                                  className="flex-1"
                                >
                                  Find Matched Sellers
                                  <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={handleReset}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  New Calculation
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-swachh-marigold-500 to-swachh-saffron flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white animate-pulse" />
                        </div>
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-swachh-marigold-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-swachh-saffron rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-swachh-marigold-600 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex space-x-3"
                >
                  <div className="flex-1 relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Answer the question or ask about calculations..."
                      className="pl-10 pr-4"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={loading || !input.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6" hover={false}>
              <h3 className="font-semibold font-display mb-4 flex items-center">
                <CalculatorIcon className="w-4 h-4 text-swachh-marigold-500 mr-2" />
                About Calculator
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                I'll ask you questions about your operations to calculate your carbon emissions. 
                Answer each question, and I'll provide a detailed breakdown.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Available for all 9 CCTS sectors</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Calculates Scope 1, 2, and 3 emissions</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provides credit requirements</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Cost estimates included</span>
                </div>
              </div>
            </GlassCard>

            {/* Info Card */}
            <GlassCard className="p-6" glow="orange">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-swachh-marigold-500/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-swachh-marigold-500" />
                </div>
                <h4 className="font-semibold mb-2">Emission Factors</h4>
                <p className="text-xs text-muted-foreground">
                  Calculations use standard emission factors for each sector based on CCTS regulations.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
