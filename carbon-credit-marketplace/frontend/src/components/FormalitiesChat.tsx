import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, HelpCircle, CheckCircle2, Circle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formalitiesAPI } from '../api/client';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationState {
  user_type?: string | null;
  current_workflow?: string | null;
  current_step?: number | null;
  completed_steps?: number[];
  conversation_history?: Array<{ role: string; content: string }>;
  context?: Record<string, any>;
}

interface FormalitiesChatProps {
  className?: string;
}

export default function FormalitiesChat({ className }: FormalitiesChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Formalities Advisor. I\'m here to guide you step-by-step through government procedures for carbon credit registration and compliance.\n\nLet\'s start - **Are you a buyer or a seller?** (Please say "buyer" or "seller")',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);

  const handleSendMessage = async (message?: string) => {
    const question = message || input.trim();
    if (!question || loading) return;
    
    setInput('');
    setLoading(true);

    // Add user message and assistant message immediately for streaming
    setMessages((prev) => [...prev, { role: 'user', content: question }, { role: 'assistant', content: '' }]);

    try {
      let accumulatedContent = '';
      
      // #region agent log
      fetch('http://127.0.0.1:7250/ingest/c46cc32a-cd75-4d30-b24d-e8560eec88f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FormalitiesChat.tsx:53',message:'handleSendMessage: starting stream',data:{question,hasState:!!conversationState},timestamp:Date.now(),sessionId:'debug-session',runId:'1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      for await (const chunk of formalitiesAPI.chatStream(question, conversationState)) {
        // Try to parse as JSON (for state updates or errors)
        try {
          const parsed = JSON.parse(chunk);
          
          if (parsed.type === 'state') {
            // #region agent log
            fetch('http://127.0.0.1:7250/ingest/c46cc32a-cd75-4d30-b24d-e8560eec88f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FormalitiesChat.tsx:61',message:'Received state update, finalizing content',data:{contentLength:accumulatedContent.length,contentPreview:accumulatedContent.substring(0,100),hasMarkdown:accumulatedContent.includes('##')||accumulatedContent.includes('**')},timestamp:Date.now(),sessionId:'debug-session',runId:'1',hypothesisId:'A,B'})}).catch(()=>{});
            // #endregion
            
            // Update conversation state
            setConversationState(parsed.conversation_state);
            // Update the last message (assistant) with final content
            setMessages((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex] && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: accumulatedContent,
                };
                
                // #region agent log
                fetch('http://127.0.0.1:7250/ingest/c46cc32a-cd75-4d30-b24d-e8560eec88f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FormalitiesChat.tsx:70',message:'Setting final message content',data:{finalContentLength:accumulatedContent.length,finalContentPreview:accumulatedContent.substring(0,150)},timestamp:Date.now(),sessionId:'debug-session',runId:'1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
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
          
          // #region agent log
          if (accumulatedContent.length % 200 < chunk.length) {
            fetch('http://127.0.0.1:7250/ingest/c46cc32a-cd75-4d30-b24d-e8560eec88f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FormalitiesChat.tsx:81',message:'Accumulating chunk',data:{chunkLength:chunk.length,accumulatedLength:accumulatedContent.length,hasNewlines:accumulatedContent.includes('\n')},timestamp:Date.now(),sessionId:'debug-session',runId:'1',hypothesisId:'A'})}).catch(()=>{});
          }
          // #endregion
          
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

  const getSuggestedActions = (): string[] => {
    const suggestions: string[] = [];
    
    if (!conversationState?.user_type) {
      return [];
    }
    
    if (conversationState.current_workflow && conversationState.current_step) {
      suggestions.push(`Tell me more about Step ${conversationState.current_step}`);
      suggestions.push('What documents do I need for this step?');
      suggestions.push('How do I complete this step?');
    } else if (conversationState.user_type) {
      if (conversationState.user_type === 'buyer') {
        suggestions.push('Help me with buyer registration');
        suggestions.push('Help me with MRV compliance');
      } else {
        suggestions.push('Help me with seller registration');
        suggestions.push('Help me with MRV compliance');
      }
    }
    
    return suggestions;
  };

  const getWorkflowDisplayName = (workflow: string | null | undefined): string => {
    if (!workflow) return '';
    const names: Record<string, string> = {
      'buyer_registration': 'Buyer Registration',
      'seller_registration': 'Seller Registration',
      'mrv_compliance': 'MRV Compliance',
    };
    return names[workflow] || workflow;
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Progress Indicator */}
      {conversationState?.current_workflow && conversationState.current_step && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">Current Progress</h3>
                <p className="text-xs text-muted-foreground">
                  {getWorkflowDisplayName(conversationState.current_workflow)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Step {conversationState.current_step}
              </Badge>
            </div>
            {conversationState.completed_steps && conversationState.completed_steps.length > 0 && (
              <div className="flex items-center space-x-1 mt-2">
                <span className="text-xs text-muted-foreground">Completed:</span>
                {conversationState.completed_steps.map((step) => (
                  <CheckCircle2 key={step} className="w-3 h-3 text-swachh-green-500" />
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

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
                    {/* #region agent log */}
                    {(() => {
                      fetch('http://127.0.0.1:7250/ingest/c46cc32a-cd75-4d30-b24d-e8560eec88f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FormalitiesChat.tsx:205',message:'Rendering ReactMarkdown for assistant message',data:{contentLength:message.content?.length||0,contentPreview:message.content?.substring(0,200)||'empty',hasMarkdown:message.content?.includes('##')||message.content?.includes('**')||false,hasReactMarkdown:typeof ReactMarkdown!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'1',hypothesisId:'B,C,E'})}).catch(()=>{});
                      return null;
                    })()}
                    {/* #endregion */}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      }}
                    >
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

      {/* Suggested Actions */}
      {getSuggestedActions().length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 space-y-2"
        >
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <HelpCircle className="w-3 h-3" />
            <span>Suggested:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getSuggestedActions().map((action, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleSendMessage(action)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-swachh-green-500/50 hover:bg-muted/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {action}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

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
          placeholder="Ask about formalities or workflows..."
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
    </div>
  );
}
